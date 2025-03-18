import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../utils/authManager';
import { storage } from '../../utils/storage';

// Estado inicial
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
  offlineMode: false,
  lastSyncTime: null
};

// Thunk para login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Auth Slice: Iniciando login para', credentials.email);
      const userData = await authService.login(credentials.email, credentials.password);
      console.log('Auth Slice: Login bem-sucedido:', userData);
      return userData;
    } catch (error) {
      console.error('Auth Slice: Erro no login:', error);
      return rejectWithValue(error.message || 'Falha na autenticação');
    }
  }
);

// Thunk para registro
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Auth Slice: Iniciando registro para', userData.email);
      const result = await authService.register(userData);
      console.log('Auth Slice: Registro bem-sucedido:', result);
      return result;
    } catch (error) {
      console.error('Auth Slice: Erro no registro:', error);
      return rejectWithValue(error.message || 'Falha no registro');
    }
  }
);

// Thunk para verificar autenticação
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Auth Slice: Verificando autenticação...');
      const userData = await storage.getUserData();
      
      if (!userData || !userData.token) {
        console.log('Auth Slice: Nenhum token encontrado');
        return null;
      }
      
      // Verificar se o token é válido
      try {
        console.log('Auth Slice: Validando token...');
        const isValid = await authService.validateToken(userData.token);
        
        if (!isValid) {
          console.log('Auth Slice: Token inválido, limpando dados');
          await storage.clearAuth();
          return null;
        }
        
        console.log('Auth Slice: Token válido, usuário autenticado');
        return userData;
      } catch (validationError) {
        console.warn('Auth Slice: Erro ao validar token:', validationError.message);
        
        // Se estiver offline, permitir continuar com o token existente
        if (validationError.message.includes('conexão') || 
            validationError.message.includes('rede') ||
            validationError.message.includes('Network Error')) {
          console.log('Auth Slice: Modo offline detectado, continuando com dados locais');
          return { ...userData, offlineMode: true };
        }
        
        // Se o erro for de token inválido, limpar autenticação
        await storage.clearAuth();
        return null;
      }
    } catch (error) {
      console.error('Auth Slice: Erro ao verificar autenticação:', error);
      return rejectWithValue(error.message || 'Erro ao verificar autenticação');
    }
  }
);

// Thunk para logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Auth Slice: Realizando logout...');
      await storage.clearAuth();
      return true;
    } catch (error) {
      console.error('Auth Slice: Erro ao fazer logout:', error);
      return rejectWithValue(error.message || 'Erro ao fazer logout');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOfflineMode: (state, action) => {
      state.offlineMode = action.payload;
    },
    syncComplete: (state) => {
      state.lastSyncTime = new Date().toISOString();
      state.offlineMode = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.offlineMode = action.payload.offlineMode || false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Registro
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Verificação de autenticação
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.offlineMode = action.payload.offlineMode || false;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.offlineMode = false;
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.offlineMode = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setOfflineMode, syncComplete } = authSlice.actions;
export default authSlice.reducer;
