import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getTasks, addTask, updateTask, deleteTask } from '@/lib/firebase';

interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Not Started' | 'In Progress' | 'Completed';
    dueDate: string;
    account: string;
}

interface TasksState {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

const initialState: TasksState = {
    tasks: [],
    loading: false,
    error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
    try {
        const data = await getTasks();
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
});

export const createNewTask = createAsyncThunk(
    'tasks/createTask',
    async (task: any, { rejectWithValue }) => {
        try {
            const newTask = await addTask(task);
            return newTask;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create task');
        }
    }
);

export const modifyTask = createAsyncThunk(
    'tasks/modifyTask',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const updatedTask = await updateTask(id, data);
            return updatedTask;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update task');
        }
    }
);

export const removeTask = createAsyncThunk(
    'tasks/removeTask',
    async (id: string, { rejectWithValue }) => {
        try {
            await deleteTask(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete task');
        }
    }
);

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createNewTask.fulfilled, (state, action) => {
                state.tasks.push(action.payload);
            })
            .addCase(modifyTask.fulfilled, (state, action) => {
                const index = state.tasks.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
            })
            .addCase(modifyTask.pending, (state, action) => {
                const { id, data } = action.meta.arg;
                const task = state.tasks.find(t => t.id === id);
                if (task) {
                    Object.assign(task, data);
                }
            })
            .addCase(removeTask.fulfilled, (state, action) => {
                state.tasks = state.tasks.filter(t => t.id !== action.payload);
            });
    },
});

export default tasksSlice.reducer;
