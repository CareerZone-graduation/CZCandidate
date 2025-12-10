import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMe } from '../services/authService';
import { saveAccessToken, clearAccessToken, getAccessToken } from '../utils/token';
import { fetchOnboardingStatus } from './slices/onboardingThunks';

// Async thunk to fetch user data
export const fetchUser = createAsyncThunk('auth/fetchUser', async (_, { rejectWithValue, dispatch }) => {
  const token = getAccessToken();
  if (!token) {
    return rejectWithValue('No token found');
  }
  try {
    const response = await getMe();
    // Fetch onboarding status after successful user fetch
    dispatch(fetchOnboardingStatus());
    // Giả định response.data chứa { user: { ..., coinBalance: 100 }, profile: {...} }
    return response.data;
  } catch (error) {
    clearAccessToken();
    return rejectWithValue(error.response?.data || 'Failed to fetch user');
  }
});

const initialState = {
  user: null,
  isAuthenticated: !!getAccessToken(),
  isEmailVerified: false, // NEW: Track email verification status
  isInitializing: !!getAccessToken(), // Only initialize if a token exists
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setInitialized: (state) => {
      state.isInitializing = false;
    },
    loginSuccess: (state, action) => {
      const { accessToken } = action.payload;
      saveAccessToken(accessToken);
      state.isAuthenticated = true;
      state.error = null;
      state.isInitializing = false; // On login, initialization is also complete
    },
    logoutSuccess: (state) => {
      clearAccessToken();
      state.user = null;
      state.isAuthenticated = false;
      state.isEmailVerified = false;
      state.error = null;
      state.isInitializing = false; // On logout, we are also in a stable state
    },
    // Thêm reducer này để cập nhật số dư xu
    updateCoinBalance: (state, action) => {
      if (state.user && state.user.user) {
        state.user.user.coinBalance = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload; // The payload is the user object
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload?.user?.isEmailVerified || false;
        state.isInitializing = false;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isInitializing = false;
        state.error = action.payload;
      });
  },
});

export const { setInitialized, loginSuccess, logoutSuccess, updateCoinBalance } = authSlice.actions;

export default authSlice.reducer;