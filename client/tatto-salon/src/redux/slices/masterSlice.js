import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

export const registerMaster = createAsyncThunk(
    'master/register',
    async (params, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/masters/registration', params);
            return data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

export const loginMaster = createAsyncThunk(
    'master/login',
    async (params, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/masters/login', params);
            return data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

export const fetchCurrentMaster = createAsyncThunk(
    'master/fetchCurrentMaster',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/masters/auth');
            return data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

export const updateMaster = createAsyncThunk(
    'master/updateMaster',
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/masters/${formData.id}`, formData);
            return data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

export const deleteMaster = createAsyncThunk(
    'master/deleteMaster',
    async (masterId, { rejectWithValue }) => {
        try {
            await axios.delete(`/masters/${masterId}`);
            return;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

export const fetchAllMasters = createAsyncThunk(
    'master/fetchAllMasters',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/masters/');
            return data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

export const fetchMasterById = createAsyncThunk(
    'master/fetchMasterById',
    async (masterId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/masters/${masterId}`);
            return data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

const initialState = {
    master: null,
    masters: [],
    status: 'idle',
    error: null,
};

const masterSlice = createSlice({
    name: 'master',
    initialState,
    reducers: {
        logoutMaster: (state) => {
            state.master = null;
            state.status = 'idle';
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            delete axios.defaults.headers.common['Authorization'];
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerMaster.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registerMaster.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Не обновляем state.master – регистрация не приводит к авторизации мастера.
                // Если нужно уведомить пользователя об успешной регистрации, можно установить successMessage в компоненте.
            })
            .addCase(registerMaster.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Login
            .addCase(loginMaster.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginMaster.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.master = action.payload.master;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('role', action.payload.role);
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })
            .addCase(loginMaster.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Fetch current master
            .addCase(fetchCurrentMaster.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCurrentMaster.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.master = action.payload.master;
            })
            .addCase(fetchCurrentMaster.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Update master
            .addCase(updateMaster.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateMaster.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.master = action.payload.master;
            })
            .addCase(updateMaster.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Delete master
            .addCase(deleteMaster.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteMaster.fulfilled, (state) => {
                state.status = 'succeeded';
                state.master = null;
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                delete axios.defaults.headers.common['Authorization'];
            })
            .addCase(deleteMaster.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Fetch all masters
            .addCase(fetchAllMasters.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllMasters.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.masters = action.payload.masters;
            })
            .addCase(fetchAllMasters.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Fetch master by ID
            .addCase(fetchMasterById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchMasterById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const master = action.payload.master;
                const existingMaster = state.masters.find((m) => m.id === master.id);
                if (existingMaster) {
                    Object.assign(existingMaster, master);
                } else {
                    state.masters.push(master);
                }
            })
            .addCase(fetchMasterById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

export const selectIsMasterAuth = (state) => Boolean(state.master.master);
export const selectCurrentMaster = (state) => state.master.master;
export const selectAllMasters = (state) => state.master.masters;
export const selectMasterStatus = (state) => state.master.status;
export const selectMasterError = (state) => state.master.error;

export const { logoutMaster } = masterSlice.actions;
export default masterSlice.reducer;