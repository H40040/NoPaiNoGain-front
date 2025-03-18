import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';
import config from '../../config';

// Estado inicial
const initialState = {
  isConnected: true,
  lastCheck: null,
  loading: false,
  error: null
};

// Thunk para verificar conexão
export const checkNetworkStatus = createAsyncThunk(
  'network/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Verificar conexão com o backend
      const response = await fetch(`${config.API_URL}/health`);
      const isConnected = response.ok;
      
      // Salvar estado no storage
      await storage.setNetworkStatus(isConnected);
      
      return { isConnected, timestamp: Date.now() };
    } catch (error) {
      // Se falhar, assumir que está offline
      await storage.setNetworkStatus(false);
      return rejectWithValue({ isConnected: false, error: error.message });
    }
  }
);

// Slice
const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setNetworkStatus: (state, action) => {
      state.isConnected = action.payload.isConnected;
      state.lastCheck = action.payload.timestamp;
      state.error = null;
    },
    clearNetworkError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkNetworkStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkNetworkStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isConnected = action.payload.isConnected;
        state.lastCheck = action.payload.timestamp;
      })
      .addCase(checkNetworkStatus.rejected, (state, action) => {
        state.loading = false;
        state.isConnected = false;
        state.error = action.error.message;
      });
  }
});

export const { setNetworkStatus, clearNetworkError } = networkSlice.actions;

export default networkSlice.reducer;
