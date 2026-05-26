# Component Quick Reference

## 🎨 Theme Components

### HexColorPicker
**Location**: `src/components/HexColorPicker.tsx`

```typescript
interface HexColorPickerProps {
  value: string;                          // Current color: "#FF6B6B"
  onColorChange: (color: string, theme: ThemeTokens) => void;
  isDark?: boolean;                       // Dark mode: false
  label?: string;                         // Input label: "Theme Color"
}
```

**Features**:
- Text input for hex colors
- 10 preset color buttons
- Live preview of theme
- Contrast warnings
- Real-time validation

**Example**:
```tsx
<HexColorPicker
  value="#FF6B6B"
  onColorChange={(hex, theme) => {
    localStorage.setItem("color", hex);
  }}
  isDark={false}
  label="Select Theme"
/>
```

---

### ThemeSettingsPanel
**Location**: `src/components/ThemeSettingsPanel.tsx`

```typescript
interface ThemeSettingsProps {
  currentTheme: ThemePreset | "custom";   // "beige"
  customColor?: string;                   // "#FF6B6B"
  isDarkMode: boolean;                    // false
  onThemeChange: (theme: ThemePreset | "custom", hex?: string) => void;
  onDarkModeToggle: (isDark: boolean) => void;
}
```

**Features**:
- Preset theme selection
- Custom color picker
- Dark mode toggle
- Live preview
- Accessibility info

**Example**:
```tsx
<ThemeSettingsPanel
  currentTheme="beige"
  customColor="#FF6B6B"
  isDarkMode={false}
  onThemeChange={(theme, hex) => {
    applyTheme(theme, hex);
  }}
  onDarkModeToggle={(isDark) => {
    setDarkMode(isDark);
  }}
/>
```

---

## 🚨 Panic Mode Components

### PanicModeOverlay
**Location**: `src/components/PanicModeOverlay.tsx`

```typescript
interface PanicModeProps {
  isActive: boolean;                       // true/false
  durationMinutes: number;                 // 30
  safetyContact?: {
    name: string;                          // "Alex"
    phone: string;                         // "+1234567890"
  };
  onDeactivate?: () => void;               // Callback
}
```

**Features**:
- Full-screen calming interface
- Animated countdown timer
- Breathing exercise animation
- Allowed actions list
- Safety contact display
- Emergency disable button

**Note**: Mount at top level of your app shell for z-index placement

**Example**:
```tsx
<PanicModeOverlay
  isActive={panicMode}
  durationMinutes={30}
  safetyContact={contactList[0]}
  onDeactivate={() => togglePanicMode()}
/>
```

---

### PanicModeActivator
**Location**: `src/components/PanicModeActivator.tsx`

```typescript
interface PanicModeActivatorProps {
  isActive: boolean;                  // false
  onActivate: (durationMinutes: number) => void;
  onDeactivate: () => void;
  defaultDuration?: number;           // 30
}
```

**Features**:
- Duration selector (5m, 15m, 30m, 1h, 8h)
- Start/stop button
- Duration picker dropdown
- Safety message

**Example**:
```tsx
<PanicModeActivator
  isActive={false}
  onActivate={(duration) => {
    startPanicSession(duration);
    logActivity("PANIC_START", { durationMinutes: duration });
  }}
  onDeactivate={() => {
    stopPanicSession();
    logActivity("PANIC_END");
  }}
  defaultDuration={30}
/>
```

---

### PanicModeSettings
**Location**: `src/components/PanicModeSettings.tsx`

```typescript
interface PanicModeSettingsProps {
  isEnabled: boolean;                  // false
  durationMinutes: number;             // 30
  safetyContacts: SafetyContact[];     // []
  blockedApps: string[];               // ["Instagram", "TikTok"]
  allowedApps: string[];               // ["Messages"]
  recoveryScore: number;               // 72
  onSettingsChange: (settings: {
    duration?: number;
    safetyContacts?: SafetyContact[];
    blockedApps?: string[];
    allowedApps?: string[];
  }) => void;
}
```

**Features**:
- Recovery score display
- Duration presets
- Safety contact management (add/remove)
- Activity tracking notice
- Safety disclaimer

**Example**:
```tsx
<PanicModeSettings
  isEnabled={false}
  durationMinutes={30}
  safetyContacts={contacts}
  blockedApps={blocked}
  allowedApps={allowed}
  recoveryScore={72}
  onSettingsChange={(settings) => {
    updateSettings(settings);
  }}
/>
```

