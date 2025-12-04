"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          y: theme === 'light' ? 0 : -30,
          opacity: theme === 'light' ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute"
      >
        <Sun className="w-5 h-5 text-amber-500" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          y: theme === 'dark' ? 0 : 30,
          opacity: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute"
      >
        <Moon className="w-5 h-5 text-blue-400" />
      </motion.div>
    </motion.button>
  );
}

// Alternative larger toggle with sun/moon animation
export function ThemeToggleLarge() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) {
    return <div className="w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />;
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-16 h-8 rounded-full p-1 transition-colors ${
        theme === 'dark'
          ? 'bg-gray-700'
          : 'bg-gray-200'
      }`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        className={`w-6 h-6 rounded-full flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-gray-900'
            : 'bg-white shadow-md'
        }`}
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        animate={{ x: theme === 'dark' ? 32 : 0 }}
      >
        <motion.div
          initial={false}
          animate={{
            rotate: theme === 'dark' ? 360 : 0,
            scale: theme === 'dark' ? 1 : 1
          }}
          transition={{ duration: 0.5 }}
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-blue-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}

// Export a hook for programmatic theme access
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(savedTheme || systemTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const setLightTheme = () => {
    setTheme('light');
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  };

  const setDarkTheme = () => {
    setTheme('dark');
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  };

  return { theme, toggleTheme, setLightTheme, setDarkTheme };
}
