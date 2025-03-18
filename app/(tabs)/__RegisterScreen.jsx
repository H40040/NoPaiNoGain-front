// src/screens/RegisterScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector} from 'react-redux'; // Removed Provider
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
      router.replace('DashboardScreen'); // change to DashboardScreen
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
  
  const handleRegister = () => {
    if (validateForm()) {
      dispatch(registerUser({ name, email, password }));
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
          />
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button
            title={loading ? 'Cadastrando...' : 'Cadastrar'}
            onPress={handleRegister}
            disabled={loading}
          />
          <Button
            title="Já tenho conta"
            onPress={() => router.replace('LoginScreen')} //change to LoginScreen
            variant="secondary"
            disabled={loading}
          />
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.xl,
    color: theme.colors.text,
  },
});
