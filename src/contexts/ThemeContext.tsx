import React from 'react';

export type Theme = 'default' | 'pink';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'default',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved === 'pink' ? 'pink' : 'default';
    } catch {
      return 'default';
    }
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'pink' ? 'default' : 'pink';
      try {
        localStorage.setItem('theme', next);
      } catch {}
      return next;
    });
  };

  React.useEffect(() => {
    document.body.classList.toggle('pink-mode', theme === 'pink');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
