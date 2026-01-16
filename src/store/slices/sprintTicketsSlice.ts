import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getSprints, getTickets, updateTicket, addTicket as addTicketApi, addSprint, updateSprint, deleteSprint, deleteTicket } from '@/lib/firebase';


export const removeTicket = createAsyncThunk(
    'sprintTickets/removeTicket',
    async (id: string, { rejectWithValue }) => {
        try {
            await deleteTicket(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete ticket');
        }
    }
);

export const removeSprint = createAsyncThunk(
    'sprintTickets/removeSprint',
    async (id: string, { rejectWithValue }) => {
        try {
            await deleteSprint(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete sprint');
        }
    }
);


interface Sprint {
    id: string;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'planned';
}

interface Ticket {
    id: string;
    title: string;
    description: string;
    priority: string;
    assignee: string;
    status: string;
    sprintId: string;
    labelIds: string[];
    position: number;
    estimatedTime: string;
    commentCount: number;
}

interface SprintTicketsState {
    sprints: Sprint[];
    tickets: Ticket[];
    selectedSprintId: string | null;
    loading: boolean;
    sprintsLoading: boolean;
    error: string | null;
}

const initialState: SprintTicketsState = {
    sprints: [],
    tickets: [],
    selectedSprintId: null,
    loading: false,
    sprintsLoading: false,
    error: null,
};

export const fetchSprints = createAsyncThunk('sprintTickets/fetchSprints', async (_, { rejectWithValue }) => {
    try {
        const data = await getSprints();
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch sprints');
    }
});

export const fetchTickets = createAsyncThunk('sprintTickets/fetchTickets', async (sprintId: string, { rejectWithValue }) => {
    try {
        const data = await getTickets(sprintId);
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch tickets');
    }
});

export const createSprint = createAsyncThunk(
    'sprintTickets/createSprint',
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

export const createTicket = createAsyncThunk(
    'sprintTickets/createTicket',
    async (ticket: any, { dispatch, rejectWithValue }) => {
        try {
            await addTicketApi(ticket);
            dispatch(fetchTickets(ticket.sprintId));
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create ticket');
        }
    }
);

export const modifyTicket = createAsyncThunk(
    'sprintTickets/modifyTicket',
    async ({ id, data, sprintId }: { id: string; data: any; sprintId: string }, { rejectWithValue }) => {
        try {
            await updateTicket(id, data);
            return { id, data };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update ticket');
        }
    }
);

const sprintTicketsSlice = createSlice({
    name: 'sprintTickets',
    initialState,
    reducers: {
        setSelectedSprintId: (state, action: PayloadAction<string>) => {
            state.selectedSprintId = action.payload;
        },
        incrementCommentCount: (state, action: PayloadAction<string>) => {
            const ticket = state.tickets.find(t => t.id === action.payload);
            if (ticket) {
                ticket.commentCount = (ticket.commentCount || 0) + 1;
            }
        },
        decrementCommentCount: (state, action: PayloadAction<string>) => {
            const ticket = state.tickets.find(t => t.id === action.payload);
            if (ticket && ticket.commentCount > 0) {
                ticket.commentCount -= 1;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSprints.pending, (state) => {
                state.sprintsLoading = true;
            })
            .addCase(fetchSprints.fulfilled, (state, action) => {
                state.sprintsLoading = false;
                state.sprints = action.payload;
                if (state.sprints.length > 0 && !state.selectedSprintId) {
                    state.selectedSprintId = state.sprints[0].id;
                }
            })
            .addCase(fetchSprints.rejected, (state, action) => {
                state.sprintsLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchTickets.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.tickets = action.payload;
            })
            .addCase(fetchTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(modifyTicket.pending, (state, action) => {
                // Optimistic update
                const { id, data } = action.meta.arg;
                const ticket = state.tickets.find(t => t.id === id);
                if (ticket) {
                    Object.assign(ticket, data);
                }
            })
            .addCase(modifyTicket.rejected, (state, action) => {
                state.error = action.payload as string;
                // In a real app, we might want to revert the optimistic update here
                // if we tracked the previous state. For now, just show error.
            })
            .addCase(removeTicket.fulfilled, (state, action) => {
                state.tickets = state.tickets.filter(t => t.id !== action.payload);
            })
            .addCase(removeSprint.fulfilled, (state, action) => {
                state.sprints = state.sprints.filter(s => s.id !== action.payload);
                if (state.selectedSprintId === action.payload) {
                    state.selectedSprintId = state.sprints.length > 0 ? state.sprints[0].id : null;
                }
            });
    },
});

export const { setSelectedSprintId, incrementCommentCount, decrementCommentCount } = sprintTicketsSlice.actions;
export default sprintTicketsSlice.reducer;
