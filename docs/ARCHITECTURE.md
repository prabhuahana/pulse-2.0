# System Architecture & Data Flow

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Interface                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │  Theme Settings  │         │  Panic Mode      │              │
│  │     Panel        │         │   Settings       │              │
│  ├──────────────────┤         ├──────────────────┤              │
│  │ • Color Picker   │         │ • Duration       │              │
│  │ • Preset Colors  │         │ • Contacts       │              │
│  │ • Preview        │         │ • Blocked Apps   │              │
│  │ • Dark Mode      │         │ • Allowed Apps   │              │
│  │ • Live Preview   │         │ • Recovery Score │              │
│  └────────┬─────────┘         └────────┬─────────┘              │
│           │                            │                        │
└───────────┼────────────────────────────┼────────────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     State Management                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│         Zustand Store (usePulseStore)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • theme: ThemePreset | "custom"                         │   │
│  │ • customThemeColor: string                              │   │
│  │ • panicMode: boolean                                    │   │
│  │ • panicModeSession: {...}                               │   │
│  │ • safetyContacts: SafetyContact[]                        │   │
│  │ • setTheme(theme, hex?)                                 │   │
│  │ • togglePanicMode()                                     │   │
│  └──────────────┬────────────────────────────────────────┬─┘   │
│                 │                                        │       │
│            ┌────▼────┐                          ┌──────▼───┐   │
│            │LocalStore│                        │  Backend  │   │
│            └──────────┘                        └───────────┘   │
│                                                                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Components                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Theme Components           Panic Mode Components              │
│  ├─ HexColorPicker          ├─ PanicModeOverlay               │
│  ├─ ThemeSettingsPanel      ├─ PanicModeActivator            │
│  └─ ThemeProvider           ├─ PanicModeSettings             │
│                             └─ PanicModeActivityLog           │
│                                                                 │
└──────────────────────┬─────────────────────┬────────────────────┘
                       │                     │
                       ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Utility Libraries                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Color System                Theme System                        │
│  ├─ hexToRgb()               ├─ generateThemeFromColor()       │
│  ├─ lighten()/darken()       ├─ PRESET_COLORS                 │
│  ├─ getContrastRatio()       └─ THEMES                         │
│  ├─ hasAccessibleContrast()                                     │
│  └─ createThemeColor()                                          │
│                                                                   │
└──────────────────────┬─────────────────────┬────────────────────┘
                       │                     │
                       ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Panic Mode Endpoints:                                           │
│  ├─ POST   /api/panic-mode/unlock-request                      │
│  ├─ GET    /api/panic-mode/unlock-request                      │
│  ├─ POST   /api/panic-mode/approval                            │
│  ├─ GET    /api/panic-mode/approval                            │
│  ├─ POST   /api/panic-mode/activity                            │
│  └─ GET    /api/panic-mode/activity                            │
│                                                                   │
└──────────────────────┬─────────────────────┬────────────────────┘
                       │                     │
                       └──────────┬──────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  (In production: PostgreSQL, MongoDB, etc.)                     │
│  (Current: In-memory Map for demo)                              │
│                                                                   │
│  ├─ Activity Logs                                                │
│  ├─ Unlock Requests                                              │
│  ├─ Approvals                                                    │
│  ├─ User Preferences                                             │
│  └─ Safety Contacts                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Theme Flow

```
User Input
    │
    ▼
┌─────────────────────────┐
│  Hex Color Validation   │
│  (normalizeHex,         │
│   isValidHex)           │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Color Analysis          │
│  • hexToRgb()            │
│  • rgbToHsl()            │
│  • getLuminance()        │
│  • getContrastRatio()    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Shade Generation        │
│  • lighten() x2          │
│  • darken() x2           │
│  → {light, main, dark}   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Full Theme Creation     │
│  generateThemeFromColor()│
│  (background, surface,   │
│   text, accent, etc.)    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Accessibility Check     │
│  hasAccessibleContrast() │
│  (WCAG AA: 4.5:1)        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Live Preview            │
│  Show sample components  │
│  with new theme          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  User Confirmation       │
│  Click "Apply"           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Theme Application           │
│  • Set CSS variables         │
│  • Store in localStorage     │
│  • Update user account       │
│  • Emit animations (500ms)   │
└──────────────────────────────┘
```

