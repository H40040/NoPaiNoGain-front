import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { deleteWorkout, deleteMultipleWorkouts, fetchWorkouts } from '../store/slices/workoutSlice';
import Animated from 'react-native-reanimated';
import WorkoutCard from '../components/WorkoutCard';
import theme from '../theme';
import Button from '../components/Button';

const WorkoutsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { workouts, loading } = useSelector(state => state.workouts);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkouts());
  }, [dispatch]);

  const toggleSelection = (id) => {
    setSelectedWorkouts(prev => prev.includes(id)
      ? prev.filter(workoutId => workoutId !== id)
      : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedWorkouts.length === 0) {
      Alert.alert('Aviso', 'Nenhum treino selecionado para exclusão.');
      return;
    }
    Alert.alert(
      'Excluir Treinos',
      `Tem certeza que deseja excluir ${selectedWorkouts.length} treinos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: async () => {
            setIsDeleting(true);
            try {
              await dispatch(deleteMultipleWorkouts(selectedWorkouts)).unwrap();
              Alert.alert('Sucesso', 'Treinos excluídos com sucesso!');
              setSelectedWorkouts([]);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir os treinos.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => dispatch(fetchWorkouts())} disabled={loading}>Atualizar Lista</Button>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => toggleSelection(item.id)}>
            <WorkoutCard workout={item} isSelected={selectedWorkouts.includes(item.id)} />
          </TouchableOpacity>
        )}
      />
      {selectedWorkouts.length > 0 && (
        <Button onPress={handleDeleteSelected} color="error" disabled={isDeleting}>
          {isDeleting ? 'Excluindo...' : `Excluir ${selectedWorkouts.length} Treinos`}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default WorkoutsScreen;
