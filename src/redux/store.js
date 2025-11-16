import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import searchHistoryReducer from './searchHistorySlice';
import onboardingReducer from './slices/onboardingSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    searchHistory: searchHistoryReducer,
    onboarding: onboardingReducer,
    notifications: notificationReducer,
  },
});