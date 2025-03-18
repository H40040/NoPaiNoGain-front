import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import config from '../../config';
import { storage } from '../../utils/storage';
import { formatPromptData } from '../../utils/promptUtils';
import { saveWorkoutToStorage } from '../../utils/storage';

// Configuração base
const API_URL = config.API_BASE_URL;

// Função para gerar o treino usando a API do Gemini e salvá-lo no backend
export const generateWorkout = createAsyncThunk(
  'workouts/generateWorkout',
  async (formData, { rejectWithValue }) => {
    try {
      const dataPrompt = formatPromptData(formData);
      
      // Função para tentar a requisição com retry
      const attemptRequest = async (retryCount = 0, maxRetries = 3) => {
        try {
          const GEMINI_API_KEY = `${config.GEMINI_API_KEY}`; // Certifique-se de que a chave está definida no arquivo de configuração
          // Modificar o timeout para 60 segundos
            const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
              {
                model: "gemini-1.5-flash",
                contents: [{
                  parts: [{
                    text: JSON.stringify(dataPrompt)
                  }]
                }],
              },
              {
                headers: {
                  'Method': 'POST',
                  'Access-Control-Allow-Origin': 'http://localhost:5000',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${GEMINI_API_KEY}`
                },
                timeout: 60000 // 60 segundos de timeout
              }
  );

// Adicionar logs detalhados
console.log('Resposta da API:', response.data);
          
          return response;
        } catch (error) {
          // Se atingiu o número máximo de tentativas, lança o erro
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Verifica se é um erro que pode ser resolvido com retry
          const isRetryable = error.code === 'ECONNABORTED' || 
                             error.response?.status >= 500 ||
                             error.code === 'ERR_NETWORK';
          
          if (isRetryable) {
            // Espera um tempo exponencial antes de tentar novamente
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Tenta novamente
            return attemptRequest(retryCount + 1, maxRetries);
          }
          
          throw error;
        }
      };
      
      const response = await attemptRequest();
      
      if (response.status !== 200) {
        return rejectWithValue({ 
          success: false, 
          error: 'Erro ao gerar treino',
          details: `Status: ${response.status}`
        });
      }
      
      // Extrair o texto gerado
      const generatedText = response.data.candidates[0]?.content?.parts[0]?.text;
      
      if (!generatedText) {
        return rejectWithValue({ 
          success: false, 
          error: 'Resposta vazia da API',
          details: 'Não foi possível gerar o treino'
        });
      }
      
      // Extrair o JSON do texto gerado
      let workoutJson;
      try {
        // Procurar por um objeto JSON no texto
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          workoutJson = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Formato JSON não encontrado na resposta');
        }
      } catch (error) {
        console.error('Erro ao extrair JSON:', error);
        return rejectWithValue({ 
          success: false, 
          error: 'Erro ao processar resposta',
          details: error.message
        });
      }
      
      // Validar o JSON gerado
      if (!workoutJson.name || !workoutJson.description || !workoutJson.exercises || !Array.isArray(workoutJson.exercises)) {
        return rejectWithValue({ 
          success: false, 
          error: 'Treino gerado com formato inválido',
          details: 'Faltam campos obrigatórios no treino gerado'
        });
      }
      
      // Salvar o treino no backend
      try {
        const authHeaders = await storage.getAuthHeaders();
        
        // Enviar o treino para o backend
        const saveResponse = await axios.post(
          config.WORKOUTS.GENERATE,
          {
            ...formData,
            workoutData: workoutJson
          },
          {
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders
            }
          }
        );
        
        if (saveResponse.status === 201 || saveResponse.status === 200) {
          await saveWorkoutToStorage(workoutJson);
          return { 
            success: true, 
            workout: saveResponse.data.workout 
          };
        } else {
          throw new Error(`Erro ao salvar treino: ${saveResponse.status}`);
        }
      } catch (error) {
        console.error('Erro ao salvar treino:', error);
        
        // Se houver erro de conexão, salvar localmente
        if (error.code === 'ERR_NETWORK') {
          const workout = {
            id: uuidv4(),
            ...workoutJson,
            createdAt: new Date().toISOString(),
            isOffline: true
          };
          
          // Obter workouts existentes e adicionar o novo
          const offlineWorkouts = await storage.getWorkouts() || [];
          offlineWorkouts.push(workout);
          
          // Salvar a lista atualizada
          await storage.saveWorkouts(offlineWorkouts);
          
          return { 
            success: true, 
            workout,
            isOffline: true
          };
        }
        
        return rejectWithValue({ 
          success: false, 
          error: 'Erro ao salvar treino',
          details: error.message
        });
      }
    } catch (error) {
      console.error('Erro geral ao gerar treino:', error);
      return rejectWithValue({ 
        success: false, 
        error: 'Erro ao gerar treino',
        details: error.message
      });
    }
  }
);

// Buscar todos os treinos
export const fetchWorkouts = createAsyncThunk(
  'workouts/fetchWorkouts',
  async (_, { rejectWithValue }) => {
    try {
      const authHeaders = await storage.getAuthHeaders();
      
      const response = await axios.get(config.WORKOUTS.LIST, {
        headers: {
          ...authHeaders
        }
      });
      
      if (response.status === 200) {
        // Obter treinos offline
        const offlineWorkouts = await storage.getWorkouts() || [];
        
        // Combinar treinos online e offline
        const allWorkouts = [
          ...response.data.workouts,
          ...offlineWorkouts
        ];
        
        return { workouts: allWorkouts };
      } else {
        throw new Error(`Erro ao buscar treinos: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      
      // Se for erro de rede, tentar carregar do armazenamento local
      if (error.code === 'ERR_NETWORK') {
        const offlineWorkouts = await storage.getWorkouts() || [];
        return { workouts: offlineWorkouts, isOffline: true };
      }
      
      return rejectWithValue({
        error: 'Erro ao buscar treinos',
        details: error.message
      });
    }
  }
);

// Buscar detalhes de um treino específico
export const fetchWorkoutDetails = createAsyncThunk(
  'workouts/fetchWorkoutDetails',
  async (workoutId, { rejectWithValue }) => {
    try {
      // Verificar se é um treino offline
      const offlineWorkouts = await storage.getWorkouts() || [];
      const offlineWorkout = offlineWorkouts.find(w => w.id === workoutId);
      
      if (offlineWorkout) {
        return { workout: offlineWorkout, isOffline: true };
      }
      
      // Se não for offline, buscar do backend
      const authHeaders = await storage.getAuthHeaders();
      
      const response = await axios.get(config.WORKOUTS.DETAILS(workoutId), {
        headers: {
          ...authHeaders
        }
      });
      
      if (response.status === 200) {
        return { workout: response.data.workout };
      } else {
        throw new Error(`Erro ao buscar detalhes do treino: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do treino:', error);
      return rejectWithValue({
        error: 'Erro ao buscar detalhes do treino',
        details: error.message
      });
    }
  }
);

// Iniciar execução de treino
export const startWorkoutExecution = createAsyncThunk(
  'workouts/startExecution',
  async (workoutId, { rejectWithValue }) => {
    try {
      const authHeaders = await storage.getAuthHeaders();
      
      const response = await axios.post(
        config.WORKOUT_EXECUTIONS.START,
        { workoutId },
        {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          }
        }
      );
      
      if (response.status === 201) {
        return { execution: response.data.execution };
      } else {
        throw new Error(`Erro ao iniciar execução: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao iniciar execução:', error);
      
      // Se for erro de rede, criar execução offline
      if (error.code === 'ERR_NETWORK') {
        // Buscar o treino (pode ser offline ou online)
        let workout = null;
        
        // Verificar se é um treino offline
        const offlineWorkouts = await storage.getWorkouts() || [];
        workout = offlineWorkouts.find(w => w.id === workoutId);
        
        if (!workout) {
          return rejectWithValue({
            error: 'Treino não encontrado',
            details: 'Não foi possível iniciar a execução offline'
          });
        }
        
        // Criar execução offline
        const execution = {
          id: uuidv4(),
          workoutId,
          startTime: new Date().toISOString(),
          isCompleted: false,
          exerciseResults: [],
          isOffline: true
        };
        
        // Salvar execução offline
        const offlineExecutions = await storage.getExecutions() || [];
        offlineExecutions.push(execution);
        await storage.saveExecution(execution);
        
        return { execution, isOffline: true };
      }
      
      return rejectWithValue({
        error: 'Erro ao iniciar execução',
        details: error.message
      });
    }
  }
);

// Completar execução de treino
export const completeWorkoutExecution = createAsyncThunk(
  'workouts/completeExecution',
  async ({ executionId, exerciseResults }, { rejectWithValue }) => {
    try {
      // Verificar se é uma execução offline
      const offlineExecutions = await storage.getExecutions() || [];
      const offlineExecution = offlineExecutions.find(e => e.id === executionId);
      
      if (offlineExecution) {
        // Atualizar execução offline
        const updatedExecution = {
          ...offlineExecution,
          isCompleted: true,
          endTime: new Date().toISOString(),
          exerciseResults,
        };
        
        // Atualizar a lista de execuções offline
        const updatedExecutions = offlineExecutions.map(e => 
          e.id === executionId ? updatedExecution : e
        );
        
        // Atualizar as execuções no storage
        for (const execution of updatedExecutions) {
          await storage.saveExecution(execution);
        }
        
        return { execution: updatedExecution, isOffline: true };
      }
      
      // Se não for offline, enviar para o backend
      const authHeaders = await storage.getAuthHeaders();
      
      const response = await axios.post(
        config.WORKOUT_EXECUTIONS.COMPLETE(executionId),
        { exerciseResults },
        {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          }
        }
      );
      
      if (response.status === 200) {
        return { execution: response.data.execution };
      } else {
        throw new Error(`Erro ao completar execução: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao completar execução:', error);
      return rejectWithValue({
        error: 'Erro ao completar execução',
        details: error.message
      });
    }
  }
);

// Buscar histórico de execuções
export const fetchExecutionHistory = createAsyncThunk(
  'workouts/fetchExecutionHistory',
  async (_, { rejectWithValue }) => {
    try {
      const authHeaders = await storage.getAuthHeaders();
      
      const response = await axios.get(config.WORKOUT_EXECUTIONS.HISTORY, {
        headers: {
          ...authHeaders
        }
      });
      
      if (response.status === 200) {
        // Obter execuções offline
        const offlineExecutions = await storage.getExecutions() || [];
        
        // Combinar execuções online e offline
        const allExecutions = [
          ...response.data.executions,
          ...offlineExecutions.filter(e => e.isCompleted)
        ];
        
        return { executions: allExecutions };
      } else {
        throw new Error(`Erro ao buscar histórico: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      
      // Se for erro de rede, tentar carregar do armazenamento local
      if (error.code === 'ERR_NETWORK') {
        const offlineExecutions = await storage.getExecutions() || [];
        return { 
          executions: offlineExecutions.filter(e => e.isCompleted), 
          isOffline: true 
        };
      }
      
      return rejectWithValue({
        error: 'Erro ao buscar histórico',
        details: error.message
      });
    }
  }
);

// Buscar treinos completados
export const fetchCompletedWorkouts = createAsyncThunk(
  'workouts/fetchCompletedWorkouts',
  async (_, { rejectWithValue }) => {
    try {
      const authHeaders = await storage.getAuthHeaders();
      
      const response = await axios.get(config.WORKOUT_EXECUTIONS.HISTORY, {
        headers: {
          ...authHeaders
        }
      });
      
      if (response.status === 200) {
        // Obter execuções offline
        const offlineExecutions = await storage.getExecutions() || [];
        const completedOfflineExecutions = offlineExecutions.filter(exec => exec.isCompleted);
        
        // Combinar execuções online e offline
        const allCompletedWorkouts = [
          ...response.data.executions,
          ...completedOfflineExecutions
        ];
        
        return { completedWorkouts: allCompletedWorkouts };
      } else {
        throw new Error(`Erro ao buscar histórico de treinos: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico de treinos:', error);
      
      // Se for erro de rede, tentar carregar do armazenamento local
      if (error.code === 'ERR_NETWORK') {
        const offlineExecutions = await storage.getExecutions() || [];
        const completedOfflineExecutions = offlineExecutions.filter(exec => exec.isCompleted);
        return { completedWorkouts: completedOfflineExecutions, isOffline: true };
      }
      
      return rejectWithValue({
        error: 'Erro ao buscar histórico de treinos',
        details: error.message
      });
    }
  }
);

// Excluir treino
export const deleteWorkout = createAsyncThunk(
  'workouts/deleteWorkout',
  async (workoutId, { rejectWithValue }) => {
    try {
      // Verificar se é um treino offline
      const offlineWorkouts = await storage.getWorkouts() || [];
      const isOfflineWorkout = offlineWorkouts.some(w => w.id === workoutId);
      
      if (isOfflineWorkout) {
        // Remover treino offline
        const updatedWorkouts = offlineWorkouts.filter(w => w.id !== workoutId);
        await storage.saveWorkouts(updatedWorkouts);
        
        return { workoutId, isOffline: true };
      }
      
      // Se não for offline, excluir do backend
      const authHeaders = await storage.getAuthHeaders();
      
      const response = await axios.delete(config.WORKOUTS.DELETE(workoutId), {
        headers: {
          ...authHeaders
        }
      });
      
      if (response.status === 200) {
        return { workoutId };
      } else {
        throw new Error(`Erro ao excluir treino: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao excluir treino:', error);
      return rejectWithValue({
        error: 'Erro ao excluir treino',
        details: error.message
      });
    }
  }
);

// Slice do Redux
const workoutSlice = createSlice({
  name: 'workouts',
  initialState: {
    workouts: [],
    activeWorkout: null,
    activeExecution: null,
    executionHistory: [],
    completedWorkouts: [],
    loading: false,
    error: null,
    success: null,
    isOfflineMode: false,
  },
  reducers: {
    resetWorkoutState(state) {
      state.activeWorkout = null;
      state.activeExecution = null;
      state.loading = false;
      state.error = null;
      state.success = null;
    },
    setActiveWorkoutExecution(state, action) {
      state.activeExecution = action.payload;
    },
    clearActiveWorkoutExecution(state) {
      state.activeExecution = null;
    },
  },
  extraReducers(builder) {
    builder
      // generateWorkout
      .addCase(generateWorkout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(generateWorkout.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Treino gerado com sucesso!';
        state.activeWorkout = action.payload.workout;
        state.isOfflineMode = !!action.payload.isOffline;
        
        // Adicionar o novo treino à lista se não estiver lá
        const exists = state.workouts.some(w => w.id === action.payload.workout.id);
        if (!exists) {
          state.workouts.push(action.payload.workout);
        }
      })
      .addCase(generateWorkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Erro desconhecido';
      })
      
      // fetchWorkouts
      .addCase(fetchWorkouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.loading = false;
        state.workouts = action.payload.workouts;
        state.isOfflineMode = !!action.payload.isOffline;
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Erro ao buscar treinos';
      })
      
      // fetchWorkoutDetails
      .addCase(fetchWorkoutDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.activeWorkout = null;
      })
      .addCase(fetchWorkoutDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.activeWorkout = action.payload.workout;
        state.isOfflineMode = !!action.payload.isOffline;
      })
      .addCase(fetchWorkoutDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Erro ao buscar detalhes do treino';
      })
      
      // startWorkoutExecution
      .addCase(startWorkoutExecution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startWorkoutExecution.fulfilled, (state, action) => {
        state.loading = false;
        state.activeExecution = action.payload.execution;
        state.isOfflineMode = !!action.payload.isOffline;
      })
      .addCase(startWorkoutExecution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Erro ao iniciar execução';
      })
      
      // completeWorkoutExecution
      .addCase(completeWorkoutExecution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeWorkoutExecution.fulfilled, (state, action) => {
        state.loading = false;
        state.activeExecution = null;
        
        // Adicionar à lista de histórico se não estiver lá
        const exists = state.executionHistory.some(e => e.id === action.payload.execution.id);
        if (!exists) {
          state.executionHistory.unshift(action.payload.execution);
        }
        
        state.isOfflineMode = !!action.payload.isOffline;
      })
      .addCase(completeWorkoutExecution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Erro ao completar execução';
      })
      
      // fetchExecutionHistory
      .addCase(fetchExecutionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExecutionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.executionHistory = action.payload.executions;
        state.isOfflineMode = !!action.payload.isOffline;
      })
      .addCase(fetchExecutionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Erro ao buscar histórico';
      })
      
      // fetchCompletedWorkouts
      .addCase(fetchCompletedWorkouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompletedWorkouts.fulfilled, (state, action) => {
        state.loading = false;
        state.completedWorkouts = action.payload.completedWorkouts;
        state.isOfflineMode = action.payload.isOffline || false;
      })
      .addCase(fetchCompletedWorkouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { error: 'Erro desconhecido ao buscar histórico de treinos' };
      })
      
      // deleteWorkout
      .addCase(deleteWorkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        state.loading = false;
        state.workouts = state.workouts.filter(
          workout => workout.id !== action.payload.workoutId
        );
        
        // Se o treino ativo foi excluído, limpar
        if (state.activeWorkout && state.activeWorkout.id === action.payload.workoutId) {
          state.activeWorkout = null;
        }
        
        state.isOfflineMode = !!action.payload.isOffline;
      })
      .addCase(deleteWorkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Erro ao excluir treino';
      });
  }
});

export const { resetWorkoutState, setActiveWorkoutExecution, clearActiveWorkoutExecution } = workoutSlice.actions;

export default workoutSlice.reducer;