---

### PanicModeActivityLog
**Location**: `src/components/PanicModeActivityLog.tsx`

```typescript
interface ActivityLogProps {
  userId: string;                     // "user-123"
  limit?: number;                     // 50
}
```

**Features**:
- Real-time activity log
- Color-coded event types
- Time ago calculations
- Auto-polling (10s intervals)
- Error handling
- Empty states

**Event Types**:
- `PANIC_START` - Session started
- `PANIC_END` - Session ended naturally
- `UNLOCK_REQUESTED` - Early exit requested
- `UNLOCK_APPROVED` - Exit approved
- `UNLOCK_DENIED` - Exit denied

**Example**:
```tsx
<PanicModeActivityLog
  userId={currentUser.id}
  limit={20}
/>
```

---

## 🛠️ Utility Functions

### Color Functions
**Location**: `src/lib/colors.ts`

```typescript
// Color conversion
hexToRgb(hex: string)                          // "#FF6B6B" → {r, g, b}
rgbToHex(r, g, b)                              // {r, g, b} → "#FF6B6B"
rgbToHsl(r, g, b)                              // {r, g, b} → {h, s, l}
hslToRgb(h, s, l)                              // {h, s, l} → {r, g, b}
hexToRgba(hex, alpha)                          // "#FF6B6B", 0.5 → "rgba(...)"

// Shade generation
lighten(hex: string, amount?: number)          // "#FF6B6B" → lighter
darken(hex: string, amount?: number)           // "#FF6B6B" → darker
getComplementary(hex: string)                  // "#FF6B6B" → opposite color

// Validation
isValidHex(hex: string)                        // "#FF6B6B" → true
normalizeHex(hex: string)                      // "FF6B6B" → "#FF6B6B"
createThemeColor(hex: string)                  // Full color object with shades

// Accessibility
getLuminance(hex: string)                      // 0.5 (0-1 scale)
getContrastRatio(hex1, hex2)                   // 3.97:1
hasAccessibleContrast(fg, bg, ratio?)          // true (WCAG AA = 4.5:1)
getContrastingTextColor(bgHex)                 // "light" or "dark"

// Shade generation
generateColorShades(hex: string)                // {light, main, dark}
```

**Examples**:
```typescript
import { lighten, darken, createThemeColor, hasAccessibleContrast } from "@/lib/colors";

// Generate shades
const lighter = lighten("#FF6B6B", 20);  // Lighter red
const darker = darken("#FF6B6B", 20);    // Darker red

// Create theme color
const color = createThemeColor("#FF6B6B");
console.log(color?.accessible);         // true (accessibility check)

// Check contrast
const hasContrast = hasAccessibleContrast("#FF6B6B", "#FFFFFF");
console.log(hasContrast);                // true
```

---

### Theme Functions
**Location**: `src/lib/themes-enhanced.ts`

```typescript
// Generate complete theme from hex color
generateThemeFromColor(hex: string, isDark?: boolean)  // ThemeTokens | null

// Preset colors array
PRESET_COLORS                                          // ["#FF6B6B", ...]

// Preset themes object
THEMES                                                 // Record<ThemePreset, ThemeTokens>
```

**Example**:
```typescript
import { generateThemeFromColor } from "@/lib/themes-enhanced";

const theme = generateThemeFromColor("#FF6B6B", false);
if (theme) {
  applyThemeToDOM(theme);
}
```

---

## 📡 API Endpoints

### POST /api/panic-mode/unlock-request
Create unlock request for safety contact approval.

```typescript
// Request
{
  sessionId: string;        // "session-123"
  safetyContactId: string;  // "contact-456"
  userId: string;           // "user-789"
}

// Response (200)
{
  id: string;               // "1234567890"
  sessionId: string;
  safetyContactId: string;
  requestedAt: string;      // ISO date
  approvalToken: string;    // Secure token
  approved: boolean;        // false
  expiresAt: string;        // ISO date (24h later)
}
```

---

### GET /api/panic-mode/unlock-request
Fetch unlock requests for a session.

```typescript
// Query params
?sessionId=session-123
?userId=user-789

// Response (200)
[
  {
    id: string;
    sessionId: string;
    safetyContactId: string;
    requestedAt: string;
    approvalToken: string;  // Hidden in GET
    approved: boolean;
    expiresAt: string;
  }
]
```

---

### POST /api/panic-mode/approval
Process safety contact approval/denial.

