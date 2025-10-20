import { useState, useEffect, useCallback } from 'react';
import usePrefersColorScheme from '../../src/hooks/usePrefersColorScheme.ts';

type Theme = 'light' | 'dark';

function isTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark';
}

function getStoredTheme(): Theme | null {
    const stored = localStorage.getItem('theme');
    return isTheme(stored) ? stored : null;
}

export default function useTheme() {
    const systemPref = usePrefersColorScheme() as Theme;
    const [theme, setTheme] = useState<Theme>(() => getStoredTheme() || systemPref);

    // Sync theme to <html> element and localStorage
    useEffect(() => {
        // Target the root <html> element
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Listen for system preference changes
    useEffect(() => {
        if (!getStoredTheme() && isTheme(systemPref)) {
            setTheme(systemPref);
        }
    }, [systemPref]);

    // Listen for localStorage changes (cross-tab)
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === 'theme' && isTheme(e.newValue)) {
                setTheme(e.newValue);
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return { theme, toggleTheme };
}
