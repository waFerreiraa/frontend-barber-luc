import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [tema, setTema] = useState(localStorage.getItem('app_theme') || 'barbearia');

  useEffect(() => {
    localStorage.setItem('app_theme', tema);
    if (tema === 'salao') {
      document.body.classList.add('theme-salao');
      document.body.classList.remove('theme-barbearia');
    } else {
      document.body.classList.add('theme-barbearia');
      document.body.classList.remove('theme-salao');
    }
  }, [tema]);

  return (
    <ThemeContext.Provider value={{ tema, setTema }}>
      {children}
    </ThemeContext.Provider>
  );
};
