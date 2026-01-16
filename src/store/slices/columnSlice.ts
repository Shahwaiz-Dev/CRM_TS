import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getColumns, addColumn, updateColumn, deleteColumn } from '@/lib/firebase';

interface Column {
    id: string;
    title: string;
    status: string;
    order: number;
    color?: string;
}

interface ColumnState {
    columns: Column[];
    loading: boolean;
    error: string | null;
}

const initialState: ColumnState = {
    columns: [],
    loading: false,
    error: null,
};

export const fetchColumns = createAsyncThunk('columns/fetchColumns', async (_, { rejectWithValue }) => {
    try {
        const data = await getColumns();
        return data.map((col: any) => ({ ...col, id: col._id })); // Map MongoDB _id to id
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch columns');
    }
});

export const createColumn = createAsyncThunk('columns/createColumn', async (data: Partial<Column>, { dispatch, rejectWithValue }) => {
    try {
        await addColumn(data);
        dispatch(fetchColumns());
        return true;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to create column');
    }
});

export const modifyColumn = createAsyncThunk('columns/modifyColumn', async ({ id, data }: { id: string; data: Partial<Column> }, { rejectWithValue }) => {
    try {
        await updateColumn(id, data);
        // No need to fetch columns - optimistic update in extraReducers handles it
        return { id, data };
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update column');
    }
});

export const removeColumn = createAsyncThunk('columns/removeColumn', async (id: string, { dispatch, rejectWithValue }) => {
    try {
        await deleteColumn(id);
        dispatch(fetchColumns());
        return true;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to delete column');
    }
});

const columnSlice = createSlice({
    name: 'columns',
    initialState,
    reducers: {
        // Synchronous action for immediate optimistic update
        updateColumnOrder: (state, action: PayloadAction<{ id: string; order: number }>) => {
            const { id, order } = action.payload;
            const columnIndex = state.columns.findIndex(c => c.id === id);
            if (columnIndex !== -1) {
                state.columns[columnIndex].order = order;
                // Re-sort columns by order after update
                state.columns.sort((a, b) => (a.order || 0) - (b.order || 0));
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchColumns.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchColumns.fulfilled, (state, action) => {
                state.loading = false;
                state.columns = action.payload;
            })
            .addCase(fetchColumns.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { updateColumnOrder } = columnSlice.actions;

export default columnSlice.reducer;
