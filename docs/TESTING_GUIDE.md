# Testing Guide: Settings & Safety System

## 🧪 Testing Overview

This guide walks through testing the Dynamic Hex Color Theme Picker and Panic Mode safety system.

## 📋 Pre-Testing Checklist

- [ ] Node.js and npm installed
- [ ] App running locally (`npm run dev`)
- [ ] Browser DevTools open (F12)
- [ ] LocalStorage enabled
- [ ] JavaScript enabled
- [ ] No ad blockers interfering

## 🎨 Theme System Tests

### Test 1: Hex Color Input Validation

**Location**: Settings → Themes Tab

**Steps**:
1. Click on "Custom Theme" section
2. Try entering invalid hex colors:
   - `"notahex"` - Should show error
   - `"#FFF"` - Should show error (too short)
   - `"#FFFFFF00"` - Should show error (too long)
3. Enter valid colors:
   - `"#FF6B6B"` - Should validate ✓
   - `"ff6b6b"` - Should convert to uppercase ✓
   - `"FF6B6B"` - Should add # prefix ✓

**Expected Result**:
- Invalid colors show red border and error message
- Valid colors show color preview circle
- Errors disappear when fixed

### Test 2: Preset Color Selection

**Location**: Settings → Themes Tab → Custom Theme → Presets

**Steps**:
1. Click each preset color button
2. Observe the color picker input updates
3. Check that color matches button color
4. Verify preview updates in real-time

**Expected Result**:
- All 10 preset colors are clickable
- Color input updates when clicked
- Live preview shows new color theme

### Test 3: Light and Dark Mode

**Location**: Settings → Themes Tab

**Steps**:
1. Toggle "Dark Mode" switch
2. Observe changes in preview:
   - Background should get darker
   - Text colors should adjust
   - Contrast should improve
3. Apply a color in dark mode
4. Toggle back to light mode
5. Verify colors adjust appropriately

**Expected Result**:
- Dark mode toggle generates darker variants
- Light mode generates lighter variants
- Theme adapts to mode selection
- Contrast remains accessible (WCAG AA)

### Test 4: Live Preview

**Location**: Settings → Themes Tab → Preview Section

**Steps**:
1. Click "Show Preview" button
2. Preview should expand showing:
   - Gradient background
   - Text color samples
   - Button variations (Primary, Secondary)
   - Input field example
3. Change color in picker
4. Preview updates in real-time
5. Click "Hide Preview" to collapse

**Expected Result**:
- Preview shows smooth expand animation
- All components render with correct colors
- Updates happen without lag
- Smooth collapse animation

### Test 5: Theme Persistence

**Location**: Settings → Themes Tab

**Steps**:
1. Select a custom color (e.g., `#45B7D1`)
2. Close the app or refresh page (F5)
3. Go back to Settings → Themes
4. Verify the color is still selected

**Expected Result**:
- Color persists in LocalStorage
- Selected color appears after refresh
- No data loss on page reload

**Check LocalStorage**:
```javascript
// In browser console
localStorage.getItem('customThemeColor')  // "#45B7D1"
localStorage.getItem('customThemeDarkMode')  // "false"
```

### Test 6: Preset Themes

**Location**: Settings → Themes Tab → Preset Themes

**Steps**:
1. Click "Burgundy" - theme should change immediately
2. Go back to custom color
3. Switch between different presets
4. Verify page background and accent colors change

**Expected Result**:
- All 6 presets apply instantly
- Page resets when switching presets
- Smooth color transitions
- CSS variables update

### Test 7: Accessibility Warnings

**Location**: Settings → Themes Tab → Custom Theme

**Steps**:
1. Enter a very light color: `#FFCCCC`
2. Look for contrast warning
3. Enter a color with good contrast: `#FF6B6B`
4. Warning should disappear

**Expected Result**:
- Colors with poor contrast show warning
- Warning disappears with accessible colors
- WCAG AA standard (4.5:1) maintained

### Test 8: Color Shade Generation

**Steps**:
1. Enter a color: `#FF6B6B`
2. In browser console, check shades:

```javascript
// Test lighten/darken functions
import { lighten, darken } from "@/lib/colors"
const lighter = lighten("#FF6B6B", 20)  // Should be lighter
const darker = darken("#FF6B6B", 20)   // Should be darker
console.log({lighter, darker})
```

**Expected Result**:
- Lighter shade has higher lightness value
- Darker shade has lower lightness value
- Both maintain same hue/saturation

---

## 🚨 Panic Mode Tests

### Test 1: Activation Button

