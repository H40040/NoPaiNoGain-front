import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { saveWorkout } from '../store/slices/workoutSlice';
import WorkoutForm from '../components/WorkoutForm';
import theme from '../theme';

export default function WorkoutDetailsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { mode, workoutId } = useLocalSearchParams();

  const workouts = useSelector(state => state.workouts.workouts);
  const loading = useSelector(state => state.workouts.loading);
  const existingWorkout = workouts.find(w => w.id === workoutId);

  const [formData, setFormData] = useState({ name: '', description: '', type: '', exercises: [] });

  useEffect(() => {
    if (mode === 'edit' && existingWorkout) {
      setFormData(existingWorkout);
    }
  }, [mode, existingWorkout]);

  const handleSave = async () => {
    if (!formData.name.trim() || formData.exercises.length === 0) {
      Alert.alert('Erro', 'Preencha o nome e adicione pelo menos um exercício.');
      return;
    }

    try {
      const savedWorkout = await dispatch(saveWorkout(formData)).unwrap();

      Alert.alert(
        'Treino salvo com sucesso!',
        'Deseja visualizá-lo agora ou voltar para a lista de treinos?',
        [
          { text: 'Visualizar', onPress: () => router.push(`/WorkoutDetailsScreen?id=${savedWorkout.id}`) },
          { text: 'Voltar para lista', onPress: () => router.push('/workouts') }
        ]
      );

    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao salvar treino.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <WorkoutForm
      formData={formData}
      setFormData={setFormData}
      onSave={handleSave}
      mode={mode}
    />
  );
}