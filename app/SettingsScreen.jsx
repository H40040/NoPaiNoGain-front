import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Text from '../components/Text';
import theme from '../theme';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/ProfileScreen')}>
        <Text style={styles.optionText}>Editar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/NotificationSettingsScreen')}>
        <Text style={styles.optionText}>Configurações de Notificações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/ManageWorkoutsScreen')}>
        <Text style={styles.optionText}>Gerenciar Treinos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/ChangePasswordScreen')}>
        <Text style={styles.optionText}>Alterar Senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/AboutScreen')}>
        <Text style={styles.optionText}>Sobre o App</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.textPrimary,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
});
