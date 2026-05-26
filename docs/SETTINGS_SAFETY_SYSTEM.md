# Pulse Settings & Safety System Documentation

## Overview

This document describes the modern settings and safety system for the Pulse productivity/mental health web app, featuring a dynamic hex color theme picker and a comprehensive Panic Mode safety system.

## Features

### 1. Dynamic Hex Colour Theme Picker

#### How It Works

The theme picker allows users to select any hex color and automatically generates a complete theme around it.

**Key Components:**
- `src/lib/colors.ts` - Color utility functions
- `src/lib/themes-enhanced.ts` - Enhanced theme generation
- `src/components/HexColorPicker.tsx` - Color picker UI component
- `src/components/ThemeSettingsPanel.tsx` - Theme settings interface

#### Color Utilities

The color utility system provides functions for:

- **Hex/RGB/HSL Conversion**: Convert between color formats
  ```typescript
  hexToRgb("#FF6B6B") // { r: 255, g: 107, b: 107 }
  rgbToHsl(255, 107, 107) // { h: 0, s: 100, l: 71 }
  ```

- **Shade Generation**: Automatically create lighter and darker variants
  ```typescript
  lighten("#FF6B6B", 20) // Lighter red
  darken("#FF6B6B", 20) // Darker red
  ```

- **Accessibility Checking**: Ensure sufficient contrast
  ```typescript
  getContrastRatio("#FF6B6B", "#FFFFFF") // 3.97:1
  hasAccessibleContrast("#FF6B6B", "#FFFFFF") // true
  ```

- **Smart Text Color**: Determine if text should be light or dark
  ```typescript
  getContrastingTextColor("#FF6B6B") // "light"
  ```

#### Theme Generation Process

When a user selects a color, the system:

1. **Validates the hex color** - Ensures proper format
2. **Generates shades** - Creates light, main, and dark variants
3. **Checks accessibility** - Verifies sufficient contrast ratios
4. **Generates complete theme** - Creates:
   - Background gradient
   - Surface colors (with transparency)
   - Text colors (main and muted)
   - Border colors
   - Accent colors and glows
   - Interactive states (hover, focus)

#### Usage

```typescript
import { HexColorPicker } from "@/components/HexColorPicker";
import { generateThemeFromColor } from "@/lib/themes-enhanced";

function MyComponent() {
  const [color, setColor] = useState("#FF6B6B");
  
  const handleColorChange = (hex: string, theme: ThemeTokens) => {
    // Apply theme to document
    const root = document.documentElement;
    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--accent", theme.accent);
    // ... etc
  };

  return (
    <HexColorPicker
      value={color}
      onColorChange={handleColorChange}
      isDark={false}
      label="Choose Your Theme"
    />
  );
}
```

#### Preset Colors

The system includes 10 preset colors for quick selection:
- Red: `#FF6B6B`
- Teal: `#4ECDC4`
- Blue: `#45B7D1`
- Coral: `#FFA07A`
- Mint: `#98D8C8`
- Yellow: `#F7DC6F`
- Purple: `#BB8FCE`
- Sky: `#85C1E2`
- Peach: `#F8B88B`
- Green: `#52C4A1`

#### Live Preview

Users can preview theme changes before applying with:
- Gradient backgrounds
- Button variations
- Text colors
- Input fields
- Interactive elements

#### Persistence

Settings are saved to:
1. **LocalStorage** - For immediate client-side access
   - `customThemeColor` - Hex color string
   - `customThemeDarkMode` - Boolean for dark mode
2. **User Account** - For cross-device sync (server-side)

---

### 2. Panic Mode Safety System

#### Core Concept

Panic Mode is a distraction-blocking safety feature designed to help users focus by:
- Blocking access to social media and distracting apps
- Displaying a calming minimal interface
- Enabling trusted contacts to approve early exit
- Providing a visible countdown timer
- Including optional breathing exercises and motivational messages

#### Components

**UI Components:**
- `src/components/PanicModeOverlay.tsx` - Full-screen calming interface
- `src/components/PanicModeSettings.tsx` - Configuration panel
- `src/components/PanicModeActivator.tsx` - Activation button and duration picker
- `src/components/PanicModeActivityLog.tsx` - Activity history viewer

**Types:**
- `src/types/panic-mode.ts` - Type definitions for state and data

