// Configuração do Redux Store
import { configureStore } from '@reduxjs/toolkit';

// Importar os reducers
import authReducer from './slices/authSlice';
import workoutReducer from './slices/workoutSlice';
import userGoalsReducer from './slices/userGoalsSlice';

// Criar e exportar o store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    workouts: workoutReducer,
    userGoals: userGoalsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar ações específicas ou caminhos de estado que não são serializáveis
        ignoredActions: ['auth/login/fulfilled', 'auth/check/fulfilled'],
        ignoredPaths: ['auth.user']
      }
    })
});

// Exportar o store como padrão também
export default store;
