"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(false);
    
    useEffect(() => {
    const savedMode = localStorage.getItem("displayMode");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedMode) {
        setDarkMode(savedMode === 'dark');
    } else {
        setDarkMode(systemDark);
    }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("displayMode", newMode ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            <div className={`${darkMode ? "dark" : ""}`} suppressHydrationWarning ={true}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}