import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    name?: string;
    department?: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    totalHours?: string;
    status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'present' | 'absent' | 'late' | 'leave';
}

interface AttendanceState {
    records: AttendanceRecord[];
    loading: boolean;
    error: string | null;
}

const initialState: AttendanceState = {
    records: [],
    loading: false,
    error: null,
};

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        setAttendanceRecords: (state, action: PayloadAction<AttendanceRecord[]>) => {
            state.records = action.payload;
            state.loading = false;
        },
        addAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
            state.records.push(action.payload);
        },
        updateAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
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

export const { setAttendanceRecords, addAttendanceRecord, updateAttendanceRecord, setLoading, setError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
