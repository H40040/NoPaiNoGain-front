import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { checkAuth, loginUser } from '../../store/slices/authSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';
import theme from '../../theme';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth()); // Verifica autenticação ao carregar a tela
  }, []);
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/DashboardScreen');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      const response = await dispatch(loginUser({ email, password })).unwrap();
      console.log('Login successful:', response);
      router.replace('/DashboardScreen');
    } catch (error) {
      setErrorMessage(error?.message || 'Falha ao realizar login. Verifique suas credenciais.');
      console.error('Login error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>NO PAIN NO GAIN</Text>
      <Text style={styles.subtitle}>Seu app de treinos personalizados</Text>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        Ionicons="mail-outline"
        keyboardType="email-address"
      />

      <Input
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        Ionicons="lock-outline"
        secureTextEntry
      />

      <Button onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : 'Entrar'}
      </Button>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Button variant="outline" onPress={() => router.replace('/RegisterScreen')}>
        Não tem conta? Criar conta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: theme.colors.error,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;
