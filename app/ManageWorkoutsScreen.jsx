import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert, ActivityIndicator, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { deleteWorkout, deleteMultipleWorkouts, fetchWorkouts } from '../store/slices/workoutSlice';
import Animated, { FadeIn } from 'react-native-reanimated';
import WorkoutCard from '../components/WorkoutCard';
import theme from '../theme';

const AnimatedWorkoutCard = Animated.createAnimatedComponent(WorkoutCard);

const ManageWorkoutsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { workouts, loading } = useSelector(state => state.workouts);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkouts());
  }, [dispatch]);

  const toggleSelection = (id) => {
    setSelectedWorkouts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteWorkouts = () => {
    if (!selectedWorkouts.length) return Alert.alert('Atenção', 'Selecione pelo menos um treino para excluir.');

    Alert.alert(
      'Excluir Treinos',
      `Deseja realmente excluir ${selectedWorkouts.length} treino(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmDeletion }
      ]
    );
  };

  const confirmDeletion = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteMultipleWorkouts(selectedWorkouts)).unwrap();
      setSelectedWorkouts([]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir os treinos.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || isDeleting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>{isDeleting ? 'Excluindo treinos...' : 'Carregando treinos...'}</Text>
      </View>
    );
  }

  if (!workouts.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ textAlign: 'center', fontSize: 16, color: theme.colors.textSecondary }}>
          Você ainda não criou nenhum treino.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={workouts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AnimatedWorkoutCard
            entering={FadeIn.duration(400)}
            workout={item}
            selected={selectedWorkouts.includes(item.id)}
            onLongPress={() => toggleSelection(item.id)}
            onPress={() => router.push(`/WorkoutDetailsScreen?id=${item.id}`)}
          />
        )}
      />
    </View>
  );
};

export default ManageWorkoutsScreen;