**API Routes:**
- `/api/panic-mode/unlock-request` - Create/view unlock requests
- `/api/panic-mode/approval` - Handle safety contact approvals
- `/api/panic-mode/activity` - Log and retrieve activity

#### Safety Contact System

Users nominate trusted people who can approve early exit from Panic Mode.

**Managing Safety Contacts:**

```typescript
interface SafetyContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
}
```

**Features:**
- Multiple trusted contacts supported
- SMS and email approval options
- Secure token-based approval links
- 24-hour expiration on approval requests

#### Panic Mode Activation

**Duration Options:**
- 5 minutes
- 15 minutes
- 30 minutes (default)
- 1 hour
- 8 hours

**During Panic Mode:**

Users see:
- Large countdown timer with progress ring
- Breathing exercise animation (4s cycles)
- List of allowed actions:
  - Emergency calls
  - Messages (if configured)
  - Maps (if configured)
  - Banking apps (if configured)
- Safety contact information
- Emergency disable button (for true emergencies)

**Blocked During Panic Mode:**
- Social media (Instagram, TikTok, Twitter, Reddit, YouTube)
- Distracting websites
- Notifications from blocked apps
- Certain browsing capabilities

#### Unlock Request Flow

1. User requests early exit
2. Request sent to safety contact via SMS/email
3. Contact receives secure approval link
4. Contact clicks link or uses approval token
5. System logs the approval
6. User is notified and Panic Mode ends

**Approval Request:**
```typescript
interface UnlockRequest {
  id: string;
  sessionId: string;
  requestedAt: string;
  safetyContactId: string;
  approvalToken: string;
  approved: boolean;
  approvedAt?: string;
  expiresAt: string; // 24 hours from request
}
```

#### Cooldown System

After exiting Panic Mode, there's a cooldown period before a user can start another session immediately. This prevents:
- Rapid toggling on/off
- Repeated attempts to bypass safety measures
- Habitual abuse of the system

#### Focus Recovery Score

The system tracks successful focus sessions and calculates a "Focus Recovery Score" (0-100) based on:
- Number of completed Panic Mode sessions
- Average session duration
- Success rate (sessions completed vs. abandoned)
- Early exit approvals vs. denials
- Consistency (regular usage patterns)

This gamification encourages healthy focus habits.

#### Activity Logging

All activities are logged for transparency and safety:

```typescript
type ActivityType = 
  | "PANIC_START"        // User activated Panic Mode
  | "PANIC_END"         // Panic Mode completed naturally
  | "UNLOCK_REQUESTED"   // User requested early exit
  | "UNLOCK_APPROVED"    // Safety contact approved exit
  | "UNLOCK_DENIED";     // Safety contact denied exit
```

Logs include:
- Timestamp
- User ID
- Session ID
- Associated contacts
- Duration and metadata
- Historical retention for insights

#### Breathing Exercise

During Panic Mode, an animated breathing guide helps users:
- Regulate heart rate
- Reduce anxiety
- Focus on the present moment

**Animation Pattern:**
- 4 seconds inhale (scale up)
- 4 seconds hold
- 4 seconds exhale (scale down)
- Repeats continuously

#### Motivational Messages

Optional messages display during Panic Mode:
- "You're doing great"
- "Focus is a superpower"
- "One step at a time"
- "You've got this"
- Custom user-defined messages

#### Settings

Users can configure:
- Default Panic Mode duration
- Blocked apps list
- Allowed apps list (essentials only)
- Safety contacts
- Motivational messages
- Breathing exercise enabled/disabled
- Cooldown duration before next session

#### Emergency Override

If a true emergency occurs, users can:
- Click the "Emergency: Disable Panic Mode" button
- This still logs the activity for accountability
- Should be used sparingly

---

## Implementation Details

### Settings Page Architecture

The settings page (`src/app/settings/page.tsx`) uses a tabbed interface:

**Tabs:**
1. **Basic** - Calendar, quick theme picker, accessibility options
2. **Themes** - Full color picker and theme customization
3. **Safety** - Panic Mode settings, safety contacts, activity log

### State Management

Uses Zustand store with persistence middleware:

```typescript
interface PanicModeState {
  isActive: boolean;
  sessionId?: string;
  durationMinutes: number;
  safetyContacts: SafetyContact[];
  blockedApps: string[];
  allowedApps: string[];
  cooldownUntil?: string;
  focusRecoveryScore: number;
  sessions: PanicModeSession[];
  unlockRequests: UnlockRequest[];
}
```