## 🚨 Panic Mode Flow

```
User Triggers Panic Mode
    │
    ▼
┌──────────────────────────────┐
│  Select Duration             │
│  • 5m, 15m, 30m, 1h, 8h     │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Create Session              │
│  • Generate sessionId        │
│  • Calculate endTime         │
│  • Log PANIC_START activity  │
│  • Trigger app blocking      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Show Overlay                │
│  • Full-screen interface     │
│  • Start countdown           │
│  • Breathing animation       │
│  • Display safe contacts     │
└────────┬─────────────────────┘
         │
         ├─────────┬────────────────────┐
         │         │                    │
         ▼         ▼                    ▼
    ┌────────┐  ┌───────────┐    ┌──────────────┐
    │ Natural│  │User Requests│  │Emergency     │
    │ Expiry │  │Early Exit   │  │Override      │
    └────┬───┘  └──────┬──────┘  └────┬─────────┘
         │             │              │
         │             ▼              │
         │        ┌─────────────────┐ │
         │        │Create Unlock    │ │
         │        │Request          │ │
         │        └────────┬────────┘ │
         │                 │          │
         │                 ▼          │
         │        ┌──────────────────┐│
         │        │Send to Safety    ││
         │        │Contact (SMS/Email││
         │        └────────┬─────────┘│
         │                 │          │
         │        ┌────────▼──────┐   │
         │        │Wait for       │   │
         │        │Approval       │   │
         │        └────────┬──────┘   │
         │                 │          │
         │        ┌────────▼──────────┐│
         │        │Check Approval     ││
         │        │Status (Polling)   ││
         │        └────┬──────────┬───┘│
         │             │          │    │
         │          Approved  Denied   │
         │             │          │    │
         │             ▼          ▼    │
         │        ┌────┬────┐    │     │
         │        │UNLOCK │    │     │
         │        │APPROVED│   │     │
         │        └────┬────┘   ▼     │
         │             │      ┌───────┘
         │             │      │ Denied/Timeout
         │             │      │ (continue session)
         │             │      │
         └─────────────┼──────┘
                       │
                       ▼
         ┌──────────────────────────┐
         │ End Panic Mode Session   │
         │ • Log PANIC_END activity │
         │ • Calculate recovery     │
         │ • Clear blockings        │
         │ • Update score           │
         └──────────────────────────┘
```

## 📡 API Request Flow

```
┌─────────────────────────────────┐
│   Create Unlock Request         │
│   POST /api/panic-mode/...      │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Generate approval token         │
│  Set 24-hour expiration          │
│  Store in database               │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Send Notification to Contact    │
│  • SMS with approval link        │
│  • Email with secure token       │
│  • In-app notification (optional)│
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Poll for Approval Status        │
│  GET /api/panic-mode/approval    │
│  (Every 5 seconds)               │
└────────┬────────────────────────┘
         │
         ├──────────┬──────────┐
         │          │          │
         ▼          ▼          ▼
    ┌─────────┐ ┌───────┐ ┌──────────┐
    │Approved │ │Denied │ │Expired   │
    └────┬────┘ └───┬───┘ └────┬─────┘
         │          │          │
         ▼          ▼          ▼
    ┌────────────────────────────┐
    │ Log Activity               │
    │ POST /api/panic-mode/...   │
    │ (UNLOCK_APPROVED, etc.)    │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ End Session                │
    │ (if approved)              │
    │ Continue (if denied)       │
    └────────────────────────────┘
```

## 📊 State Management Flow

