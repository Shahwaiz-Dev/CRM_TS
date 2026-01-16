import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PayrollRecord {
    id: string;
    employeeId: string;
    month: string;
    amount: number;
    overtime: number;
    bonuses: number;
    deductions: number;
    netPay: number;
    status: 'Paid' | 'Pending' | 'paid' | 'pending';
}

interface PayrollState {
    records: PayrollRecord[];
    loading: boolean;
    error: string | null;
}

const initialState: PayrollState = {
    records: [],
    loading: false,
    error: null,
};

const payrollSlice = createSlice({
    name: 'payroll',
    initialState,
    reducers: {
        setPayrollRecords: (state, action: PayloadAction<PayrollRecord[]>) => {
            state.records = action.payload;
            state.loading = false;
        },
        addPayrollRecord: (state, action: PayloadAction<PayrollRecord>) => {
            state.records.push(action.payload);
        },
        updatePayrollRecord: (state, action: PayloadAction<PayrollRecord>) => {
            const index = state.records.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.records[index] = action.payload;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setPayrollRecords, addPayrollRecord, updatePayrollRecord, setLoading, setError } = payrollSlice.actions;
export default payrollSlice.reducer;
