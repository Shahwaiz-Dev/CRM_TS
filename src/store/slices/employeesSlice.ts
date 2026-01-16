import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Employee {
    id: string;
    employeeId?: string;
    name: string;
    email: string;
    position: string;
    department: string;
    status: 'Active' | 'Inactive';
    phone: string;
    salary: string;
    hireDate: string;
}

interface EmployeesState {
    employees: Employee[];
    loading: boolean;
    error: string | null;
}

const initialState: EmployeesState = {
    employees: [],
    loading: false,
    error: null,
};

const employeesSlice = createSlice({
    name: 'employees',
    initialState,
    reducers: {
        setEmployees: (state, action: PayloadAction<Employee[]>) => {
            state.employees = action.payload;
            state.loading = false;
        },
        addEmployee: (state, action: PayloadAction<Employee>) => {
            state.employees.push(action.payload);
        },
        updateEmployee: (state, action: PayloadAction<Employee>) => {
            const index = state.employees.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state.employees[index] = action.payload;
            }
        },
        deleteEmployee: (state, action: PayloadAction<string>) => {
            state.employees = state.employees.filter(e => e.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setEmployees, addEmployee, updateEmployee, deleteEmployee, setLoading, setError } = employeesSlice.actions;
export default employeesSlice.reducer;
