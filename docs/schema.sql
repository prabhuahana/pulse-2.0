-- Pulse — PostgreSQL schema (v1)
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector for embeddings

-- =============================================================================
-- ENUMS
-- =============================================================================
CREATE TYPE item_type AS ENUM (
  'task', 'reminder', 'event', 'deadline', 'routine', 'note'
);
CREATE TYPE item_status AS ENUM (
  'inbox', 'active', 'scheduled', 'in_progress', 'completed', 'cancelled', 'archived'
);
CREATE TYPE urgency_band AS ENUM ('critical', 'high', 'medium', 'low', 'none');
CREATE TYPE color_tag AS ENUM ('red', 'orange', 'yellow', 'green', 'blue', 'purple');
CREATE TYPE theme_preset AS ENUM (
  'dark', 'pastel', 'monochrome', 'glass', 'anime', 'neon'
);
CREATE TYPE calendar_provider AS ENUM ('google', 'apple', 'outlook');
CREATE TYPE sync_direction AS ENUM ('import', 'export', 'two_way');
CREATE TYPE lms_provider AS ENUM (
  'google_classroom', 'teams', 'canvas', 'moodle', 'notion', 'email'
);
CREATE TYPE submission_status AS ENUM (
  'draft', 'pending_review', 'revision_required', 'verified', 'submitted_external'
);
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'in_app', 'sms');
CREATE TYPE view_mode AS ENUM ('list', 'kanban', 'timeline', 'calendar');

-- =============================================================================
-- USERS & AUTH
-- =============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  onboarding_completed_at TIMESTAMPTZ,
  productivity_score INT DEFAULT 0,
  xp_total INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- google | apple | email
  provider_user_id TEXT,
  password_hash TEXT, -- null for OAuth-only
  UNIQUE (provider, provider_user_id)
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PREFERENCES & THEMES
-- =============================================================================
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme_preset theme_preset DEFAULT 'pastel',
  custom_theme JSONB DEFAULT '{}', -- colors, radius, shadows
  font_family TEXT DEFAULT 'Inter',
  dyslexia_font_enabled BOOLEAN DEFAULT FALSE,
  high_contrast BOOLEAN DEFAULT FALSE,
  reduced_motion BOOLEAN DEFAULT FALSE,
  default_view view_mode DEFAULT 'list',
  home_layout JSONB DEFAULT '[]', -- widget order
  focus_duration_min INT DEFAULT 25,
  break_duration_min INT DEFAULT 5,
  panic_mode_enabled BOOLEAN DEFAULT TRUE,
  no_escape_mode BOOLEAN DEFAULT FALSE,
  accountability_mode BOOLEAN DEFAULT FALSE,
  submission_verification_required BOOLEAN DEFAULT TRUE,
  notification_quiet_hours JSONB, -- { start, end }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ITEMS (tasks, reminders, events, etc.)
-- =============================================================================
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type item_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status item_status NOT NULL DEFAULT 'inbox',
  -- Scheduling
  due_at TIMESTAMPTZ,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  estimated_minutes INT,
  completed_at TIMESTAMPTZ,
  -- AI scores (0–100)
  urgency_score INT DEFAULT 50,
  importance_score INT DEFAULT 50,
  stress_score INT DEFAULT 30,
  energy_required INT DEFAULT 50, -- low energy = low value
  -- Derived
  urgency_band urgency_band DEFAULT 'medium',
  color_tag color_tag DEFAULT 'yellow',
  smart_section TEXT, -- Do Now, Can Wait, etc.
  sort_key NUMERIC GENERATED ALWAYS AS (
    urgency_score * 2 + importance_score + COALESCE(
      EXTRACT(EPOCH FROM (due_at - NOW())) / 3600 * -1, 0
    )
  ) STORED,
  -- Recurrence
  recurrence_rule TEXT, -- RRULE
  parent_item_id UUID REFERENCES items(id),
  -- Links
  assignment_id UUID, -- FK added after assignments table
  calendar_event_id UUID,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_user_section ON items(user_id, smart_section, status);
CREATE INDEX idx_items_user_due ON items(user_id, due_at) WHERE status != 'completed';
CREATE INDEX idx_items_embedding ON items USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE item_tags (
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (item_id, tag)
);

CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  estimated_minutes INT
);

