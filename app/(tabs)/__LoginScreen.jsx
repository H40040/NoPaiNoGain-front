import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import Button from '../../components/Button';
import Input from '../../components/Input';
import theme from '../../theme';
import * as Haptics from 'expo-haptics';

// Função auxiliar para feedback tátil com verificação de plataforma
const triggerHaptic = async (type) => {
  if (Platform.OS === 'web') return;
  
  try {
    switch (type) {
      case 'light':
        await Haptics.selectionAsync();
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: theme.colors.text,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [navigationAttempted, setNavigationAttempted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state) => state.auth || {});
  const error = auth.error;
  const isAuthenticated = auth.isAuthenticated || false;

  // Limpar erros ao montar o componente
  useEffect(() => {
    console.log('LoginScreen montado - Limpando erros anteriores');
    dispatch(clearError());
    
    // Reset do estado de navegação ao montar o componente
    setNavigationAttempted(false);
    
    return () => {
      console.log('LoginScreen desmontado');
    };
  }, []);

  // Monitorar mudanças no estado de autenticação
  useEffect(() => {
    console.log('Estado de autenticação alterado:', isAuthenticated);
    
    if (isAuthenticated && !navigationAttempted) {
      console.log('Usuário autenticado, redirecionando...');
      setNavigationAttempted(true);
      
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        navigateToDashboard();
      }, 300); // Timeout reduzido conforme mencionado nas memórias
    }
  }, [isAuthenticated]);

  // Função para centralizar a lógica de navegação
  const navigateToDashboard = () => {
    try {
      router.replace('/DashboardScreen');
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      Alert.alert('Falha ao navegar para o Dashboard.');
    }
  };

  // Monitorar erros
  useEffect(() => {
    if (error) {
      triggerHaptic('error');
      
      // Mensagens de erro mais amigáveis
      let friendlyError = error;
      
      // Mapear erros comuns para mensagens mais amigáveis
      if (error.includes('não cadastrado') || error.includes('não encontrado')) {
        friendlyError = 'Usuário não cadastrado. Verifique o email ou crie uma nova conta.';
      } else if (error.includes('senha') || error.includes('credenciais')) {
        friendlyError = 'Senha incorreta. Por favor, verifique e tente novamente.';
      } else if (error.includes('expirou') || error.includes('sessão')) {
        friendlyError = 'Sua sessão expirou. Por favor, faça login novamente.';
      }
      
      Alert.alert('Erro de Login', friendlyError);
      dispatch(clearError());
    }
  }, [error]);

  const handleLogin = async () => {
    try {
      console.log(`Iniciando processo de login para: ${email}`);
      const result = await dispatch(loginUser({ email, password })).unwrap();
      console.log('Login bem-sucedido, resultado:', result);
      triggerHaptic('success');
    } catch (err) {
      console.error('Erro no login:', err);
      setErrorMessage('E-mail ou senha inválidos. Verifique e tente novamente.');
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>NO PAIN NO GAIN</Text>
        <Text style={styles.subtitle}>Seu app de treinos personalizados</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          icon="email-outline"
          editable={!isLoading}
        />
        <Input
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon="lock-outline"
          editable={!isLoading}
        />
        
        <Button
          title={isLoading ? "Entrando..." : "Entrar"}
          onPress={handleLogin}
          disabled={isLoading}
          loading={isLoading}
        />
         <Button
            title="Criar conta"
            onPress={() => router.replace('RegisterScreen')} //change to LoginScreen
            variant="outline"
            disabled={isLoading}
          />
        
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
    </View>
    </PaperProvider>
  );
}
