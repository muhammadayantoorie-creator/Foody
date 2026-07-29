import React, { createContext, useContext, useState, useEffect } from 'react';

const FontHighContrastContext = createContext();

export function FontHighContrastProvider({ children }) {
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fooddash_fontsize') || 'normal';
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('fooddash_highcontrast') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('fooddash_fontsize', fontSize);
    document.documentElement.setAttribute('data-fontsize', fontSize);
    
    // Scale root font size
    if (fontSize === 'small') document.documentElement.style.fontSize = '14px';
    else if (fontSize === 'normal') document.documentElement.style.fontSize = '16px';
    else if (fontSize === 'large') document.documentElement.style.fontSize = '18px';
    else if (fontSize === 'xlarge') document.documentElement.style.fontSize = '20px';
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('fooddash_highcontrast', highContrast ? 'true' : 'false');
    if (highContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast(prev => !prev);

  return (
    <FontHighContrastContext.Provider value={{
      fontSize,
      setFontSize,
      highContrast,
      setHighContrast,
      toggleHighContrast
    }}>
      {children}
    </FontHighContrastContext.Provider>
  );
}

export function useFontHighContrast() {
  return useContext(FontHighContrastContext);
}
