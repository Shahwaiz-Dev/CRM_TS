import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getOpportunities, addOpportunity, updateOpportunity, deleteOpportunity } from '@/lib/firebase';

interface Opportunity {
    id: string;
    name: string;
    account: string;
    companyName: string;
    companyBillingAddress: string;
    amount: number;
    closeDate: string;
    stage: string;
    owner: string;
}

interface OpportunitiesState {
    opportunities: Opportunity[];
    loading: boolean;
    error: string | null;
}

const initialState: OpportunitiesState = {
    opportunities: [],
    loading: false,
    error: null,
};

export const fetchOpportunities = createAsyncThunk('opportunities/fetchOpportunities', async (_, { rejectWithValue }) => {
    try {
        const data = await getOpportunities();
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch opportunities');
    }
});

export const createNewOpportunity = createAsyncThunk(
    'opportunities/createOpportunity',
    async (opportunity: any, { dispatch, rejectWithValue }) => {
        try {
            await addOpportunity(opportunity);
            dispatch(fetchOpportunities());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create opportunity');
        }
    }
);

export const modifyOpportunity = createAsyncThunk(
    'opportunities/modifyOpportunity',
    async ({ id, data }: { id: string; data: any }, { dispatch, rejectWithValue }) => {
        try {
            await updateOpportunity(id, data);
            dispatch(fetchOpportunities());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update opportunity');
        }
    }
);

export const removeOpportunity = createAsyncThunk(
    'opportunities/removeOpportunity',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            await deleteOpportunity(id);
            dispatch(fetchOpportunities());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete opportunity');
        }
    }
);

const opportunitiesSlice = createSlice({
    name: 'opportunities',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOpportunities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOpportunities.fulfilled, (state, action) => {
                state.loading = false;
                state.opportunities = action.payload;
            })
            .addCase(fetchOpportunities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default opportunitiesSlice.reducer;