**Location**: Settings → Safety Tab OR Home Dashboard

**Steps**:
1. Look for "Activate Panic Mode" button
2. Click it
3. Duration picker should appear with options
4. Cancel by clicking button again (should hide picker)
5. Click "Start" to activate

**Expected Result**:
- Button appears and is clickable
- Duration picker shows on click
- Presets: 5m, 15m, 30m, 1h, 8h
- Selections highlight when clicked

### Test 2: Panic Mode Overlay

**Location**: Settings → Safety Tab

**Steps**:
1. Click "Activate Panic Mode"
2. Select 5 minutes
3. Click "Start 5m Session"

**Verify Overlay Shows**:
- ✓ Full-screen overlay appears
- ✓ Heart icon in center
- ✓ "Panic Mode Active" heading
- ✓ Subtitle: "You're safe..."
- ✓ Countdown timer (5:00)
- ✓ Progress ring around timer
- ✓ Allowed actions section
- ✓ Safety contact info (if configured)
- ✓ Emergency disable button at bottom

**Expected Result**:
- Smooth entrance animation
- All elements render correctly
- No scrolling possible (fixed position)
- Cannot interact with content behind

### Test 3: Countdown Timer

**Location**: Panic Mode Overlay

**Steps**:
1. Activate Panic Mode for 1 minute
2. Watch the countdown
3. Verify timer counts down:
   - ✓ 1:00 → 0:59 → 0:58 → ... → 0:00
   - ✓ Format is MM:SS
   - ✓ Progress ring shrinks as time passes
4. Wait for it to complete or stop manually

**Expected Result**:
- Timer updates every second
- Progress ring animation is smooth
- Time format is correct
- Ring depletes as time passes
- Session ends when timer reaches 0

### Test 4: Breathing Exercise Animation

**Location**: Panic Mode Overlay

**Steps**:
1. Activate Panic Mode
2. Watch the full-screen animation
3. Should see pulsing effect:
   - Breathing in (4 seconds): Background scale increases
   - Holding (implied in 4s cycle)
   - Breathing out (4 seconds): Background scale decreases
4. Watch for ~30 seconds to see multiple cycles
5. Animation should continue smoothly

**Expected Result**:
- Smooth scale animation from 1.0 to 1.1 and back
- 4-second cycle time
- Calming effect
- No jank or stuttering

### Test 5: Safety Contact Display

**Location**: Panic Mode Settings → Safety Contacts

**Steps**:
1. Add a safety contact:
   - Name: "Alex"
   - Phone: "+1234567890"
   - Email: "alex@example.com" (optional)
2. Click "Save"
3. Contact should appear in list
4. Activate Panic Mode
5. Contact info should display in overlay

**Expected Result**:
- Contact form validates (name required, phone or email required)
- Contact appears in list after save
- Contact info shows in Panic Mode
- "Request Early Exit" button available

### Test 6: Add/Remove Safety Contacts

**Location**: Settings → Safety Tab → Safety Contacts

**Steps**:
1. Click "Add Safety Contact" button
2. Enter contact info
3. Click "Save"
4. Contact appears in list
5. Click trash icon to remove
6. Contact disappears from list

**Expected Result**:
- Form validates on save
- Contact saves successfully
- List updates immediately
- Remove works without reload
- Can add multiple contacts

### Test 7: Panic Mode Duration Presets

**Location**: Settings → Safety Tab → Default Duration

**Steps**:
1. Click each duration option: 5m, 15m, 30m, 1h, 8h
2. Selected duration should highlight
3. Activate Panic Mode
4. Verify session uses selected duration

**Expected Result**:
- Selected button highlights with accent color
- Duration applies to new session
- Timer starts with correct duration

### Test 8: Recovery Score

**Location**: Settings → Safety Tab → Focus Recovery Score

**Steps**:
1. Activate and complete Panic Mode sessions
2. Score should increment based on:
   - Sessions completed
   - Average duration
   - Consistency

**Expected Result**:
- Score displays as number (0-100)
- Progress bar shows visually
- Score description provided

### Test 9: Activity Log

**Location**: Settings → Safety Tab → Session History

**Steps**:
1. Activate Panic Mode → Wait → Deactivate
2. Activity log should show entry:
   - Type: "Panic Mode Started"
   - Time: Just now
3. Request early exit
4. New entries should appear
5. Pull down to refresh

**Expected Result**:
- Log displays in reverse chronological order
- Entries are color-coded
- Timestamps display
- Real-time updates
- Smooth list animations

---

## 📡 API Tests

### Test 1: Unlock Request Creation

**Using curl or Postman**:

