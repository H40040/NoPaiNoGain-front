import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { saveWorkout } from '../store/slices/workoutSlice';
import WorkoutForm from '../components/WorkoutForm';
import theme from '../theme';
import config from '../config';

export default function WorkoutDetailsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { mode, workoutId } = useLocalSearchParams();

  const [formData, setFormData] = useState({ name: '', description: '', type: '', exercises: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mode === 'edit' && workoutId) {
      fetchWorkoutDetails();
    } else {
      setLoading(false);
    }
  }, [mode, workoutId]);

  const fetchWorkoutDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_URL}/user/workouts/${workoutId}`);
      setFormData(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do treino.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (mode === 'edit') {
        await axios.put(`${config.API_URL}/user/workouts/${workoutId}`, formData);
      } else {
        const response = await axios.post(`${config.API_URL}/user/workouts`, formData);
        dispatch(saveWorkout(response.data));
      }
      Alert.alert('Sucesso', 'Treino salvo com sucesso!');
      router.push('/WorkoutListScreen');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o treino.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} />;
  }

  return (
    <View style={styles.container}>
      <WorkoutForm formData={formData} setFormData={setFormData} onSave={handleSave} />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
};