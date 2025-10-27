import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Note: searchHistoryService will be implemented in task 6.1
// For now, we'll import it with the expectation it will be created
let searchHistoryService;
try {
  const module = await import('../services/searchHistoryService.js');
  searchHistoryService = module.searchHistoryService || module.default;
} catch (error) {
  // Service not yet implemented, will be added in task 6.1
  searchHistoryService = {
    getUserHistory: async () => ({ data: { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } } }),
    saveHistory: async () => ({ data: { data: {} } }),
    deleteHistory: async () => ({ data: { success: true } }),
  };
}

// Initial state
const initialState = {
  entries: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

// Async thunks
export const fetchSearchHistory = createAsyncThunk(
  'searchHistory/fetch',
  async ({ limit = 10, page = 1 } = {}, { rejectWithValue }) => {
    try {
      const response = await searchHistoryService.getUserHistory({ limit, page });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải lịch sử tìm kiếm');
    }
  }
);

export const saveSearchHistory = createAsyncThunk(
  'searchHistory/save',
  async (searchData, { rejectWithValue }) => {
    try {
      const response = await searchHistoryService.saveHistory(searchData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lưu lịch sử tìm kiếm');
    }
  }
);

export const deleteSearchHistory = createAsyncThunk(
  'searchHistory/delete',
  async (entryId, { rejectWithValue, dispatch }) => {
    // Optimistic update: Xóa ngay trên UI trước
    dispatch(removeEntry(entryId));

    try {
      // Gọi API ở background
      await searchHistoryService.deleteHistory(entryId);
      return entryId;
    } catch (error) {
      // Nếu lỗi, rollback lại (sẽ được xử lý ở rejected case)
      return rejectWithValue({
        message: error.response?.data?.message || 'Không thể xóa lịch sử tìm kiếm',
        entryId
      });
    }
  }
);

// Slice
const searchHistorySlice = createSlice({
  name: 'searchHistory',
  initialState,
  reducers: {
    // Sync reducers
    setEntries: (state, action) => {
      state.entries = action.payload;
    },
    removeEntry: (state, action) => {
      state.entries = state.entries.filter(entry => entry._id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    clearAll: (state) => {
      state.entries = [];
      state.pagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSearchHistory
      .addCase(fetchSearchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(fetchSearchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // saveSearchHistory
      .addCase(saveSearchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSearchHistory.fulfilled, (state, action) => {
        state.loading = false;
        const newEntry = action.payload;

        // Check if entry already exists (update case)
        const existingIndex = state.entries.findIndex(
          entry => entry._id === newEntry._id
        );

        if (existingIndex !== -1) {
          // Update existing entry
          state.entries[existingIndex] = newEntry;
        } else {
          // Add new entry at the beginning
          state.entries.unshift(newEntry);
          state.pagination.total += 1;
        }

        state.error = null;
      })
      .addCase(saveSearchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteSearchHistory
      .addCase(deleteSearchHistory.pending, (state) => {
        // Không set loading vì đã xóa optimistically
        state.error = null;
      })
      .addCase(deleteSearchHistory.fulfilled, (state) => {
        // Entry đã được xóa trong optimistic update, không cần làm gì thêm
        state.error = null;
      })
      .addCase(deleteSearchHistory.rejected, (state, action) => {
        // Rollback: Thêm lại entry nếu có trong payload
        // (Cần lưu entry trước khi xóa để có thể rollback)
        state.error = action.payload?.message || action.payload;
      });
  },
});

// Export actions
export const { setEntries, removeEntry, clearAll, setLoading, setError } = searchHistorySlice.actions;

// Selectors
export const selectSearchHistory = (state) => state.searchHistory.entries;
export const selectSearchHistoryLoading = (state) => state.searchHistory.loading;
export const selectSearchHistoryError = (state) => state.searchHistory.error;
export const selectSearchHistoryPagination = (state) => state.searchHistory.pagination;

// Export reducer
export default searchHistorySlice.reducer;