### CSS Variables

Dynamic theming uses CSS custom properties:

```css
:root {
  --bg: #f4ebe1;
  --surface: rgba(255, 251, 246, 0.9);
  --surface-solid: #fbf5ee;
  --text: #4a3d33;
  --text-muted: #8a7b6c;
  --border: rgba(81, 63, 47, 0.16);
  --accent: #b98b5d;
  --accent-glow: rgba(185, 139, 93, 0.25);
  --gradient: linear-gradient(...);
}
```

All components use `var(--property)` for dynamic theming.

### Animations

Uses Framer Motion for smooth transitions:
- Theme switching (500ms)
- Breathing exercise (4s cycle)
- Countdown timer
- Component entrance animations
- Hover and tap interactions

---

## API Reference

### Unlock Request Endpoint

**POST `/api/panic-mode/unlock-request`**

Request unlock approval from safety contact.

```typescript
// Request
{
  sessionId: string;
  safetyContactId: string;
  userId: string;
}

// Response
{
  id: string;
  sessionId: string;
  safetyContactId: string;
  requestedAt: string;
  approvalToken: string;
  approved: boolean;
  expiresAt: string;
}
```

**GET `/api/panic-mode/unlock-request?sessionId=...&userId=...`**

Fetch unlock requests for a session.

### Approval Endpoint

**POST `/api/panic-mode/approval`**

Safety contact approves or denies early exit.

```typescript
// Request
{
  unlockRequestId: string;
  approvalToken: string;
  safetyContactId: string;
  approved: boolean;
}

// Response
{
  id: string;
  unlockRequestId: string;
  safetyContactId: string;
  approved: boolean;
  approvedAt: string;
}
```

**GET `/api/panic-mode/approval?unlockRequestId=...`**

Check approval status.

### Activity Log Endpoint

**POST `/api/panic-mode/activity`**

Log a panic mode event.

```typescript
// Request
{
  userId: string;
  type: ActivityType;
  sessionId?: string;
  unlockRequestId?: string;
  safetyContactId?: string;
  metadata?: Record<string, any>;
}

// Response
{
  id: string;
  userId: string;
  type: ActivityType;
  timestamp: string;
}
```

**GET `/api/panic-mode/activity?userId=...&limit=100&type=...`**

Fetch activity history.

---

## Security Considerations

1. **Approval Tokens**: One-time use tokens with expiration
2. **Activity Logging**: All actions logged for accountability
3. **Access Control**: Users can only manage their own data
4. **Emergency Override**: Logs when used for accountability
5. **Contact Verification**: Phone/email verification before approval
6. **SSL/TLS**: All API calls over HTTPS in production
7. **Rate Limiting**: Prevent brute force on approval tokens
8. **Cooldown Periods**: Prevent rapid system abuse

---

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support (responsive design)

## Accessibility

- WCAG AA color contrast compliance
- Keyboard navigation fully supported
- Screen reader friendly
- Dyslexia-friendly font option
- High contrast mode option
- Reduced motion support

---

## Future Enhancements

1. **Wearable Integration**: Heart rate monitoring
2. **AI Insights**: ML-based focus recommendations
3. **Smart Blocking**: ML to detect distracting apps
4. **Social Accountability**: Shared focus sessions
5. **Integrations**: Slack, Discord, Teams notifications
6. **Calendar Integration**: Auto-activate during study blocks
7. **Music/Ambient Sounds**: Focus soundscapes
8. **Family Controls**: Parent oversight options

---

## Troubleshooting

### Theme Not Applying

1. Clear browser cache
2. Check CSS variable names
3. Verify color format is valid hex

### Panic Mode Not Blocking Apps

1. Ensure browser supports app blocking
2. Check blocked apps list is configured
3. Verify OS-level settings allow blocking

### Safety Contact Not Receiving Approval

1. Verify phone/email is correct
2. Check email spam folder
3. Ensure SMS provider is configured
4. Verify contact approved notification settings

### Activity Log Not Recording

1. Verify API endpoint is accessible
2. Check user ID is correct
3. Ensure localStorage is enabled
4. Check browser console for errors

---

## Support & Resources

For implementation support:
- Review component source code
- Check TypeScript types
- Refer to API documentation
- Test with provided presets

For user support:
- In-app help tooltips
- Settings documentation
- Safety mode warnings
- Emergency contact information
