import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API_BASE_URL from '../../config';

// Estado inicial
const initialState = {
  goals: [],
  selectedGoal: null,
  loading: false,
  error: null,
  lastSyncTime: null
};

// Função para buscar metas do usuário diretamente dentro do slice
const fetchUserGoalsAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/user/goals`);
  if (!response.ok) throw new Error('Erro ao buscar metas');
  return await response.json();
};

// Thunk para listar metas do usuário
export const fetchUserGoals = createAsyncThunk(
  'userGoals/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const goals = await fetchUserGoalsAPI();
      return goals || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Erro ao buscar metas do usuário');
    }
  }
);

// Thunk para obter detalhes de uma meta
export const fetchGoalDetails = createAsyncThunk(
  'userGoals/fetchDetails',
  async (goalId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/goals/${goalId}`);
      if (!response.ok) throw new Error('Erro ao buscar detalhes da meta');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Erro ao buscar detalhes da meta');
    }
  }
);

const userGoalsSlice = createSlice({
  name: 'userGoals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchUserGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default userGoalsSlice.reducer;
