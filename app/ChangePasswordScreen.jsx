import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../theme';
import config from '../config';

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await axios.put(`${config.API_URL}/user/change-password`, {
        currentPassword,
        newPassword,
      });
      Alert.alert('Sucesso', 'Senha alterada com sucesso!', [{ text: 'OK', onPress: () => router.push('/ProfileScreen') }]);
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Senha Atual"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <Input
        label="Nova Senha"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <Input
        label="Confirmar Nova Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button onPress={handleChangePassword} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : 'Alterar Senha'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
});

export default ChangePasswordScreen;
