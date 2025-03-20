import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API_BASE_URL from '../../config';

// Estado inicial
const initialState = {
  user: null,
  loading: false,
  error: null,
};

// Thunk para buscar dados do usuário
export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`);
      if (!response.ok) throw new Error('Erro ao buscar perfil do usuário');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Erro ao carregar perfil do usuário');
    }
  }
);

// Thunk para atualizar dados do usuário
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Erro ao atualizar perfil');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Erro ao atualizar perfil do usuário');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
