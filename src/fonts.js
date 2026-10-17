// Fonts are loaded in ONE place. To swap typefaces later:
//   1. change the Google Fonts URL below, and
//   2. change --font-display / --font-text / --font-mono in styles/tokens.css.
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Sora:wght@400..700&family=Manrope:wght@400..700&family=JetBrains+Mono:wght@400;500&display=swap';

export function loadFonts() {
  if (document.getElementById('sct-fonts')) return;
  const link = document.createElement('link');
  link.id = 'sct-fonts';
  link.rel = 'stylesheet';
  link.href = FONT_URL;
  document.head.appendChild(link);
}
