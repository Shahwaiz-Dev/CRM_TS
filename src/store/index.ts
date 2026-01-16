import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import languageReducer from './slices/languageSlice';
import employeesReducer from './slices/employeesSlice';
import attendanceReducer from './slices/attendanceSlice';
import payrollReducer from './slices/payrollSlice';
import dealsReducer from './slices/dealsSlice';
import tasksReducer from './slices/tasksSlice';
import casesReducer from './slices/casesSlice';
import opportunitiesReducer from './slices/opportunitiesSlice';
import sprintTicketsReducer from './slices/sprintTicketsSlice';
import columnsReducer from './slices/columnSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        language: languageReducer,
        employees: employeesReducer,
        attendance: attendanceReducer,
        payroll: payrollReducer,
        deals: dealsReducer,
        tasks: tasksReducer,
        cases: casesReducer,
        opportunities: opportunitiesReducer,
        sprintTickets: sprintTicketsReducer,
        columns: columnsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
