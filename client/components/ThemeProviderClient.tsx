"use client";

import { useEffect, useState } from 'react';

export default function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Apply light/dark theme
    const savedLightDarkMode = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialLightDarkMode = savedLightDarkMode || systemTheme;
    document.documentElement.classList.toggle('dark', initialLightDarkMode === 'dark');

    // Apply color theme
    const savedColorTheme = localStorage.getItem('teramotors-theme') || 'default';
    document.documentElement.dataset.theme = savedColorTheme;

  }, []);

  // Render children only after mounting to ensure themes are applied before hydration
  if (!mounted) {
    // Optionally render a loading state or nothing
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <>{children}</>;
}
