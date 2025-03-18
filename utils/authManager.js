import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { storage } from './storage';
import config from '../config';
import { logoutUser, setOfflineMode } from '../store/slices/authSlice';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

// Constantes para controle de tempo de autenticação
const TOKEN_REFRESH_MARGIN = 5 * 60 * 1000; // 5 minutos antes da expiração (buffer de segurança)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos de inatividade
const TOKEN_MONITOR_INTERVAL = 5 * 60 * 1000; // Verificar token a cada 5 minutos

// Variáveis para controle de monitoramento de token
let tokenMonitorInterval = null;
let tokenRefreshInProgress = false;
let lastActivityTime = Date.now();
let storeRef = null;
let isOfflineMode = false;
let networkMonitorUnsubscribe = null;

/**
 * Configura os interceptores do Axios para adicionar o token de autenticação
 * e tratar erros de autenticação
 * @param {Object} store - Referência ao Redux store
 */
export const setupAuthInterceptors = (store) => {
  // Verificar se o store foi fornecido
  if (!store) {
    console.error('Redux store não fornecido para setupAuthInterceptors');
    return;
  }

  console.log('Configurando interceptadores do Axios...');
  
  // Salvar referência ao store
  storeRef = store;

  // Monitorar estado da rede
  setupNetworkMonitoring();

  // Remover interceptadores existentes para evitar duplicação
  axios.interceptors.request.handlers = [];
  axios.interceptors.response.handlers = [];

  // Interceptador de requisição para adicionar o token
  axios.interceptors.request.use(
    async (config) => {
      // Atualizar timestamp de última atividade
      updateActivity();

      // Não adicionar token para requisições de login ou registro
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
        return config;
      }

      try {
        // Obter token do storage
        const userData = await storage.getUserData();
        if (userData?.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Erro ao obter token:', error);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptador de resposta para tratar erros de autenticação
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Atualizar timestamp de atividade
      updateActivity();
      
      // Se não houver resposta ou status, provavelmente é um erro de rede
      if (!error.response) {
        console.log('Erro de rede detectado:', error.message);
        
        // Verificar conectividade
        const isConnected = await storage.isNetworkConnected();
        
        if (!isConnected && storeRef) {
          console.log('Dispositivo offline. Ativando modo offline...');
          storeRef.dispatch(setOfflineMode(true));
        }
        
        return Promise.reject(error);
      }
      
      // Se o erro for 401 (Não Autorizado), tentar renovar o token
      if (error.response.status === 401) {
        console.log('Erro 401 detectado. Verificando possibilidade de renovação do token...');
        
        // Verificar se a requisição já foi repetida após renovação de token
        // para evitar loop infinito
        if (error.config._isRetry) {
          console.log('Requisição já foi repetida após renovação. Evitando loop infinito.');
          return Promise.reject(error);
        }
        
        try {
          // Tentar renovar o token
          const tokenRenewed = await refreshToken();
          
          if (tokenRenewed) {
            // Se o token foi renovado com sucesso, tentar novamente a requisição original
            console.log('Token renovado com sucesso. Repetindo requisição original...');
            const userData = await storage.getUserData();
            
            // Atualizar o token na requisição original
            error.config.headers.Authorization = `Bearer ${userData.token}`;
            
            // Marcar a requisição como repetida
            error.config._isRetry = true;
            
            // Repetir a requisição original com o novo token
            return axios(error.config);
          } else {
            // Se não foi possível renovar o token, verificar se é uma falha temporária
            const isConnected = await storage.isNetworkConnected();
            
            if (!isConnected) {
              console.log('Falha na renovação do token devido a problemas de rede. Ativando modo offline...');
              if (storeRef) {
                storeRef.dispatch(setOfflineMode(true));
              }
              return Promise.reject(error);
            }
            
            // Se estiver conectado mas não conseguiu renovar, fazer logout
            console.log('Falha na renovação do token com conexão ativa. Realizando logout...');
            if (storeRef) {
              storeRef.dispatch(logoutUser());
            }
          }
        } catch (refreshError) {
          console.error('Erro ao tentar renovar o token:', refreshError);
          
          // Verificar se é um erro de rede
          if (!refreshError.response) {
            console.log('Erro de rede ao renovar token. Ativando modo offline...');
            if (storeRef) {
              storeRef.dispatch(setOfflineMode(true));
            }
            return Promise.reject(error);
          }
          
          // Se não for erro de rede, fazer logout
          console.log('Erro ao renovar token. Realizando logout...');
          if (storeRef) {
            storeRef.dispatch(logoutUser());
          }
        }
      }
      
      return Promise.reject(error);
    }
  );

  console.log('Interceptadores do Axios configurados com sucesso');
};

/**
 * Valida se o token atual é válido
 * @returns {Promise<boolean>} - Promise que resolve para true se o token for válido
 */
export const validateAuthentication = async () => {
  try {
    console.log('Validando autenticação...');
    
    // Obter dados do usuário do storage
    const userData = await storage.getUserData();
    
    // Se não houver dados do usuário ou token, a autenticação é inválida
    if (!userData || !userData.token) {
      console.log('Nenhum token encontrado');
      return false;
    }
    
    // Decodificar o token para verificar a expiração
    try {
      const decoded = jwt_decode(userData.token);
      
      // Verificar se o token possui informação de expiração
      if (!decoded.exp) {
        console.warn('Token não possui informação de expiração');
        return true; // Assumir que é válido se não tiver exp
      }
      
      // Verificar se o token está expirado
      const expirationTime = decoded.exp * 1000; // Converter para milissegundos
      const currentTime = Date.now();
      
      // Se o token já expirou, retornar false
      if (currentTime >= expirationTime) {
        console.log('Token expirado');
        return false;
      }
      
      // Token válido
      console.log('Token válido');
      return true;
    } catch (decodeError) {
      console.error('Erro ao decodificar token:', decodeError);
      return false;
    }
  } catch (error) {
    console.error('Erro ao validar autenticação:', error);
    return false;
  }
};

/**
 * Tenta renovar o token de autenticação
 * @returns {Promise<boolean>} - Promise que resolve para true se o token foi renovado com sucesso
 */
export const refreshToken = async () => {
  // Se já houver uma renovação em andamento, aguardar
  if (tokenRefreshInProgress) {
    console.log('Renovação de token já em andamento. Aguardando...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return validateAuthentication(); // Verificar se o token foi renovado com sucesso
  }
  
  tokenRefreshInProgress = true;
  
  try {
    console.log('Tentando renovar token...');
    
    // Obter dados do usuário do storage
    const userData = await storage.getUserData();
    
    // Se não houver dados do usuário ou token, não é possível renovar
    if (!userData || !userData.token) {
      console.log('Nenhum token para renovar');
      tokenRefreshInProgress = false;
      return false;
    }
    
    // Verificar conectividade antes de tentar renovar
    const isConnected = await storage.isNetworkConnected();
    if (!isConnected) {
      console.log('Dispositivo offline. Não é possível renovar o token agora.');
      tokenRefreshInProgress = false;
      
      // Em modo offline, consideramos o token válido por mais tempo
      // para permitir operações offline
      return true;
    }
    
    // Configurar URL de renovação
    const refreshUrl = config.AUTH?.REFRESH || `${config.API_URL}/auth/refresh`;
    
    // Fazer requisição para renovar o token com timeout
    const response = await axios.post(
      refreshUrl,
      {},
      {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos de timeout
        validateStatus: function (status) {
          return status < 500; // Aceitar status codes menores que 500
        }
      }
    );
    
    // Se a resposta for bem-sucedida e contiver um novo token
    if (response.status === 200 && response.data?.token) {
      console.log('Token renovado com sucesso');
      
      // Atualizar o token no storage
      await storage.setUserData({
        ...userData,
        token: response.data.token,
        lastUpdate: Date.now()
      });
      
      // Atualizar timestamp de atividade
      updateActivity();
      
      tokenRefreshInProgress = false;
      return true;
    } else {
      console.warn('Falha ao renovar token:', response.status, response.data);
      
      // Se o erro for 401, o token atual é inválido
      if (response.status === 401) {
        tokenRefreshInProgress = false;
        return false;
      }
      
      // Para outros erros, podemos tentar usar o token atual
      // se ele ainda não estiver expirado
      const isTokenValid = await validateToken(userData.token);
      tokenRefreshInProgress = false;
      return isTokenValid;
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    
    // Verificar se é um erro de rede
    if (!error.response) {
      console.log('Erro de rede ao renovar token. Verificando validade do token atual...');
      
      // Em caso de erro de rede, verificar se o token atual ainda é válido
      const userData = await storage.getUserData();
      if (userData && userData.token) {
        const isTokenValid = await validateToken(userData.token);
        tokenRefreshInProgress = false;
        return isTokenValid;
      }
    }
    
    tokenRefreshInProgress = false;
    return false;
  }
};

/**
 * Valida um token JWT verificando sua expiração
 * @param {string} token - Token JWT a ser validado
 * @returns {Promise<boolean>} - Promise que resolve para true se o token for válido
 */
const validateToken = async (token) => {
  try {
    if (!token) return false;
    
    const decoded = jwt_decode(token);
    
    // Verificar se o token possui informação de expiração
    if (!decoded.exp) {
      console.warn('Token não possui informação de expiração');
      return true; // Assumir que é válido se não tiver exp
    }
    
    // Verificar se o token está expirado
    const expirationTime = decoded.exp * 1000; // Converter para milissegundos
    const currentTime = Date.now();
    
    // Se o token já expirou, retornar false
    if (currentTime >= expirationTime) {
      console.log('Token expirado');
      return false;
    }
    
    // Token válido
    console.log('Token válido');
    return true;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
};

/**
 * Inicia o monitoramento periódico do token
 * @param {Object} store - Referência ao Redux store
 */
export const startTokenMonitor = (store) => {
  // Verificar se o store foi fornecido
  if (!store) {
    console.error('Redux store não fornecido para startTokenMonitor');
    return;
  }
  
  // Salvar referência ao store
  storeRef = store;
  
  // Parar monitoramento existente se houver
  stopTokenMonitor();
  
  console.log('Iniciando monitoramento de token...');
  
  // Verificar token imediatamente
  checkTokenValidity();
  
  // Configurar verificação periódica
  tokenMonitorInterval = setInterval(() => {
    checkTokenValidity();
  }, TOKEN_MONITOR_INTERVAL);
  
  // Adicionar listener para atividade do usuário
  if (typeof document !== 'undefined') {
    document.addEventListener('click', updateActivity);
    document.addEventListener('keypress', updateActivity);
    document.addEventListener('scroll', updateActivity);
    document.addEventListener('mousemove', updateActivity);
  }
  
  console.log('Monitoramento de token iniciado com sucesso');
};

/**
 * Para o monitoramento periódico do token
 */
export const stopTokenMonitor = () => {
  if (tokenMonitorInterval) {
    clearInterval(tokenMonitorInterval);
    tokenMonitorInterval = null;
    
    // Remover listeners de atividade do usuário
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', updateActivity);
      document.removeEventListener('keypress', updateActivity);
      document.removeEventListener('scroll', updateActivity);
      document.removeEventListener('mousemove', updateActivity);
    }
    
    console.log('Monitoramento de token parado');
  }
  
  if (networkMonitorUnsubscribe) {
    networkMonitorUnsubscribe();
    networkMonitorUnsubscribe = null;
    console.log('Monitoramento de rede parado');
  }
};

/**
 * Atualiza o timestamp de última atividade
 */
export const updateActivity = () => {
  lastActivityTime = Date.now();
  console.log('Atividade do usuário atualizada:', new Date(lastActivityTime).toLocaleTimeString());
};

/**
 * Verifica a validade do token atual e toma ações apropriadas
 */
const checkTokenValidity = async () => {
  try {
    console.log('Verificando validade do token...');
    
    // Verificar inatividade
    const currentTime = Date.now();
    const inactiveTime = currentTime - lastActivityTime;
    
    // Se o usuário estiver inativo por muito tempo, encerrar a sessão
    if (inactiveTime > SESSION_TIMEOUT) {
      console.log(`Usuário inativo por ${Math.round(inactiveTime / 1000 / 60)} minutos. Encerrando sessão.`);
      
      // Verificar se há alguma operação em andamento que exija mais tempo
      const isLongRunningOperation = await storage.getLongRunningOperation();
      
      if (isLongRunningOperation) {
        console.log('Operação de longa duração em andamento. Estendendo tempo de sessão.');
        updateActivity(); // Atualizar atividade para evitar logout
        return;
      }
      
      if (storeRef) {
        storeRef.dispatch(logoutUser());
        
        // Mostrar alerta ao usuário
        Alert.alert(
          'Sessão Encerrada',
          'Sua sessão foi encerrada devido à inatividade.',
          [{ text: 'OK' }]
        );
      }
      
      return;
    }
    
    // Obter dados do usuário do storage
    const userData = await storage.getUserData();
    
    // Se não houver dados do usuário ou token, não há o que verificar
    if (!userData || !userData.token) {
      return;
    }
    
    // Decodificar o token para verificar a expiração
    try {
      const decoded = jwt_decode(userData.token);
      
      // Verificar se o token possui informação de expiração
      if (!decoded.exp) {
        console.warn('Token não possui informação de expiração');
        return;
      }
      
      // Verificar se o token está próximo de expirar
      const expirationTime = decoded.exp * 1000; // Converter para milissegundos
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Se o token estiver a menos do tempo de margem da expiração, tentar renovar
      if (timeUntilExpiration < TOKEN_REFRESH_MARGIN) {
        console.log(`Token expira em ${Math.round(timeUntilExpiration / 1000 / 60)} minutos. Tentando renovar...`);
        await refreshToken();
      } else {
        console.log(`Token válido. Expira em ${Math.round(timeUntilExpiration / 1000 / 60)} minutos.`);
      }
    } catch (decodeError) {
      console.error('Erro ao decodificar token:', decodeError);
    }
  } catch (error) {
    console.error('Erro ao verificar validade do token:', error);
  }
};

// Função para monitorar o estado da rede
const setupNetworkMonitoring = () => {
  if (networkMonitorUnsubscribe) {
    networkMonitorUnsubscribe();
  }
  
  networkMonitorUnsubscribe = NetInfo.addEventListener(state => {
    console.log('Mudança no estado da rede:', state.isConnected);
    
    // Se a conexão foi restaurada e estávamos em modo offline
    if (state.isConnected && isOfflineMode) {
      console.log('Conexão restaurada, desativando modo offline');
      isOfflineMode = false;
      storeRef.dispatch(setOfflineMode(false));
      
      // Aqui poderia ser implementada a sincronização de dados offline
    } 
    // Se a conexão foi perdida
    else if (!state.isConnected && !isOfflineMode) {
      console.log('Conexão perdida, ativando modo offline');
      isOfflineMode = true;
      storeRef.dispatch(setOfflineMode(true));
    }
  });
};