```typescript
// Request
{
  unlockRequestId: string;  // "1234567890"
  approvalToken: string;    // From email/SMS link
  safetyContactId: string;  // "contact-456"
  approved: boolean;        // true
}

// Response (200)
{
  id: string;
  unlockRequestId: string;
  safetyContactId: string;
  approved: boolean;
  approvedAt: string;       // ISO date
}
```

---

### GET /api/panic-mode/approval
Check approval status.

```typescript
// Query params
?unlockRequestId=1234567890

// Response (200)
{
  id: string;
  unlockRequestId: string;
  safetyContactId: string;
  approved: boolean;
  approvedAt: string;
}
```

---

### POST /api/panic-mode/activity
Log a panic mode event.

```typescript
// Request
{
  userId: string;                    // "user-789"
  type: ActivityType;                // "PANIC_START"
  sessionId?: string;                // "session-123"
  unlockRequestId?: string;          // Optional
  safetyContactId?: string;          // Optional
  metadata?: Record<string, any>;    // {durationMinutes: 30}
}

// Response (200)
{
  id: string;
  userId: string;
  type: ActivityType;
  timestamp: string;                 // ISO date
}
```

---

### GET /api/panic-mode/activity
Fetch activity history.

```typescript
// Query params
?userId=user-789
?limit=100
?type=PANIC_START  // Optional filter

// Response (200)
[
  {
    id: string;
    userId: string;
    type: ActivityType;
    sessionId?: string;
    unlockRequestId?: string;
    safetyContactId?: string;
    metadata?: Record<string, any>;
    timestamp: string;
  }
]
```

---

## 🎯 Common Imports

```typescript
// Colors
import { lighten, darken, createThemeColor, hasAccessibleContrast } from "@/lib/colors";
import type { ColorShades, ThemeColor } from "@/lib/colors";

// Themes
import { generateThemeFromColor, PRESET_COLORS, THEMES } from "@/lib/themes-enhanced";
import type { ThemeTokens, CustomTheme } from "@/lib/themes-enhanced";

// Components
import { HexColorPicker } from "@/components/HexColorPicker";
import { ThemeSettingsPanel } from "@/components/ThemeSettingsPanel";
import { PanicModeOverlay } from "@/components/PanicModeOverlay";
import { PanicModeActivator } from "@/components/PanicModeActivator";
import { PanicModeSettings } from "@/components/PanicModeSettings";
import { PanicModeActivityLog } from "@/components/PanicModeActivityLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

// Types
import type { SafetyContact, PanicModeSession, UnlockRequest, ActivityLogEntry } from "@/types/panic-mode";

// Store
import { usePulseStore } from "@/store/usePulseStore";
```

---

## 💾 CSS Variables

All components use these CSS variables for theming:

```css
--bg                /* Main background color */
--surface           /* Card/panel background (semi-transparent) */
--surface-solid     /* Solid surface (no transparency) */
--text              /* Primary text color */
--text-muted        /* Secondary text color */
--border            /* Border color */
--accent            /* Primary accent color */
--accent-glow       /* Glowing accent effect */
--gradient          /* Full gradient background */
```

Override in your CSS or apply dynamically:
```typescript
const root = document.documentElement;
root.style.setProperty("--accent", "#FF6B6B");
root.style.setProperty("--bg", "#FFE8E8");
```

---

## ⚡ Performance Tips

1. **Debounce color input**: Use `useDebounce` for 300ms delay
2. **Memoize theme generation**: Use `useMemo` for color calculations
3. **Lazy load settings**: Use `lazy()` for large panels
4. **Optimize animations**: Use `will-change` sparingly
5. **Cache API responses**: Store activity logs with SWR or React Query

---

## 🔗 Related Files

- Settings page: `src/app/settings/page.tsx`
- Store: `src/store/usePulseStore.ts`
- Theme provider: `src/components/ThemeProvider.tsx`
- Globals CSS: `src/app/globals.css`
- Tailwind config: `tailwind.config.ts`

---

## 📞 Quick Support

**Color not working?**
- Check hex format: `#RRGGBB`
- Ensure color is in sRGB color space
- Verify contrast ratio ≥ 4.5:1

**Panic Mode not showing?**
- Ensure `isActive={true}`
- Check z-index (overlay should be 50)
- Verify duration is > 0

**Theme not persisting?**
- Check localStorage enabled
- Verify key names match
- Check backend save response

---

**Last Updated**: May 22, 2026