```
┌─────────────────────────────────┐
│     Initial State               │
│  (from localStorage/backend)    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│    React Component              │
│  (reads from store)             │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  User Interaction               │
│  (click, input, etc.)           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Handler Function               │
│  (onThemeChange, onActivate...) │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  API Call (if needed)           │
│  POST/GET /api/...              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Update Zustand Store           │
│  usePulseStore.setState(...)    │
└────────┬────────────────────────┘
         │
         ├─────┬──────────┐
         │     │          │
         ▼     ▼          ▼
    ┌────┐ ┌────────┐  ┌──────────┐
    │Local│ │Backend │  │Listeners │
    │Store│ │Update  │  │Triggered │
    └────┘ └────────┘  └──────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Component Re-render            │
│  (with new state)               │
└─────────────────────────────────┘
```

## 🔄 Data Persistence

```
Client Side:
┌──────────────────────────────────┐
│  LocalStorage                    │
│  • customThemeColor              │
│  • customThemeDarkMode           │
│  • User preferences              │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Zustand Store                   │
│  (in-memory, persisted via       │
│   middleware)                    │
└──────────────────────────────────┘

Server Side:
┌──────────────────────────────────┐
│  Next.js API Routes              │
│  /api/panic-mode/*               │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Database                        │
│  (PostgreSQL, MongoDB, etc.)     │
│  • Unlock requests               │
│  • Approvals                     │
│  • Activity logs                 │
│  • User settings                 │
└──────────────────────────────────┘

Sync:
  Client ←──────────► Server
  (bidirectional sync via API)
```

## 🎬 Animation Layers

```
Theme Switching
├─ CSS Transition (500ms)
│  └─ Background color
│  └─ Text color
│  └─ Border color
│  └─ Accent color
└─ Smooth easing (ease-in-out)

Panic Mode Overlay
├─ Initial entrance (300ms)
│  └─ Scale: 0.8 → 1
│  └─ Opacity: 0 → 1
├─ Countdown timer (continuous)
│  └─ SVG stroke animation
│  └─ Number updates
├─ Breathing exercise
│  └─ Scale animation (4s cycle)
│  └─ Opacity pulse
└─ Exit animation (300ms)
   └─ Scale: 1 → 0.8
   └─ Opacity: 1 → 0

Component Animations
├─ Color picker
│  └─ Button scale on hover/tap
│  └─ Preview slide in/out
├─ Settings panel
│  └─ Fade up entrance
│  └─ Staggered children
└─ Activity log
   └─ Slide in from left
   └─ Staggered list items
```

## 🔐 Security Layers

```
Request → Validation → Authentication → Authorization → Processing

Color Picker:
  Input → Normalize → Validate Format → Check Contrast → Generate

Panic Mode:
  Activation → Session Create → Blocking Rules → Activity Log
  
Unlock Request:
  Request → Token Generation → Notification → Poll → Approval → Log

Data Access:
  User ID Check → Own Data Only → Session Validation → Activity Log
```

## 📈 Performance Considerations

```
Component Optimization:
├─ Memoization
│  └─ useMemo for theme calculations
│  └─ React.memo for HexColorPicker
├─ Code Splitting
│  └─ Lazy load settings panel
│  └─ Dynamic imports for modals
└─ Caching
   └─ LocalStorage for color prefs
   └─ Memoized color shades

Animation Performance:
├─ GPU Acceleration
│  └─ transform & opacity
│  └─ will-change (sparingly)
├─ Reduced Motion
│  └─ Respect prefers-reduced-motion
│  └─ Fallback animations
└─ Debouncing
   └─ Color input (300ms)
   └─ API polling (10s)

API Performance:
├─ Request Batching
│  └─ Group activity logs
├─ Caching Strategies
│  └─ ETag for activity logs
│  └─ Cache-Control headers
└─ Pagination
   └─ Limit activity log queries
```

---

This architecture ensures scalability, maintainability, and smooth user experience across all features.
