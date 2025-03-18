import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import store from '../store/index';
import { setupAuthInterceptors, startTokenMonitor } from '../utils/authManager';
import { checkAuth } from '../store/slices/authSlice';

// Manter a SplashScreen visível enquanto carregamos recursos
SplashScreen.preventAutoHideAsync();

// Componente principal que fornece o Redux store
export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Verificar se o store está disponível
    if (!store) {
      console.error('Redux store não está disponível!');
      return;
    }
    
    console.log('Redux store inicializado:', store);
    
    // Configurar interceptadores de autenticação com referência ao store
    // Fazemos isso dentro do componente para garantir que o store esteja disponível
    setupAuthInterceptors(store);
    
    async function prepare() {
      try {
        console.log('Iniciando verificação de autenticação...');
        
        // Verificar autenticação e iniciar monitoramento do token
        await store.dispatch(checkAuth());
        
        // Iniciar monitoramento do token com a configuração de segurança
        // conforme mencionado nas memórias (renovação automática, timeout por inatividade)
        startTokenMonitor(store);
        
        console.log('Verificação de autenticação concluída');
        
        // Simular um tempo mínimo de exibição da SplashScreen (1 segundo)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Erro ao carregar recursos iniciais:', e);
      } finally {
        // Marcar o app como pronto
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Esconder a SplashScreen após o app estar pronto
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  // Verificar novamente se o store está disponível antes de renderizar
  if (!store) {
    console.error('Redux store ainda não está disponível ao renderizar!');
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" options={{ presentation: 'modal' }} />
      <Stack.Screen name="RegisterScreen" options={{ presentation: 'modal' }} />
      <Stack.Screen name="DashboardScreen" />
      <Stack.Screen name="ManageWorkoutsScreen" />
      <Stack.Screen name="GeneratedWorkoutScreen" />
      <Stack.Screen name="ProfileScreen" />
      <Stack.Screen name="WorkoutsScreen" />
      <Stack.Screen name="AnamneseFormScreen" />
      <Stack.Screen name="WorkoutDetailsScreen" />
      <Stack.Screen name="HelpScreen" />
      <Stack.Screen name="AdminLogin" />
      <Stack.Screen name="AdminDashboardScreen" />
      <Stack.Screen name="AdminWorkoutGenerationScreen" />
    {/* Adicione outras rotas conforme necessário */}
  </Stack>
    // <Provider store={store}>
    //   <Stack screenOptions={{ headerShown: false }} />
    // </Provider>
  );
}
