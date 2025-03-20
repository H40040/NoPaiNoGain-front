import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { completeWorkout } from '../store/slices/workoutSlice';
import Text from '../components/Text';
import Button from '../components/Button';
import { createRestEndNotification } from '../utils/notifications';
//import notifee from '@notifee/react-native';
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';

export default function WorkoutExecutionScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { workoutId } = useLocalSearchParams();

  const workouts = useSelector(state => state.workouts.workouts);
  const workout = workouts.find(w => w.id === workoutId);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isCompletingWorkout, setIsCompletingWorkout] = useState(false);

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
    await createRestEndNotification();
  };

  const startRestTimer = () => {
    setIsResting(true);
    setRestTimeLeft(60);
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
    setIsCompletingWorkout(true);
    try {
      await dispatch(completeWorkout(workout)).unwrap();
      await notifee.displayNotification({
        title: 'Parabéns! 🎉',
        body: `Você completou o treino "${workout.name}" com sucesso!`,
        android: {
          channelId: 'workout_completion',
          importance: 4,
          smallIcon: 'ic_launcher',
          largeIcon: 'ic_trophy',
          vibrationPattern: [300, 500, 300, 500],
          color: theme.colors.primary,
        },
      });
      Alert.alert('Parabéns!', 'Treino concluído com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao completar treino');
    } finally {
      setIsCompletingWorkout(false);
    }
  };

  if (isCompletingWorkout) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        <Text>Série: {currentSet}/{currentExercise.sets}</Text>
        <Text>Repetições: {currentExercise.reps}</Text>

        {isResting ? (
          <View style={styles.restContainer}>
            <Text>Descanso: {restTimeLeft}s</Text>
          </View>
        ) : (
          <Button onPress={handleCompleteSet} disabled={isCompletingWorkout}>
            {isCompletingWorkout ? <ActivityIndicator color="#fff" /> : 'Concluir Série'}
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  content: { alignItems: 'center' },
  exerciseName: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  restContainer: { alignItems: 'center', marginVertical: 20 },
});