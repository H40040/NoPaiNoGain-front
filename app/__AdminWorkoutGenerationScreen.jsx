import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../theme';
import * as workoutGenerationService from '../store/slices/workoutSlice';

export default function AdminWorkoutGenerationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    blockPeriodDays: 30,
    enableGeneration: true
  });
  const { user } = useSelector((state) => state.auth);

  // Verificar se o usuário é admin
  useEffect(() => {
    if (!user?.isAdmin) {
      Alert.alert('Acesso Negado', 'Você não tem permissão para acessar esta área.');
      router.back();
    }
  }, [user, router]);

  // Carregar configurações atuais
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const currentSettings = await workoutGenerationService.getGenerationSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await workoutGenerationService.updateGenerationSettings(settings);
      Alert.alert('Sucesso', 'Configurações atualizadas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      setLoading(true);
      await workoutGenerationService.overrideUserBlock(userId);
      Alert.alert('Sucesso', 'Bloqueio do usuário removido com sucesso');
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      Alert.alert('Erro', 'Não foi possível desbloquear o usuário');
    } finally {
      setLoading(false);
    }
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
            onChangeText={(text) => {
              const value = parseInt(text) || 0;
              setSettings(prev => ({ ...prev, blockPeriodDays: value }));
            }}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        <View style={styles.settingContainer}>
          <Text style={styles.settingLabel}>Habilitar Geração de Treinos</Text>
          <Switch
            value={settings.enableGeneration}
            onValueChange={(value) => 
              setSettings(prev => ({ ...prev, enableGeneration: value }))
            }
            trackColor={{ false: theme.colors.error, true: theme.colors.success }}
          />
        </View>

        <Button
          title="Salvar Configurações"
          onPress={handleSaveSettings}
          style={styles.button}
        />

        <View style={styles.divider} />

        <Text style={styles.subtitle}>Desbloquear Usuário</Text>
        <Input
          placeholder="ID do usuário"
          onSubmitEditing={(event) => handleUnblockUser(event.nativeEvent.text)}
          style={styles.input}
        />
        <Text style={styles.helperText}>
          Digite o ID do usuário e pressione Enter para remover o bloqueio de geração de treino
        </Text>
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
  input: {
    flex: 0.5,
    minWidth: 100,
  },
  button: {
    marginTop: 10,
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
