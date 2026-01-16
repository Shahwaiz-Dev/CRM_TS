import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import en from '../../locales/en.json';
import el from '../../locales/el.json';

const translations: Record<string, Record<string, string>> = {
    en,
    el,
};

interface LanguageState {
    language: string;
}

const initialState: LanguageState = {
    language: localStorage.getItem('language') || 'en',
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<string>) => {
            if (translations[action.payload]) {
                state.language = action.payload;
                localStorage.setItem('language', action.payload);
            }
        },
    },
});

export const { setLanguage } = languageSlice.actions;

// Selector-like function to handle translation logic
export const selectTranslation = (state: { language: LanguageState }, key: string, params?: Record<string, string | number>) => {
    const language = state.language.language;
    let translation = translations[language][key] || key;

    if (params) {
        Object.keys(params).forEach((paramKey) => {
            const value = params[paramKey];
            translation = translation.replace(
                new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'),
                String(value)
            );
        });
    }

    return translation;
};

// Hook to provide translation function without hook violations
import { useAppSelector } from '../hooks';
export const useTranslation = () => {
    const language = useAppSelector((state) => state.language.language);

    const t = (key: string, params?: Record<string, string | number>) => {
        let translation = translations[language][key] || key;

        if (params) {
            Object.keys(params).forEach((paramKey) => {
                const value = params[paramKey];
                translation = translation.replace(
                    new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'),
                    String(value)
                );
            });
        }

        return translation;
    };

    return { t, language };
};

export default languageSlice.reducer;
