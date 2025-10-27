import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import searchHistoryReducer from './searchHistorySlice';
import onboardingReducer from './slices/onboardingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    searchHistory: searchHistoryReducer,
    onboarding: onboardingReducer,
  },
});