import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { storage } from './storage';
import config from '../config';
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
 * Armazena o token de autenticação no armazenamento local.
 */
export const storeToken = async (token) => {
  try {
    await storage.setItem('authToken', token);
  } catch (error) {
    console.error('Erro ao armazenar token:', error);
  }
};

/**
 * Recupera o token de autenticação do armazenamento local.
 */
export const getToken = async () => {
  try {
    return await storage.getItem('authToken');
  } catch (error) {
    console.error('Erro ao recuperar token:', error);
    return null;
  }
};

/**
 * Remove o token de autenticação do armazenamento local.
 */
export const removeToken = async () => {
  try {
    await storage.removeItem('authToken');
  } catch (error) {
    console.error('Erro ao remover token:', error);
  }
};

/**
 * Verifica se há um token válido armazenado.
 */
export const isAuthenticated = async () => {
  const token = await getToken();
  return token !== null;
};

/**
 * Inicia o monitoramento periódico do token.
 */
export const startTokenMonitor = (store) => {
  if (!store) {
    console.error('Redux store não fornecido para startTokenMonitor');
    return;
  }
  storeRef = store;
  stopTokenMonitor();
  tokenMonitorInterval = setInterval(() => {
    checkTokenValidity();
  }, TOKEN_MONITOR_INTERVAL);
};

/**
 * Para o monitoramento periódico do token.
 */
export const stopTokenMonitor = () => {
  if (tokenMonitorInterval) {
    clearInterval(tokenMonitorInterval);
    tokenMonitorInterval = null;
  }
};

/**
 * Verifica a validade do token e renova se necessário.
 */
const checkTokenValidity = async () => {
  try {
    const userData = await storage.getUserData();
    if (!userData || !userData.token) return;
    const decoded = jwt_decode(userData.token);
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    if (currentTime >= expirationTime - TOKEN_REFRESH_MARGIN) {
      await refreshToken();
    }
  } catch (error) {
    console.error('Erro ao verificar validade do token:', error);
  }
};

/**
 * Renova o token de autenticação.
 */
export const refreshToken = async () => {
  if (tokenRefreshInProgress) return;
  tokenRefreshInProgress = true;
  try {
    const userData = await storage.getUserData();
    if (!userData || !userData.token) {
      tokenRefreshInProgress = false;
      return false;
    }
    const response = await axios.post(`${config.API_URL}/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${userData.token}` },
    });
    if (response.status === 200 && response.data?.token) {
      await storage.setUserData({ ...userData, token: response.data.token });
      tokenRefreshInProgress = false;
      return true;
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
  }
  tokenRefreshInProgress = false;
  return false;
};
