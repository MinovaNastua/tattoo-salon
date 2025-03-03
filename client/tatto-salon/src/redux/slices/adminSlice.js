import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

export const registerAdmin = createAsyncThunk(
    'admin/register',
    async (params, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/admins/registration', params);
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

export const loginAdmin = createAsyncThunk(
    'admin/login',
    async (params, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/admins/login', params);
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

export const fetchCurrentAdmin = createAsyncThunk(
    'admin/fetchCurrentAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/admins/auth');
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

export const updateAdmin = createAsyncThunk(
    'admin/updateAdmin',
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/admins/${formData.id}`, formData);
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

export const deleteAdmin = createAsyncThunk(
    'admin/deleteAdmin',
    async (adminId, { rejectWithValue }) => {
        try {
            await axios.delete(`/admins/${adminId}`);
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

export const fetchAllAdmins = createAsyncThunk(
    'admin/fetchAllAdmins',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/admins/');
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

export const fetchAdminById = createAsyncThunk(
    'admin/fetchAdminById',
    async (adminId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/admins/${adminId}`);
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
    admin: null,
    admins: [],
    status: 'idle',
    error: null,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        logoutAdmin: (state) => {
            state.admin = null;
            state.status = 'idle';
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            delete axios.defaults.headers.common['Authorization'];
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerAdmin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registerAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Не обновляем state.admin – таким образом, регистрация не будет вызывать автоматический вход
                // state.admin = action.payload;  <-- удаляем эту строку
            })
            .addCase(registerAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Login
            .addCase(loginAdmin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Если API возвращает администратора не вложенным в admin, а напрямую:
                state.admin = action.payload; // вместо action.payload.admin
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('role', action.payload.role); // вместо action.payload.admin.role
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })
            .addCase(loginAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Fetch current admin
            .addCase(fetchCurrentAdmin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCurrentAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.admin = action.payload.admin;
            })
            .addCase(fetchCurrentAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Update admin
            .addCase(updateAdmin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.admin = action.payload.admin;
            })
            .addCase(updateAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Delete admin
            .addCase(deleteAdmin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteAdmin.fulfilled, (state) => {
                state.status = 'succeeded';
                state.admin = null;
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                delete axios.defaults.headers.common['Authorization'];
            })
            .addCase(deleteAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Fetch all admins
            .addCase(fetchAllAdmins.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllAdmins.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.admins = action.payload.admins;
            })
            .addCase(fetchAllAdmins.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Fetch admin by ID
            .addCase(fetchAdminById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAdminById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const admin = action.payload.admin;
                const existingAdmin = state.admins.find((a) => a.id === admin.id);
                if (existingAdmin) {
                    Object.assign(existingAdmin, admin);
                } else {
                    state.admins.push(admin);
                }
            })
            .addCase(fetchAdminById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

export const selectIsAdminAuth = (state) => Boolean(state.admin.admin);
export const selectCurrentAdmin = (state) => state.admin.admin;
export const selectAllAdmins = (state) => state.admin.admins;
export const selectAdminStatus = (state) => state.admin.status;
export const selectAdminError = (state) => state.admin.error;

export const { logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;