import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../store/slices/userSlice';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../theme';
import { useRouter } from 'expo-router';

const ChangePasswordScreen = () => {
  const dispatch = useDispatch();
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
    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
        Alert.alert('Sucesso', 'Senha alterada com sucesso!');
        router.back();
      } catch (error) {
        Alert.alert('Erro', error.message || 'Falha ao alterar a senha.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Senha atual"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      <Input
        placeholder="Nova senha"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <Input
        placeholder="Confirme a nova senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button onPress={handleChangePassword} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : 'Alterar Senha'}
      </Button>

      <Button variant="outline" onPress={() => router.back()} disabled={loading}>
        Cancelar
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});

export default ChangePasswordScreen;
