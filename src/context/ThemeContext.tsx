import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch { /* ignore */ }
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch { /* ignore */ }
  if (document.documentElement.classList.contains('dark')) return 'dark';
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) return 'dark';
      if (document.documentElement.classList.contains('light')) return 'light';
    }
    return resolveInitialTheme();
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (t: Theme) => {
    if (t === 'dark' || t === 'light') setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