```bash
curl -X POST http://localhost:3000/api/panic-mode/unlock-request \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-123",
    "safetyContactId": "contact-456",
    "userId": "user-789"
  }'
```

**Expected Response (200)**:
```json
{
  "id": "1234567890",
  "sessionId": "session-123",
  "safetyContactId": "contact-456",
  "userId": "user-789",
  "requestedAt": "2026-05-22T10:00:00Z",
  "approvalToken": "abc123def456",
  "approved": false,
  "expiresAt": "2026-05-23T10:00:00Z"
}
```

### Test 2: Fetch Unlock Requests

```bash
curl http://localhost:3000/api/panic-mode/unlock-request?sessionId=session-123&userId=user-789
```

**Expected Response (200)**:
```json
[
  {
    "id": "1234567890",
    "sessionId": "session-123",
    // ... other fields
  }
]
```

### Test 3: Process Approval

```bash
curl -X POST http://localhost:3000/api/panic-mode/approval \
  -H "Content-Type: application/json" \
  -d '{
    "unlockRequestId": "1234567890",
    "approvalToken": "abc123def456",
    "safetyContactId": "contact-456",
    "approved": true
  }'
```

**Expected Response (200)**:
```json
{
  "id": "9876543210",
  "unlockRequestId": "1234567890",
  "safetyContactId": "contact-456",
  "approved": true,
  "approvedAt": "2026-05-22T10:05:00Z"
}
```

### Test 4: Activity Logging

```bash
curl -X POST http://localhost:3000/api/panic-mode/activity \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-789",
    "type": "PANIC_START",
    "sessionId": "session-123",
    "metadata": {
      "durationMinutes": 30
    }
  }'
```

**Expected Response (200)**:
```json
{
  "id": "log-123",
  "userId": "user-789",
  "type": "PANIC_START",
  "sessionId": "session-123",
  "metadata": {
    "durationMinutes": 30
  },
  "timestamp": "2026-05-22T10:00:00Z"
}
```

### Test 5: Fetch Activity History

```bash
curl http://localhost:3000/api/panic-mode/activity?userId=user-789&limit=20
```

**Expected Response (200)**:
```json
[
  {
    "id": "log-123",
    "userId": "user-789",
    "type": "PANIC_START",
    "timestamp": "2026-05-22T10:00:00Z"
  },
  // ... more entries
]
```

---

## 🔧 Browser DevTools Tests

### Console Tests

```javascript
// Test color utilities
import { lighten, darken, getContrastRatio, createThemeColor } from "@/lib/colors"

// Generate shades
lighten("#FF6B6B", 20)  // Returns lighter red
darken("#FF6B6B", 20)   // Returns darker red

// Check contrast
getContrastRatio("#FF6B6B", "#FFFFFF")  // ~3.97

// Validate and create
createThemeColor("#FF6B6B")  // Full color object

// Test theme generation
import { generateThemeFromColor } from "@/lib/themes-enhanced"
const theme = generateThemeFromColor("#FF6B6B", false)
console.log(theme)  // Complete theme object
```

### LocalStorage Tests

```javascript
// Check saved color
localStorage.getItem('customThemeColor')  // "#FF6B6B"
localStorage.getItem('customThemeDarkMode')  // "false"

// Simulate clearing color
localStorage.removeItem('customThemeColor')

// Check Zustand store
import { useStiloStore } from "@/store/useStiloStore"
const store = useStiloStore.getState()
console.log(store.theme)        // Current theme
console.log(store.panicMode)    // Panic mode status
```

### CSS Variable Tests

```javascript
// Check applied CSS variables
const root = document.documentElement
const style = getComputedStyle(root)

console.log(style.getPropertyValue('--accent'))      // #FF6B6B
console.log(style.getPropertyValue('--bg'))          // #FFE8E8
console.log(style.getPropertyValue('--text'))        // #4A3D33

// Dynamically apply new colors
root.style.setProperty('--accent', '#45B7D1')
root.style.setProperty('--bg', '#D1E8F7')
```

---

## 🚀 Performance Tests

### Lighthouse Tests

1. Open DevTools → Lighthouse
2. Run audit for:
   - ✓ Performance
   - ✓ Accessibility
   - ✓ Best Practices
   - ✓ SEO

**Targets**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90

### Animation Performance

1. Open DevTools → Performance tab
2. Record while:
   - Switching themes
   - Activating Panic Mode
   - Scrolling activity log
3. Check for:
   - ✓ 60 FPS animations
   - ✓ No long tasks
   - ✓ Smooth transitions

