import AsyncStorage from '@react-native-async-storage/async-storage';

// Implementação da função atob para React Native
function atob(input) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 === 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  
  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
}

// Constantes para armazenamento
const USER_DATA_KEY = '@user_data';
const WORKOUTS_KEY = '@workouts';
const EXECUTIONS_KEY = '@executions';
const LONG_RUNNING_OPS_KEY = '@long_running_operations';
const NETWORK_STATUS_KEY = '@network_status';
const LAST_GENERATION_KEY = '@last_workout_generation';

export const storage = {
  // Funções para dados do usuário
  setUserData: async (userData) => {
    try {
      console.log('Salvando dados do usuário no storage...');
      const data = {
        ...userData,
        lastUpdate: Date.now()
      };
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
      console.log('Dados do usuário salvos com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      return false;
    }
  },

  getUserData: async () => {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  },

  clearAuth: async () => {
    try {
      await AsyncStorage.removeItem(USER_DATA_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar autenticação:', error);
      return false;
    }
  },

  // Funções para workouts offline
  saveWorkouts: async (workouts) => {
    try {
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
      return true;
    } catch (error) {
      console.error('Erro ao salvar workouts:', error);
      return false;
    }
  },

  getWorkouts: async () => {
    try {
      const data = await AsyncStorage.getItem(WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter workouts:', error);
      return [];
    }
  },

  // Funções para execuções de treino
  saveExecution: async (execution) => {
    try {
      const executions = await storage.getExecutions();
      const updatedExecutions = [...executions, execution];
      await AsyncStorage.setItem(EXECUTIONS_KEY, JSON.stringify(updatedExecutions));
      return true;
    } catch (error) {
      console.error('Erro ao salvar execução:', error);
      return false;
    }
  },

  getExecutions: async () => {
    try {
      const data = await AsyncStorage.getItem(EXECUTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter execuções:', error);
      return [];
    }
  },

  // Função para criar cabeçalhos de autenticação
  getAuthHeaders: async () => {
    try {
      const userData = await storage.getUserData();
      if (!userData || !userData.token) {
        return {};
      }
      return {
        'Authorization': `Bearer ${userData.token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Erro ao obter cabeçalhos de autenticação:', error);
      return {};
    }
  },

  // Funções para gerenciar operações de longa duração
  setLongRunningOperation: async (operationData) => {
    try {
      await AsyncStorage.setItem(LONG_RUNNING_OPS_KEY, JSON.stringify(operationData));
      return true;
    } catch (error) {
      console.error('Erro ao salvar operação de longa duração:', error);
      return false;
    }
  },

  getLongRunningOperation: async () => {
    try {
      const data = await AsyncStorage.getItem(LONG_RUNNING_OPS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao obter operação de longa duração:', error);
      return null;
    }
  },

  clearLongRunningOperation: async () => {
    try {
      await AsyncStorage.removeItem(LONG_RUNNING_OPS_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar operação de longa duração:', error);
      return false;
    }
  },

  // Funções para gerenciar estado da rede
  setNetworkStatus: async (isConnected) => {
    try {
      await AsyncStorage.setItem(NETWORK_STATUS_KEY, JSON.stringify({ isConnected }));
      return true;
    } catch (error) {
      console.error('Erro ao salvar estado da rede:', error);
      return false;
    }
  },

  isNetworkConnected: async () => {
    try {
      const data = await AsyncStorage.getItem(NETWORK_STATUS_KEY);
      return data ? JSON.parse(data).isConnected : false;
    } catch (error) {
      console.error('Erro ao obter estado da rede:', error);
      return false;
    }
  },

  // Funções para rastrear geração de treinos com IA
  setLastGenerationTime: async (timestamp) => {
    try {
      await AsyncStorage.setItem(LAST_GENERATION_KEY, JSON.stringify({ timestamp }));
      return true;
    } catch (error) {
      console.error('Erro ao salvar timestamp de geração:', error);
      return false;
    }
  },

  getLastGenerationTime: async () => {
    try {
      const data = await AsyncStorage.getItem(LAST_GENERATION_KEY);
      return data ? JSON.parse(data).timestamp : null;
    } catch (error) {
      console.error('Erro ao obter timestamp de geração:', error);
      return null;
    }
  },

  // Função para limpar todos os dados
  clearAllData: async () => {
    try {
      await AsyncStorage.multiRemove([
        USER_DATA_KEY,
        WORKOUTS_KEY,
        EXECUTIONS_KEY,
        LONG_RUNNING_OPS_KEY,
        NETWORK_STATUS_KEY,
        LAST_GENERATION_KEY
      ]);
      return true;
    } catch (error) {
      console.error('Erro ao limpar todos os dados:', error);
      return false;
    }
  }
};

export default storage;
