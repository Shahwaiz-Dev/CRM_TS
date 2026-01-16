import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getSprints, addSprint, updateSprint, deleteSprint } from '@/lib/firebase';

interface Sprint {
    id: string;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'planned';
}

interface SprintsState {
    sprints: Sprint[];
    loading: boolean;
    error: string | null;
}

const initialState: SprintsState = {
    sprints: [],
    loading: false,
    error: null,
};

export const fetchSprints = createAsyncThunk('sprints/fetchSprints', async (_, { rejectWithValue }) => {
    try {
        const data = await getSprints();
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch sprints');
    }
});

export const createNewSprint = createAsyncThunk(
    'sprints/createSprint',
    async (sprint: any, { dispatch, rejectWithValue }) => {
        try {
            await addSprint(sprint);
            dispatch(fetchSprints());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create sprint');
        }
    }
);

export const modifySprint = createAsyncThunk(
    'sprints/modifySprint',
    async ({ id, data }: { id: string; data: any }, { dispatch, rejectWithValue }) => {
        try {
            await updateSprint(id, data);
            dispatch(fetchSprints());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update sprint');
        }
    }
);

export const removeSprint = createAsyncThunk(
    'sprints/removeSprint',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            await deleteSprint(id);
            dispatch(fetchSprints());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete sprint');
        }
    }
);

const sprintsSlice = createSlice({
    name: 'sprints',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSprints.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSprints.fulfilled, (state, action) => {
                state.loading = false;
                state.sprints = action.payload;
            })
            .addCase(fetchSprints.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default sprintsSlice.reducer;
