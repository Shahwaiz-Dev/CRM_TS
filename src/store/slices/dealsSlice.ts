import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getDeals, addDeal, updateDeal, deleteDeal, addNotification } from '@/lib/firebase';

interface Deal {
    id: string;
    name: string;
    companyName: string;
    amount: number;
    stage: string;
    priority: 1 | 2 | 3;
    owner: string;
    type: string;
    description: string;
    position: number;
    avatar?: string;
    closeDate?: string;
    closedAt?: any;
    createdAt?: any;
    updatedAt?: any;
}

interface DealsState {
    deals: Deal[];
    loading: boolean;
    error: string | null;
}

const initialState: DealsState = {
    deals: [],
    loading: false,
    error: null,
};

export const fetchDeals = createAsyncThunk('deals/fetchDeals', async (_, { rejectWithValue }) => {
    try {
        const data = await getDeals();
        return data; // Backend returns items with id mapping already done by plugin
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch deals');
    }
});

export const createDeal = createAsyncThunk(
    'deals/createDeal',
    async (newDeal: any, { dispatch, rejectWithValue }) => {
        try {
            const data = await addDeal(newDeal);
            await addNotification({
                title: 'New Deal Created',
                body: `New deal "${newDeal.name}" worth $${newDeal.amount?.toLocaleString()} has been created for ${newDeal.companyName}`,
                type: 'deal'
            });
            dispatch(fetchDeals());
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create deal');
        }
    }
);

export const modifyDeal = createAsyncThunk(
    'deals/modifyDeal',
    async ({ id, data }: { id: string; data: any }, { dispatch, rejectWithValue }) => {
        try {
            await updateDeal(id, data);
            if (data.stage === 'Won' || data.stage === 'Lost') {
                await addNotification({
                    title: `Deal ${data.stage}`,
                    body: `Deal status has been changed to ${data.stage}!`,
                    type: 'deal'
                });
            }
            dispatch(fetchDeals());
            return { id, data };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update deal');
        }
    }
);

export const removeDeal = createAsyncThunk(
    'deals/removeDeal',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            await deleteDeal(id);
            dispatch(fetchDeals());
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete deal');
        }
    }
);

const dealsSlice = createSlice({
    name: 'deals',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDeals.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDeals.fulfilled, (state, action) => {
                state.loading = false;
                state.deals = action.payload;
            })
            .addCase(fetchDeals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createDeal.pending, (state) => {
                state.loading = true;
            })
            .addCase(createDeal.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createDeal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(modifyDeal.pending, (state, action) => {
                // Optimistic update
                const { id, data } = action.meta.arg;
                const deal = state.deals.find(d => d.id === id);
                if (deal) {
                    Object.assign(deal, data);
                }
            })
            .addCase(modifyDeal.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = dealsSlice.actions;
export default dealsSlice.reducer;
