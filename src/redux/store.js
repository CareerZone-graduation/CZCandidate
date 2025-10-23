import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import searchHistoryReducer from './searchHistorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    searchHistory: searchHistoryReducer,
  },
});