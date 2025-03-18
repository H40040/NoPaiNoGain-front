import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userGoals } from '../../services/userGoals';
//import { storage } from '../../utils/storage';
//import config from '../../config';

// Estado inicial
const initialState = {
  goals: [],
  selectedGoal: null,
  loading: false,
  error: null,
  lastSyncTime: null
};

// Thunk para listar metas do usuário
export const fetchUserGoals = createAsyncThunk(
  'userGoals/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userGoals.list();
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.goals || [];
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
      const response = await userGoals.getDetails(goalId);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.goal;
    } catch (error) {
      return rejectWithValue(error.message || 'Erro ao buscar detalhes da meta');
    }
  }
);

// Thunk para criar uma nova meta
export const createUserGoal = createAsyncThunk(
  'userGoals/create',
  async (goalData, { rejectWithValue }) => {
    try {
      const response = await userGoals.create(goalData);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.goal;
    } catch (error) {
      return rejectWithValue(error.message || 'Erro ao criar meta');
    }
  }
);

// Thunk para atualizar uma meta
export const updateUserGoal = createAsyncThunk(
  'userGoals/update',
  async ({ id, goalData }, { rejectWithValue }) => {
    try {
      const response = await userGoals.update(id, goalData);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.goal;
    } catch (error) {
      return rejectWithValue(error.message || 'Erro ao atualizar meta');
    }
  }
);

// Thunk para excluir uma meta
export const deleteUserGoal = createAsyncThunk(
  'userGoals/delete',
  async (goalId, { rejectWithValue }) => {
    try {
      const response = await userGoals.delete(goalId);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return goalId;
    } catch (error) {
      return rejectWithValue(error.message || 'Erro ao excluir meta');
    }
  }
);

// Thunk para atualizar o progresso de uma meta
export const updateGoalProgress = createAsyncThunk(
  'userGoals/updateProgress',
  async ({ id, progressData }, { rejectWithValue }) => {
    try {
      const response = await userGoals.updateProgress(id, progressData);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.goal;
    } catch (error) {
      return rejectWithValue(error.message || 'Erro ao atualizar progresso da meta');
    }
  }
);

// Slice para metas do usuário
const userGoalsSlice = createSlice({
  name: 'userGoals',
  initialState,
  reducers: {
    // Limpar erro
    clearError: (state) => {
      state.error = null;
    },
    
    // Limpar meta selecionada
    clearSelectedGoal: (state) => {
      state.selectedGoal = null;
    },
    
    // Registrar sincronização
    syncComplete: (state) => {
      state.lastSyncTime = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    // Listar metas
    builder
      .addCase(fetchUserGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(fetchUserGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erro ao buscar metas';
      })
    
    // Detalhes da meta
      .addCase(fetchGoalDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGoal = action.payload;
      })
      .addCase(fetchGoalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erro ao buscar detalhes da meta';
      })
    
    // Criar meta
      .addCase(createUserGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.push(action.payload);
      })
      .addCase(createUserGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erro ao criar meta';
      })
    
    // Atualizar meta
      .addCase(updateUserGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserGoal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goals.findIndex(goal => goal._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        if (state.selectedGoal && state.selectedGoal._id === action.payload._id) {
          state.selectedGoal = action.payload;
        }
      })
      .addCase(updateUserGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erro ao atualizar meta';
      })
    
    // Excluir meta
      .addCase(deleteUserGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.filter(goal => goal._id !== action.payload);
        if (state.selectedGoal && state.selectedGoal._id === action.payload) {
          state.selectedGoal = null;
        }
      })
      .addCase(deleteUserGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erro ao excluir meta';
      })
    
    // Atualizar progresso
      .addCase(updateGoalProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoalProgress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goals.findIndex(goal => goal._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        if (state.selectedGoal && state.selectedGoal._id === action.payload._id) {
          state.selectedGoal = action.payload;
        }
      })
      .addCase(updateGoalProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erro ao atualizar progresso da meta';
      });
  }
});

export const { clearError, clearSelectedGoal, syncComplete } = userGoalsSlice.actions;
export default userGoalsSlice.reducer;
