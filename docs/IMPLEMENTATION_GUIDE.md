# Implementation Guide: Settings & Safety System

This guide walks you through integrating the new settings and safety features into your Pulse app.

## Quick Start (15 minutes)

### Step 1: Update Your Store

Your `usePulseStore` already has `panicMode` and `theme` state. Make sure it includes these actions:

```typescript
// In usePulseStore.ts, ensure you have:
interface PulseState {
  theme: ThemePreset | "custom";
  customThemeColor?: string;
  customThemeDark?: boolean;
  panicMode: boolean;
  panicModeSession?: {
    id: string;
    startedAt: string;
    scheduledEndAt: string;
    durationMinutes: number;
  };
  safetyContacts: SafetyContact[];
  
  // Actions
  setTheme: (theme: ThemePreset | "custom", hex?: string) => void;
  togglePanicMode: () => void;
  // ... other actions
}
```

### Step 2: Update Layout

Update your `AppShell.tsx` to include the Panic Mode overlay:

```typescript
import { PanicModeOverlay } from "@/components/PanicModeOverlay";

export function AppShell({ children }: { children: React.ReactNode }) {
  const panicMode = usePulseStore((s) => s.panicMode);
  const togglePanicMode = usePulseStore((s) => s.togglePanicMode);

  return (
    <>
      <PanicModeOverlay
        isActive={panicMode}
        durationMinutes={30}
        onDeactivate={togglePanicMode}
      />
      {/* Rest of your layout */}
    </>
  );
}
```

### Step 3: Add Settings Navigation

Add the settings page link in your navigation:

```typescript
// In your navigation component
<Link href="/settings">
  <Settings className="w-5 h-5" />
  Settings
</Link>
```

### Step 4: Test Color Picker

Visit `/settings` and click the "Themes" tab to test the color picker.

---

## Integration Examples

### Example 1: Add Panic Mode to Dashboard

```typescript
"use client";

import { PanicModeActivator } from "@/components/PanicModeActivator";
import { usePulseStore } from "@/store/usePulseStore";

export function DashboardWidget() {
  const panicMode = usePulseStore((s) => s.panicMode);
  const togglePanicMode = usePulseStore((s) => s.togglePanicMode);

  return (
    <PanicModeActivator
      isActive={panicMode}
      onActivate={(duration) => {
        // Start panic mode
        togglePanicMode();
        // Log activity
        logActivity("PANIC_START", { durationMinutes: duration });
      }}
      onDeactivate={() => {
        togglePanicMode();
        logActivity("PANIC_END", {});
      }}
      defaultDuration={30}
    />
  );
}
```

### Example 2: Display Activity Log

```typescript
"use client";

import { PanicModeActivityLog } from "@/components/PanicModeActivityLog";

export function ActivitySection() {
  const userId = "user-123"; // Get from auth context

  return (
    <div className="p-6 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
      <h2 className="text-lg font-semibold mb-4">Session History</h2>
      <PanicModeActivityLog userId={userId} limit={20} />
    </div>
  );
}
```

### Example 3: Custom Theme Integration

```typescript
"use client";

import { generateThemeFromColor } from "@/lib/themes-enhanced";
import { usePulseStore } from "@/store/usePulseStore";

export function ApplyCustomTheme() {
  useEffect(() => {
    const savedColor = localStorage.getItem("customThemeColor");
    const isDark = localStorage.getItem("customThemeDarkMode") === "true";

    if (savedColor) {
      const theme = generateThemeFromColor(savedColor, isDark);
      if (theme) {
        applyThemeToDOM(theme);
      }
    }
  }, []);
}

function applyThemeToDOM(theme: ThemeTokens) {
  const root = document.documentElement;
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--surface-solid", theme.surfaceSolid);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--text-muted", theme.textMuted);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-glow", theme.accentGlow);
  root.style.setProperty("--gradient", theme.gradient);
}
```

---

## Component API Reference

### HexColorPicker

```typescript
interface HexColorPickerProps {
  value: string;                              // Current hex color
  onColorChange: (color: string, theme: ThemeTokens) => void;
  isDark?: boolean;                           // Dark mode
  label?: string;                             // Input label
}

<HexColorPicker
  value="#FF6B6B"
  onColorChange={(hex, theme) => {
    console.log("New color:", hex);
    console.log("Theme:", theme);
  }}
  isDark={false}
  label="Choose Your Theme"
/>
```

### PanicModeOverlay

```typescript
interface PanicModeProps {
  isActive: boolean;
  durationMinutes: number;
  safetyContact?: { name: string; phone: string };
  onDeactivate?: () => void;
}

<PanicModeOverlay
  isActive={true}
  durationMinutes={30}
  safetyContact={{ name: "Alex", phone: "+1234567890" }}
  onDeactivate={() => console.log("Exit panic mode")}
/>
```

### PanicModeActivator

```typescript
interface PanicModeActivatorProps {
  isActive: boolean;
  onActivate: (durationMinutes: number) => void;
  onDeactivate: () => void;
  defaultDuration?: number;
}

<PanicModeActivator
  isActive={false}
  onActivate={(duration) => console.log(`Start ${duration}m session`)}
  onDeactivate={() => console.log("Stop session")}
  defaultDuration={30}
/>
```

### ThemeSettingsPanel

