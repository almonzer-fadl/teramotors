"use client";

import { createContext } from 'react';

interface ThemeContextType {
  colorTheme: string;
  setColorTheme: (theme: string) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  colorTheme: 'default',
  setColorTheme: () => {},
});
