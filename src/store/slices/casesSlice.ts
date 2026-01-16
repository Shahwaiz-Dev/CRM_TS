import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getCases, addCase, updateCase, deleteCase } from '@/lib/firebase';

interface Case {
    id: string;
    subject: string;
    description: string;
    accountName: string;
    accountId: string;
    status: 'New' | 'Working' | 'Escalated' | 'Closed';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    category: string;
    assignee: string;
    createdAt: any;
    updatedAt: any;
}

interface CasesState {
    cases: Case[];
    loading: boolean;
    error: string | null;
}

const initialState: CasesState = {
    cases: [],
    loading: false,
    error: null,
};

export const fetchCases = createAsyncThunk('cases/fetchCases', async (_, { rejectWithValue }) => {
    try {
        const data = await getCases();
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch cases');
    }
});

export const createNewCase = createAsyncThunk(
    'cases/createCase',
    async (newCase: any, { dispatch, rejectWithValue }) => {
        try {
            await addCase(newCase);
            dispatch(fetchCases());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create case');
        }
    }
);

export const modifyCase = createAsyncThunk(
    'cases/modifyCase',
    async ({ id, data }: { id: string; data: any }, { dispatch, rejectWithValue }) => {
        try {
            await updateCase(id, data);
            dispatch(fetchCases());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update case');
        }
    }
);

export const removeCase = createAsyncThunk(
    'cases/removeCase',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            await deleteCase(id);
            dispatch(fetchCases());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete case');
        }
    }
);

const casesSlice = createSlice({
    name: 'cases',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCases.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCases.fulfilled, (state, action) => {
                state.loading = false;
                state.cases = action.payload;
            })
            .addCase(fetchCases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default casesSlice.reducer;
