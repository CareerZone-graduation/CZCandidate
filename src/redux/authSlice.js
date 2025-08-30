import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMe } from '../services/authService';
import { saveAccessToken, clearAccessToken, getAccessToken } from '../utils/token';

// Async thunk to fetch user data after login or on app load
export const fetchUser = createAsyncThunk('auth/fetchUser', async (_, { rejectWithValue }) => {
  const token = getAccessToken();
  if (!token) {
    return rejectWithValue('No token found');
  }
  try {
    const response = await getMe();
    // The service already returns response.data
    return response;
  } catch (error) {
    clearAccessToken(); // Clear token if fetching user fails
    return rejectWithValue(error.response?.data || 'Failed to fetch user');
  }
});

const initialState = {
  user: null, // Will hold user and profile info
  isAuthenticated: !!getAccessToken(),
  isInitializing: true, // To track the initial user fetch
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { accessToken } = action.payload;
      saveAccessToken(accessToken);
      state.isAuthenticated = true;
      state.error = null;
    },
    logoutSuccess: (state) => {
      clearAccessToken();
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
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

export const { loginSuccess, logoutSuccess } = authSlice.actions;

export default authSlice.reducer;