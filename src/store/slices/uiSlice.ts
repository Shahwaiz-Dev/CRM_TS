import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    sidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    modals: {
        [key: string]: boolean;
    };
    globalLoading: boolean;
}

const initialState: UIState = {
    sidebarOpen: true,
    theme: 'system',
    modals: {},
    globalLoading: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebar: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
            state.theme = action.payload;
        },
        toggleModal: (state, action: PayloadAction<string>) => {
            state.modals[action.payload] = !state.modals[action.payload];
        },
        setModal: (state, action: PayloadAction<{ id: string; isOpen: boolean }>) => {
            state.modals[action.payload.id] = action.payload.isOpen;
        },
        setGlobalLoading: (state, action: PayloadAction<boolean>) => {
            state.globalLoading = action.payload;
        },
    },
});

export const { toggleSidebar, setSidebar, setTheme, toggleModal, setModal, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
