import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector, useDispatch } from 'react-redux';
import { completeWorkout } from '../store/slices/workoutSlice';
import Text from '../components/Text';
import Button from '../components/Button';
import { createWorkoutReminder, cancelWorkoutReminder, createRestEndNotification } from '../utils/notifications';
import notifee from '@notifee/react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';

const WorkoutExecutionScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { workout } = route.params;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isWorkoutScheduled, setIsWorkoutScheduled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [restNotificationsEnabled, setRestNotificationsEnabled] = useState(true);

  const currentExercise = workout.exercises[currentExerciseIndex];

  const handleCompleteSet = useCallback(() => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(prev => prev + 1);
      startRestTimer();
    } else if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      startRestTimer();
    } else {
      handleCompleteWorkout();
    }
  }, [currentExercise, currentExerciseIndex, currentSet, workout.exercises.length]);

  const showRestEndNotification = async () => {
    if (!restNotificationsEnabled) return;
    
    // Use the utility function for consistent notifications
    await createRestEndNotification();
  };

  const startRestTimer = () => {
    setIsResting(true);
    setRestTimeLeft(60); // 1 minute rest
    const interval = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResting(false);
          showRestEndNotification();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCompleteWorkout = async () => {
    try {
      await dispatch(completeWorkout(workout)).unwrap();
      
      // Show a completion notification with confetti icon
      await notifee.displayNotification({
        title: 'Parabéns! 🎉',
        body: `Você completou o treino "${workout.name}" com sucesso!`,
        android: {
          channelId: 'workout_completion',
          importance: 4, // HIGH importance
          smallIcon: 'ic_launcher',
          largeIcon: 'ic_trophy',
          style: {
            type: 1, // BigPicture style
            picture: 'ic_workout_complete',
          },
          pressAction: {
            id: 'default',
          },
          vibrationPattern: [300, 500, 300, 500],
          color: theme.colors.primary,
        },
      });
      
      Alert.alert('Parabéns!', 'Treino concluído com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao completar treino');
    }
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setScheduledTime(selectedDate);
    }
  };

  const handleScheduleWorkout = async () => {
    try {
      await createWorkoutReminder(workout, scheduledTime);
      setIsWorkoutScheduled(true);
      Alert.alert('Sucesso', `Lembrete agendado para ${scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao agendar lembrete');
    }
  };

  const handleCancelSchedule = async () => {
    try {
      await cancelWorkoutReminder(workout.id);
      setIsWorkoutScheduled(false);
      Alert.alert('Sucesso', 'Lembrete cancelado');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cancelar lembrete');
    }
  };

  const toggleRestNotifications = () => {
    setRestNotificationsEnabled(!restNotificationsEnabled);
  };

  // Create notification channel for workout completion on component mount
  useEffect(() => {
    const createNotificationChannel = async () => {
      await notifee.createChannel({
        id: 'workout_completion',
        name: 'Conclusão de Treino',
        vibration: true,
        importance: 4, // HIGH importance
      });
    };
    
    createNotificationChannel();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: `Executando: ${workout.name}`,
    });
  }, [navigation, workout]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <View style={styles.exerciseProgress}>
            <Text style={styles.progressText}>
              Exercício {currentExerciseIndex + 1} de {workout.exercises.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentExerciseIndex + 1) / workout.exercises.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.exerciseDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Séries</Text>
            <Text style={styles.detailValue}>{currentSet}/{currentExercise.sets}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Repetições</Text>
            <Text style={styles.detailValue}>{currentExercise.reps}</Text>
          </View>
          {currentExercise.weight && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Peso</Text>
              <Text style={styles.detailValue}>{currentExercise.weight} kg</Text>
            </View>
          )}
        </View>

        {isResting ? (
          <View style={styles.restContainer}>
            <Text style={styles.restText}>Descanso</Text>
            <Text style={styles.timerText}>{restTimeLeft}s</Text>
            <TouchableOpacity 
              style={styles.notificationToggle}
              onPress={toggleRestNotifications}
            >
              <Icon 
                name={restNotificationsEnabled ? 'bell' : 'bell-off'} 
                size={24} 
                color={restNotificationsEnabled ? theme.colors.primary : theme.colors.secondary} 
              />
              <Text style={styles.notificationText}>
                {restNotificationsEnabled ? 'Notificações ativadas' : 'Notificações desativadas'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            title="Concluir Série"
            onPress={handleCompleteSet}
            style={styles.actionButton}
          />
        )}

        <View style={styles.scheduleContainer}>
          <Text style={styles.sectionTitle}>Lembrete para o próximo treino</Text>
          {isWorkoutScheduled ? (
            <>
              <View style={styles.scheduledInfo}>
                <Icon name="calendar-check" size={24} color={theme.colors.primary} />
                <Text style={styles.scheduledText}>
                  Treino agendado para {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Button
                title="Cancelar Lembrete"
                onPress={handleCancelSchedule}
                variant="secondary"
                style={styles.scheduleButton}
              />
            </>
          ) : (
            <>
              <Button
                title={`Agendar para ${scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                onPress={() => setShowTimePicker(true)}
                variant="secondary"
                style={styles.scheduleButton}
              />
              {showTimePicker && (
                <DateTimePicker
                  value={scheduledTime}
                  mode="time"
                  is24Hour={true}
                  onChange={handleTimeChange}
                />
              )}
              <Button
                title="Confirmar Agendamento"
                onPress={handleScheduleWorkout}
                variant="primary"
                style={styles.scheduleButton}
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  exerciseHeader: {
    marginBottom: theme.spacing.lg,
  },
  exerciseName: {
    ...theme.typography.title,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  exerciseProgress: {
    marginTop: theme.spacing.md,
  },
  progressText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  detailValue: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
  },
  restContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    ...theme.shadows.small,
  },
  restText: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
  },
  timerText: {
    ...theme.typography.title,
    color: theme.colors.primary,
    fontSize: 48,
    marginVertical: theme.spacing.md,
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  notificationText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.sm,
  },
  actionButton: {
    marginTop: theme.spacing.md,
  },
  scheduleContainer: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  scheduledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scheduledText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  scheduleButton: {
    marginTop: theme.spacing.md,
  },
});

export default WorkoutExecutionScreen;
