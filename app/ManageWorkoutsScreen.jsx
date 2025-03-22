import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { setWorkouts } from '../store/slices/workoutSlice';
import Animated from 'react-native-reanimated';
import WorkoutCard from '../components/WorkoutCard';
import Button from '../components/Button';
import theme from '../theme';
import config from '../config';

const AnimatedWorkoutCard = Animated.createAnimatedComponent(WorkoutCard);

const ManageWorkoutsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { workouts, loading } = useSelector(state => state.workouts);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${config.WORKOUTS.LIST}`);
      dispatch(setWorkouts(response.data));
    } catch (error) {
      Alert.alert('Erro', 'Falha ao buscar treinos.');
    }
  };

  const deleteWorkout = async (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este treino?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', onPress: async () => {
          try {
            await axios.delete(`${config.WORKOUTS.DELETE}/${id}`);
            dispatch(setWorkouts(workouts.filter(workout => workout.id !== id)));
            Alert.alert('Sucesso', 'Treino excluído com sucesso!');
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir o treino.');
          }
        }
      }
    ]);
  };

  const deleteMultipleWorkouts = async () => {
    if (selectedWorkouts.length === 0) {
      Alert.alert('Atenção', 'Nenhum treino selecionado para exclusão.');
      return;
    }
    
    setIsDeleting(true);
    try {
      await axios.delete(`${config.WORKOUTS.DELETE}/${id}`, { data: { ids: selectedWorkouts } });
      dispatch(setWorkouts(workouts.filter(workout => !selectedWorkouts.includes(workout.id))));
      setSelectedWorkouts([]);
      Alert.alert('Sucesso', 'Treinos excluídos com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir múltiplos treinos.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedWorkouts(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Treinos</Text>
      <Button onPress={fetchWorkouts} disabled={loading}>Atualizar Treinos</Button>
      {loading ? <ActivityIndicator size="large" color={theme.colors.primary} /> : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggleSelection(item.id)}>
              <AnimatedWorkoutCard workout={item} onDelete={() => deleteWorkout(item.id)} isSelected={selectedWorkouts.includes(item.id)} />
            </TouchableOpacity>
          )}
        />
      )}
      {selectedWorkouts.length > 0 && (
        <Button onPress={deleteMultipleWorkouts} disabled={isDeleting}>
          {isDeleting ? 'Excluindo...' : `Excluir (${selectedWorkouts.length}) Treinos`}
        </Button>
      )}
    </View>
  );
};

const styles = {
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
};

export default ManageWorkoutsScreen;
