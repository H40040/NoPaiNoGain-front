import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../theme';
import * as workoutService from '../services/workoutService';

export default function AdminWorkoutGenerationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    blockPeriodDays: 30,
    enableGeneration: true,
  });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.isAdmin) {
      Alert.alert('Acesso Negado', 'Você não tem permissão para acessar esta área.');
      router.back();
    }
  }, [user, router]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const currentSettings = await workoutService.getGenerationSettings();
      setSettings(currentSettings);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as configurações');
    }
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await workoutService.updateGenerationSettings(settings);
      Alert.alert('Sucesso', 'Configurações atualizadas com sucesso');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível salvar as configurações');
    }
    setLoading(false);
  };

  const handleUnblockUser = async (userId) => {
    setLoading(true);
    try {
      await workoutService.overrideUserBlock(userId);
      Alert.alert('Sucesso', 'Bloqueio do usuário removido com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível desbloquear o usuário');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configurações de Geração de Treino</Text>
        <View style={styles.settingContainer}>
          <Text style={styles.settingLabel}>Período de Bloqueio (dias)</Text>
          <Input
            value={String(settings.blockPeriodDays)}
            onChangeText={(text) => setSettings({ ...settings, blockPeriodDays: parseInt(text) || 0 })}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.settingContainer}>
          <Text style={styles.settingLabel}>Habilitar Geração de Treinos</Text>
          <Switch
            value={settings.enableGeneration}
            onValueChange={(value) => setSettings({ ...settings, enableGeneration: value })}
            trackColor={{ false: theme.colors.error, true: theme.colors.success }}
          />
        </View>
        <Button onPress={handleSaveSettings} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : 'Salvar Configurações'}
        </Button>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Desbloquear Usuário</Text>
        <Input
          placeholder="ID do usuário"
          onSubmitEditing={(event) => handleUnblockUser(event.nativeEvent.text)}
        />
        <Text style={styles.helperText}>Digite o ID do usuário e pressione Enter para remover o bloqueio.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  settingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
    marginRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 20,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
});
