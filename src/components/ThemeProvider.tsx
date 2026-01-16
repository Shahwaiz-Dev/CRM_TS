import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const theme = useAppSelector((state) => state.ui.theme);

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (currentTheme: 'light' | 'dark' | 'system') => {
            root.classList.remove('light', 'dark');

            if (currentTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(currentTheme);
            }
        };

        applyTheme(theme);

        // Optional: Listen for system theme changes if set to system
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    return <>{children}</>;
};