### Network Tests

1. Open DevTools → Network tab
2. Filter to XHR/Fetch
3. Perform:
   - ✓ Create unlock request
   - ✓ Post approval
   - ✓ Log activity
4. Check:
   - ✓ Status 200 for all
   - ✓ Response time < 100ms
   - ✓ Payload sizes reasonable

---

## 📱 Responsive Tests

### Mobile (375px)
```
[ ] All buttons touch-friendly (44px+)
[ ] Text readable without zoom
[ ] Layout single column
[ ] Scrolling smooth
[ ] Panic overlay fills screen
```

### Tablet (768px)
```
[ ] Two-column layout works
[ ] Tab navigation visible
[ ] All controls accessible
[ ] Images load quickly
```

### Desktop (1440px)
```
[ ] Multi-column layout optimal
[ ] Sidebar navigation works
[ ] Hover states visible
[ ] No content overflow
```

---

## ♿ Accessibility Tests

### Keyboard Navigation
```
[ ] Tab through all controls
[ ] Enter/Space activates buttons
[ ] Escape closes modals
[ ] Focus visible on all elements
[ ] Logical tab order
```

### Screen Reader (NVDA/JAWS)
```
[ ] Page structure announced correctly
[ ] Buttons labeled properly
[ ] Form fields have labels
[ ] Errors announced
[ ] Live regions update
```

### Color Contrast
```
[ ] All text > 4.5:1 ratio
[ ] UI controls > 3:1 ratio
[ ] Sufficient color differentiation
[ ] Colors not only distinguisher
```

---

## 🐛 Edge Case Testing

### Test 1: Rapid Theme Switching
- Switch between colors rapidly
- Expected: Smooth transitions, no crashes

### Test 2: Multiple Panic Sessions
- Start → Complete → Start again immediately
- Expected: Cooldown prevents rapid restarts

### Test 3: Missing Safety Contact
- Request unlock with no contacts
- Expected: Graceful error, no crash

### Test 4: Expired Approval Link
- Wait past 24 hours
- Click approval link
- Expected: 404 or error message

### Test 5: Offline Operation
- Disable network → Use app
- Expected: LocalStorage data accessible

---

## ✅ Testing Checklist

**Theme System**:
- [ ] Hex input validation
- [ ] Preset color selection
- [ ] Light/dark mode toggle
- [ ] Live preview updates
- [ ] Theme persistence
- [ ] Preset themes apply
- [ ] Accessibility warnings
- [ ] Shade generation

**Panic Mode**:
- [ ] Activation button works
- [ ] Overlay displays correctly
- [ ] Timer counts down
- [ ] Breathing animation smooth
- [ ] Safety contacts display
- [ ] Can add/remove contacts
- [ ] Activity log shows events
- [ ] Recovery score tracks

**APIs**:
- [ ] Unlock request creation
- [ ] Request fetching
- [ ] Approval processing
- [ ] Activity logging
- [ ] Error handling

**Performance**:
- [ ] Lighthouse scores > 90
- [ ] Animations 60 FPS
- [ ] Network requests fast
- [ ] No memory leaks

**Accessibility**:
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Color contrast WCAG AA
- [ ] Reduced motion respected

**Responsive**:
- [ ] Mobile (375px) works
- [ ] Tablet (768px) works
- [ ] Desktop (1440px) works

---

## 📊 Test Results Template

```markdown
# Test Results - [Date]

## Theme System
- Hex Input: ✓ PASS / ✗ FAIL
- Presets: ✓ PASS / ✗ FAIL
- Dark Mode: ✓ PASS / ✗ FAIL
- Preview: ✓ PASS / ✗ FAIL
- Persistence: ✓ PASS / ✗ FAIL

## Panic Mode
- Activation: ✓ PASS / ✗ FAIL
- Overlay: ✓ PASS / ✗ FAIL
- Timer: ✓ PASS / ✗ FAIL
- Animation: ✓ PASS / ✗ FAIL
- Activity Log: ✓ PASS / ✗ FAIL

## APIs
- Unlock Request: ✓ PASS / ✗ FAIL
- Approval: ✓ PASS / ✗ FAIL
- Activity: ✓ PASS / ✗ FAIL

## Performance
- Lighthouse: [Score]
- Animations: [FPS]
- Network: [ms]

## Accessibility
- Keyboard: ✓ PASS / ✗ FAIL
- Screen Reader: ✓ PASS / ✗ FAIL
- Contrast: ✓ PASS / ✗ FAIL

## Notes
[Additional observations]
```

---

**Happy Testing!** 🎉
