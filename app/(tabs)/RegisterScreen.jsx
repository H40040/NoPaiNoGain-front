import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import Button from '../../components/Button';
import Input from '../../components/Input';
import theme from '../../theme';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/DashboardScreen');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      Alert.alert('Erro', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return false;
    }
    if (!validateName(name)) {
      Alert.alert('Erro', 'Nome inválido.');
      return false;
    }
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Email inválido.');
      return false;
    }
    if (!validatePassword(password)) {
      Alert.alert('Erro', 'Senha inválida. Precisa de no mínimo 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      try {
        await dispatch(registerUser({ name, email, password })).unwrap();
        router.replace('/DashboardScreen');
      } catch (error) {
        Alert.alert('Erro', error.message || 'Erro ao realizar cadastro.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <Input
        placeholder="Nome"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        icon="person-outline"
      />

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        icon="email-outline"
      />

      <Input
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        icon="lock-outline"
      />

      <Button onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : 'Cadastrar'}
      </Button>

      <Button
        variant="outline"
        onPress={() => router.replace('/LoginScreen')}
        disabled={loading}
      >
        Já tenho conta
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
  title: {
    fontSize: 24,
    color: theme.colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
});