```typescript
interface ThemeSettingsProps {
  currentTheme: ThemePreset | "custom";
  customColor?: string;
  isDarkMode: boolean;
  onThemeChange: (theme: ThemePreset | "custom", hex?: string) => void;
  onDarkModeToggle: (isDark: boolean) => void;
}

<ThemeSettingsPanel
  currentTheme="beige"
  customColor="#FF6B6B"
  isDarkMode={false}
  onThemeChange={(theme, hex) => console.log(theme, hex)}
  onDarkModeToggle={(isDark) => console.log(isDark)}
/>
```

### PanicModeSettings

```typescript
interface PanicModeSettingsProps {
  isEnabled: boolean;
  durationMinutes: number;
  safetyContacts: SafetyContact[];
  blockedApps: string[];
  allowedApps: string[];
  recoveryScore: number;
  onSettingsChange: (settings: {
    duration?: number;
    safetyContacts?: SafetyContact[];
    blockedApps?: string[];
    allowedApps?: string[];
  }) => void;
}

<PanicModeSettings
  isEnabled={false}
  durationMinutes={30}
  safetyContacts={[]}
  blockedApps={["Instagram", "TikTok"]}
  allowedApps={["Messages"]}
  recoveryScore={72}
  onSettingsChange={(settings) => {
    console.log("New settings:", settings);
  }}
/>
```

---

## Styling & Theming

All components use CSS variables for theming. Customize by updating these in your CSS:

```css
:root {
  --bg: #f4ebe1;              /* Main background */
  --surface: rgba(...);        /* Card/surface backgrounds */
  --surface-solid: #fbf5ee;   /* Solid surface (no transparency) */
  --text: #4a3d33;            /* Primary text */
  --text-muted: #8a7b6c;      /* Secondary text */
  --border: rgba(...);         /* Border colors */
  --accent: #b98b5d;          /* Primary accent */
  --accent-glow: rgba(...);   /* Glow effects */
  --gradient: linear-gradient(...);
}
```

For dynamic theming:

```typescript
const root = document.documentElement;
root.style.setProperty("--accent", "#FF6B6B");
root.style.setProperty("--bg", "#FFE8E8");
// etc...
```

---

## Common Patterns

### Listening for Theme Changes

```typescript
useEffect(() => {
  const observer = new MutationObserver(() => {
    console.log("Theme changed");
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style"],
  });

  return () => observer.disconnect();
}, []);
```

### Detecting Dark Mode

```typescript
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkStored = localStorage.getItem("customThemeDarkMode") === "true";
    setIsDark(isDarkStored);
  }, []);

  return isDark;
}
```

### Validating Hex Colors

```typescript
import { isValidHex, normalizeHex } from "@/lib/colors";

const userInput = "FF6B6B";
const normalized = normalizeHex(userInput); // "#FF6B6B"
const isValid = isValidHex(normalized); // true
```

---

## Testing

### Test Color Picker

```typescript
import { createThemeColor, lighten, darken } from "@/lib/colors";

const color = createThemeColor("#FF6B6B");
expect(color).toBeDefined();
expect(color?.shades.light).toBeDefined();
expect(color?.accessible).toBe(true);
```

### Test Theme Generation

```typescript
import { generateThemeFromColor } from "@/lib/themes-enhanced";

const theme = generateThemeFromColor("#FF6B6B", false);
expect(theme?.accent).toBe("#FF6B6B");
expect(theme?.bg).toBeDefined();
```

### Test API Endpoints

```typescript
// Test unlock request
const response = await fetch("/api/panic-mode/unlock-request", {
  method: "POST",
  body: JSON.stringify({
    sessionId: "session-123",
    safetyContactId: "contact-456",
    userId: "user-789",
  }),
});
expect(response.status).toBe(200);
```

---

## Performance Tips

1. **Memoize theme calculations**
   ```typescript
   const theme = useMemo(
     () => generateThemeFromColor(color, isDark),
     [color, isDark]
   );
   ```

2. **Debounce color input**
   ```typescript
   const [debouncedColor] = useDebounce(inputColor, 300);
   ```

3. **Lazy load settings panel**
   ```typescript
   const ThemeSettingsPanel = lazy(() => import("@/components/ThemeSettingsPanel"));
   ```

4. **Optimize animations**
   - Use `will-change` sparingly
   - Reduce animation duration on slow devices
   - Disable animations with `prefers-reduced-motion`

---

## Accessibility Checklist

- [ ] All color contrasts meet WCAG AA standard
- [ ] Keyboard navigation works on all components
- [ ] Screen reader announces theme changes
- [ ] Settings persist across sessions
- [ ] Error messages are clear and accessible
- [ ] Buttons have sufficient touch targets (44px minimum)
- [ ] Forms have proper labels
- [ ] Animations respect `prefers-reduced-motion`

---

## Next Steps

1. **Database Integration**: Move from in-memory to persistent database
2. **Email/SMS Notifications**: Integrate Twilio or similar for safety contact notifications
3. **App Blocking**: Implement native app blocking (requires mobile app)
4. **Analytics**: Track user behavior and recovery scores
5. **Machine Learning**: Predict optimal session durations
6. **Social Features**: Share focus sessions with friends

---

## Support

For issues or questions:
1. Check the main documentation: `SETTINGS_SAFETY_SYSTEM.md`
2. Review component source code
3. Check TypeScript types
4. Test with browser dev tools
5. Review API endpoint responses
