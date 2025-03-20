import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import Button from '../components/Button';
import Text from '../components/Text';
import theme from '../theme';
import config from '../config';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Segunda' },
  { id: 2, name: 'Terça' },
  { id: 3, name: 'Quarta' },
  { id: 4, name: 'Quinta' },
  { id: 5, name: 'Sexta' },
  { id: 6, name: 'Sábado' },
];

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_URL}/user/notifications`);
      setSettings(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as configurações de notificação.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await axios.put(`${config.API_URL}/user/notifications`, settings);
      Alert.alert('Sucesso', 'Configurações de notificação salvas!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as configurações de notificação.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Configurações de Notificação</Text>
      <View style={styles.optionRow}>
        <Text>Ativar Notificações</Text>
        <Switch
          value={settings.enableNotifications}
          onValueChange={(value) => setSettings({ ...settings, enableNotifications: value })}
        />
      </View>
      <Button onPress={saveSettings}>Salvar Configurações</Button>
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
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
});
