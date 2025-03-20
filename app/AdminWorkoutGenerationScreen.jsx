import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../theme';
import config from '../config';

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
      const response = await axios.get(`${config.API_URL}/admin/settings`);
      setSettings(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await axios.put(`${config.API_URL}/admin/settings`, settings);
      Alert.alert('Sucesso', 'Configurações atualizadas com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Configurações do Administrador</Text>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <>
          <Input
            label="Dias de Bloqueio"
            value={settings.blockPeriodDays.toString()}
            onChangeText={(text) => setSettings({ ...settings, blockPeriodDays: parseInt(text) || 0 })}
            keyboardType="numeric"
          />
          <View style={styles.switchContainer}>
            <Text>Ativar Geração Automática</Text>
            <Switch
              value={settings.enableGeneration}
              onValueChange={(value) => setSettings({ ...settings, enableGeneration: value })}
            />
          </View>
          <Button onPress={saveSettings}>Salvar Configurações</Button>
        </>
      )}
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
});
