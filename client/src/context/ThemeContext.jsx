import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.removeItem("theme");
  }, []);

  const toggleTheme = () => {
    // No-op to prevent theme toggle
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
