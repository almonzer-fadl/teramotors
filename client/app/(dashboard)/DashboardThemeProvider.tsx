"use client";

import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

export default function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useState('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This effect runs only on the client
    const savedColorTheme = localStorage.getItem('teramotors-theme');
    if (savedColorTheme) {
      setColorTheme(savedColorTheme);
    }
    setMounted(true);
  }, []);

  const handleSetColorTheme = (theme: string) => {
    setColorTheme(theme);
    localStorage.setItem('teramotors-theme', theme);
  };

  // This prevents a flash of default theme on page load before the effect runs
  if (!mounted) {
    // A simple div wrapper that is hidden ensures children can still be server-rendered
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme: handleSetColorTheme }}>
      <div data-theme={colorTheme} className="dashboard-panel h-full">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}