-- =============================================================================
-- PRODUCTIVITY PATTERNS (AI learning)
-- =============================================================================
CREATE TABLE productivity_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- procrastination | peak_hours | avg_completion
  payload JSONB NOT NULL,
  confidence NUMERIC(4,3) DEFAULT 0.5,
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, pattern_type)
);

-- =============================================================================
-- CALENDAR SYNC
-- =============================================================================
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider calendar_provider NOT NULL,
  external_account_id TEXT,
  access_token_encrypted BYTEA,
  refresh_token_encrypted BYTEA,
  token_expires_at TIMESTAMPTZ,
  sync_direction sync_direction DEFAULT 'two_way',
  last_sync_at TIMESTAMPTZ,
  sync_cursor TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
  external_event_id TEXT NOT NULL,
  item_id UUID REFERENCES items(id),
  title TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  raw_payload JSONB,
  UNIQUE (connection_id, external_event_id)
);

CREATE TABLE focus_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  is_ai_suggested BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'scheduled' -- scheduled | active | completed | skipped
);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
CREATE TABLE notification_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fcm_token TEXT,
  apns_token TEXT,
  platform TEXT, -- ios | android | web
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  channel notification_channel NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  escalation_level INT DEFAULT 0,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  ignored_count INT DEFAULT 0,
  payload JSONB DEFAULT '{}'
);

-- =============================================================================
-- SCHOOL / WORK — LMS
-- =============================================================================
CREATE TABLE imported_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lms_provider lms_provider NOT NULL,
  external_course_id TEXT NOT NULL,
  name TEXT NOT NULL,
  section TEXT,
  color_tag color_tag DEFAULT 'purple',
  last_synced_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE (user_id, lms_provider, external_course_id)
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES imported_courses(id) ON DELETE CASCADE,
  external_assignment_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  instructions_plain TEXT,
  due_at TIMESTAMPTZ,
  points_possible NUMERIC,
  submission_types JSONB, -- ['file','link','text']
  rubric_url TEXT,
  lms_submission_state TEXT, -- CREATED | TURNED_IN | etc.
  item_id UUID REFERENCES items(id),
  requires_in_app_submission BOOLEAN DEFAULT TRUE,
  reminder_escalation_level INT DEFAULT 0,
  is_submitted_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE items ADD CONSTRAINT fk_items_assignment
  FOREIGN KEY (assignment_id) REFERENCES assignments(id);

CREATE TABLE rubric_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL,
  description TEXT,
  max_points NUMERIC,
  is_required BOOLEAN DEFAULT TRUE,
  parsed_from TEXT -- rubric_pdf | manual | ai
);

CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  status submission_status NOT NULL DEFAULT 'draft',
  file_urls TEXT[],
  text_content TEXT,
  ocr_text TEXT,
  external_submission_id TEXT,
  submitted_at TIMESTAMPTZ,
  lms_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE completion_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES assignment_submissions(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  passed BOOLEAN NOT NULL,
  block_reason TEXT,
  ai_confidence NUMERIC(4,3)
);

CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  feedback JSONB NOT NULL, -- structured issues + suggestions
  quality_score INT, -- 0-100
  missing_requirements TEXT[],
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id),
  item_id UUID REFERENCES items(id),
  session_type TEXT, -- revision | focus | quiz
  planned_start TIMESTAMPTZ,
  planned_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  notes TEXT
);

-- =============================================================================
-- GAMIFICATION & SOCIAL
-- =============================================================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INT DEFAULT 0
);

CREATE TABLE user_achievements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE virtual_pets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  species TEXT DEFAULT 'sprout',
  growth_stage INT DEFAULT 0,
  health INT DEFAULT 100,
  last_fed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE shared_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE space_members (
  space_id UUID REFERENCES shared_spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  PRIMARY KEY (space_id, user_id)
);

-- =============================================================================
-- MOOD, JOURNAL, BRAIN DUMP
-- =============================================================================
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood INT CHECK (mood BETWEEN 1 AND 5),
  energy INT CHECK (energy BETWEEN 1 AND 5),
  note TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type TEXT, -- reflection | brain_dump | weekly_reset
  content TEXT NOT NULL,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- AI ASSISTANT LOGS
-- =============================================================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- user | assistant | system
  content TEXT NOT NULL,
  tool_calls JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
