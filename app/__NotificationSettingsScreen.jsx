import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import Button from '../components/Button';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  NOTIFICATION_SOUNDS,
  updateNotificationSound,
  toggleVibration,
  updateAdvanceNotice,
} from '../utils/notifications';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';
import { Provider } from 'react-redux';
import { store } from '../store';

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
  const [settings, setSettings] = useState({
    enabled: true,
    reminderTime: '09:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    sound: 'default',
    vibration: true,
    advanceNotice: 15,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getNotificationSettings();
    setSettings(savedSettings);
  };

  const handleToggleNotifications = async (value) => {
    const newSettings = { ...settings, enabled: value };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
  };

  const handleTimeChange = async (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      const newSettings = { ...settings, reminderTime: timeString };
      setSettings(newSettings);
      await saveNotificationSettings(newSettings);
    }
  };

  const handleDayToggle = async (dayId) => {
    let newDays;
    if (settings.daysOfWeek.includes(dayId)) {
      newDays = settings.daysOfWeek.filter(id => id !== dayId);
    } else {
      newDays = [...settings.daysOfWeek, dayId].sort();
    }
    
    const newSettings = { ...settings, daysOfWeek: newDays };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
  };

  const handleSoundChange = async (soundId) => {
    setShowSoundPicker(false);
    const newSettings = { ...settings, sound: soundId };
    setSettings(newSettings);
    await updateNotificationSound(soundId);
  };

  const handleVibrationToggle = async (value) => {
    const newSettings = { ...settings, vibration: value };
    setSettings(newSettings);
    await toggleVibration(value);
  };

  const handleAdvanceNoticeChange = async (value) => {
    const minutes = Math.round(value);
    const newSettings = { ...settings, advanceNotice: minutes };
    setSettings(newSettings);
    await updateAdvanceNotice(minutes);
  };

  const showTimePickerModal = () => {
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    setShowTimePicker(true);
  };

  const requestPermission = async () => {
    const status = await requestNotificationPermission();
    if (status) {
      handleToggleNotifications(true);
    }
  };

  const getSoundName = (soundId) => {
    const sound = NOTIFICATION_SOUNDS.find(s => s.id === soundId);
    return sound ? sound.name : 'Padrão';
  };

  return (
    <Provider store={store}>
      <NotificationSettingsScreen>
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Notificações</Text>
                <Text style={styles.settingDescription}>
                  Ative para receber lembretes dos seus treinos
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            </View>
          </View>

          {settings.enabled && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Horário do Lembrete</Text>
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={showTimePickerModal}
                >
                  <Icon name="clock-outline" size={24} color={theme.colors.primary} style={styles.optionIcon} />
                  <Text style={styles.timeText}>{settings.reminderTime}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={(() => {
                      const [hours, minutes] = settings.reminderTime.split(':').map(Number);
                      const date = new Date();
                      date.setHours(hours, minutes, 0, 0);
                      return date;
                    })()}
                    mode="time"
                    is24Hour={true}
                    onChange={handleTimeChange}
                  />
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dias da Semana</Text>
                <View style={styles.daysContainer}>
                  {DAYS_OF_WEEK.map((day) => (
                    <TouchableOpacity
                      key={day.id}
                      style={[
                        styles.dayButton,
                        settings.daysOfWeek.includes(day.id) && styles.dayButtonSelected,
                      ]}
                      onPress={() => handleDayToggle(day.id)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          settings.daysOfWeek.includes(day.id) && styles.dayTextSelected,
                        ]}
                      >
                        {day.name.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Som e Vibração</Text>
                
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setShowSoundPicker(true)}
                >
                  <View style={styles.optionInfo}>
                    <Icon name="volume-high" size={24} color={theme.colors.primary} style={styles.optionIcon} />
                    <View>
                      <Text style={styles.optionTitle}>Som de Notificação</Text>
                      <Text style={styles.optionValue}>{getSoundName(settings.sound)}</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={24} color={theme.colors.secondary} />
                </TouchableOpacity>
                
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Icon 
                      name={settings.vibration ? "vibrate" : "vibrate-off"} 
                      size={24} 
                      color={settings.vibration ? theme.colors.primary : theme.colors.secondary} 
                      style={styles.optionIcon} 
                    />
                    <View>
                      <Text style={styles.optionTitle}>Vibração</Text>
                      <Text style={styles.optionValue}>{settings.vibration ? 'Ativada' : 'Desativada'}</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.vibration}
                    onValueChange={handleVibrationToggle}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notificação Antecipada</Text>
                <Text style={styles.settingDescription}>
                  Receba um lembrete alguns minutos antes do horário agendado do treino
                </Text>
                
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValue}>{settings.advanceNotice} minutos</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={60}
                    step={5}
                    value={settings.advanceNotice}
                    onValueChange={(value) => setSettings({...settings, advanceNotice: Math.round(value)})}
                    onSlidingComplete={handleAdvanceNoticeChange}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={theme.colors.border}
                    thumbTintColor={theme.colors.primary}
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>0</Text>
                    <Text style={styles.sliderLabel}>30</Text>
                    <Text style={styles.sliderLabel}>60</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Permissões</Text>
                <Text style={styles.settingDescription}>
                  Certifique-se de que as notificações estão permitidas nas configurações do seu dispositivo
                </Text>
                <Button
                  title="Verificar Permissões"
                  onPress={requestPermission}
                  variant="secondary"
                  style={styles.permissionButton}
                />
              </View>
            </>
          )}

          {/* Modal para seleção de som */}
          <Modal
            visible={showSoundPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowSoundPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Selecione o Som</Text>
                
                {NOTIFICATION_SOUNDS.map((sound) => (
                  <TouchableOpacity
                    key={sound.id}
                    style={[
                      styles.soundOption,
                      settings.sound === sound.id && styles.soundOptionSelected,
                    ]}
                    onPress={() => handleSoundChange(sound.id)}
                  >
                    <Text
                      style={[
                        styles.soundText,
                        settings.sound === sound.id && styles.soundTextSelected,
                      ]}
                    >
                      {sound.name}
                    </Text>
                    {settings.sound === sound.id && (
                      <Icon name="check" size={20} color={theme.colors.surface} />
                    )}
                  </TouchableOpacity>
                ))}
                
                <Button
                  title="Cancelar"
                  onPress={() => setShowSoundPicker(false)}
                  variant="secondary"
                  style={styles.modalButton}
                />
              </View>
            </View>
          </Modal>
        </ScrollView>
      </NotificationSettingsScreen>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
  },
  settingDescription: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  timeSelector: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  timeText: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dayButton: {
    flex: 1,
    minWidth: 80,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  dayButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  dayTextSelected: {
    color: theme.colors.surface,
  },
  permissionButton: {
    marginTop: theme.spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: theme.spacing.md,
  },
  optionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
  },
  optionValue: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  sliderContainer: {
    marginTop: theme.spacing.md,
  },
  sliderValue: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
  sliderLabel: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  modalTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  soundOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  soundOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  soundText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  soundTextSelected: {
    color: theme.colors.surface,
  },
  modalButton: {
    marginTop: theme.spacing.md,
  },
});