// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import masterReducer from './slices/masterSlice';
import adminReducer from './slices/adminSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        master: masterReducer,
        admin: adminReducer,
    },
});

export default store;
