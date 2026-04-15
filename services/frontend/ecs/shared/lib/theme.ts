export type ThemeMode = 'light' | 'dark';

const PREFS_KEY = 'ecs_user_prefs';

function getStoredPrefs(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function readStoredTheme(): ThemeMode {
  const prefs = getStoredPrefs();
  return prefs.theme === 'dark' ? 'dark' : 'light';
}

export function writeStoredTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  const prefs = getStoredPrefs();
  prefs.theme = theme;
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function getThemeBootstrapScript(): string {
  return `(() => {
    try {
      const raw = localStorage.getItem('ecs_user_prefs');
      let theme = 'light';
      if (raw) {
        const prefs = JSON.parse(raw);
        theme = prefs && prefs.theme === 'dark' ? 'dark' : 'light';
      }
      const root = document.documentElement;
      root.classList.toggle('dark', theme === 'dark');
      root.style.colorScheme = theme;
    } catch (error) {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  })();`;
}