import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// 6 Premium Themes for Pakistan market
export const THEMES = {
  fooddash: {
    id: 'fooddash',
    name: 'FoodDash Orange',
    emoji: '🍊',
    primary: '#FF6B35',
    primaryGrad: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
    secondary: '#FFB703',
    accent: '#2EC4B6',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Blue',
    emoji: '🌙',
    primary: '#3B82F6',
    primaryGrad: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    secondary: '#06B6D4',
    accent: '#8B5CF6',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Green',
    emoji: '💚',
    primary: '#10B981',
    primaryGrad: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    secondary: '#34D399',
    accent: '#6EE7B7',
  },
  royal: {
    id: 'royal',
    name: 'Royal Purple',
    emoji: '👑',
    primary: '#8B5CF6',
    primaryGrad: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    secondary: '#EC4899',
    accent: '#F59E0B',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Red',
    emoji: '🔴',
    primary: '#EF4444',
    primaryGrad: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    secondary: '#F97316',
    accent: '#FCD34D',
  },
  pakistan: {
    id: 'pakistan',
    name: 'Pakistan Green',
    emoji: '🇵🇰',
    primary: '#01411C',
    primaryGrad: 'linear-gradient(135deg, #01411C 0%, #1B5E35 100%)',
    secondary: '#4ADE80',
    accent: '#FFFFFF',
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('fooddash_theme_dark');
    if (saved !== null) return saved === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('fooddash_theme_id') || 'fooddash';
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('fooddash_theme_dark', String(isDark));

    // Apply CSS custom properties from selected theme
    const theme = THEMES[currentTheme] || THEMES.fooddash;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-grad', theme.primaryGrad);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
  }, [isDark, currentTheme]);

  const toggleDark = () => setIsDark(prev => !prev);

  const selectTheme = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('fooddash_theme_id', themeId);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, currentTheme, selectTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
