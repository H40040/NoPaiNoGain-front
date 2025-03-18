import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import Button from '../components/Button';
import Text from '../components/Text';
import theme from '../theme';
import { getNotificationSettings, saveNotificationSettings, createWorkoutReminder, cancelWorkoutReminder } from '../utils/notifications';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Segunda' },
  { id: 2, name: 'Terça' },
  { id: 3, name: 'Quarta' },
  { id: 4, name: 'Quinta' },
  { id: 4, name: 'Quinta' },
  { id: 5, name: 'Sexta' },
  { id: 4, name: 'Quinta' },
  { id: 5, name: 'Sexta' },
  { id: 6, name: 'Sábado' },
];

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const savedSettings = await getNotificationSettings();
    setSettings(savedSettings);
    setLoading(false);
  };

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
    Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
  };

  if (loading || !settings) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
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
      </View>

      <Button onPress={() => saveNotificationSettings(settings)}>Salvar Configurações</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  section: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  settingTitle: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
});