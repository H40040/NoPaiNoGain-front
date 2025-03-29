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
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.USER.PROFILE}`);
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
      await axios.put(`${config.USER.PROFILE}`, settings);
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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <Text style={styles.settingTitle}>Notificações</Text>
          <Switch
            value={settings.enabled}
            onValueChange={(val) => updateSettings({ ...settings, enabled: val })}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingTitle}>Vibrar</Text>
          <Switch
            value={settings.vibration}
            onValueChange={(val) => updateSettings({ ...settings, vibration: val })}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingTitle}>Lembrete Antecipado (minutos)</Text>
          <Slider
            value={settings.reminderMinutes}
            onValueChange={(val) => updateSettings({ ...settings, reminderMinutesBefore: val })}
            minimumValue={0}
            maximumValue={120}
            step={5}
          />
          <Text>{settings.reminderMinutes} minutos antes</Text>
        </View>

        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
          <Text>Selecionar horário padrão: {settings.defaultNotificationTime}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            onChange={(e, date) => {
              setShowTimePicker(false);
              if (date) updateSettings({ ...settings, defaultNotificationTime: date.toLocaleTimeString() });
            }}
          />
        )}
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
