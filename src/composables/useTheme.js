/**
 * Tema terang/gelap.
 * - Awalnya mengikuti sistem operasi (atau tema yang dipilih di claude.ai).
 * - Setelah pengguna menekan tombol, pilihan disimpan dan diterapkan lewat atribut data-theme.
 */
import { ref, computed } from 'vue';

const KEY = 'ksdcf-theme';
const root = typeof document !== 'undefined' ? document.documentElement : null;
const media = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

const systemDark = ref(media ? media.matches : false);
const readAttr = () => {
  const a = root?.getAttribute('data-theme');
  return a === 'dark' || a === 'light' ? a : null;
};
const explicit = ref(readAttr());

if (media?.addEventListener) media.addEventListener('change', (e) => { systemDark.value = e.matches; });
if (root && typeof MutationObserver !== 'undefined') {
  new MutationObserver(() => { explicit.value = readAttr(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
}

export function useTheme() {
  const theme = computed(() => explicit.value || (systemDark.value ? 'dark' : 'light'));

  function setTheme(value) {
    root?.setAttribute('data-theme', value);
    explicit.value = value;
    try { localStorage.setItem(KEY, value); } catch { /* abaikan */ }
  }

  function toggle() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
  }

  return { theme, setTheme, toggle };
}
