"use client";

import { useEffect } from 'react';

export default function GlobalThemeHandler({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    // This effect runs once on the client to set the initial light/dark mode
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;

    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  return <>{children}</>;
}
