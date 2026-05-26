/** Runs before React hydrates to avoid font-mode flash */
export function AccessibilityInitScript() {
  const script = `
(function() {
  try {
    var raw = localStorage.getItem('pulse-storage-v1');
    if (!raw) return;
    var parsed = JSON.parse(raw);
    var state = parsed && parsed.state;
    if (!state) return;
    var root = document.documentElement;
    if (state.dyslexiaFont) {
      root.dataset.fontMode = 'dyslexia';
      root.dataset.dyslexia = 'true';
    }
    if (state.highContrast) root.dataset.highContrast = 'true';
    if (state.reducedMotion) root.dataset.reducedMotion = 'true';
  } catch (e) {}
})();
`.trim();

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
