import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { setCompletedWorkouts } from '../store/slices/workoutSlice';
import Text from '../components/Text';
import Button from '../components/Button';
import { BarChart } from 'react-native-chart-kit';
import theme from '../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import config from '../config';

export default function WorkoutStatsScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { completedWorkouts, loading } = useSelector(state => state.workouts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWorkoutStats();
  }, []);

  const fetchWorkoutStats = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${config.API_URL}/user/workouts/completed`);
      dispatch(setCompletedWorkouts(response.data));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as estatísticas de treino.');
    } finally {
      setIsLoading(false);
    }
  };

  const prepareWorkoutStats = () => {
    if (!completedWorkouts.length) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    
    const workoutTypes = {};
    completedWorkouts.forEach(({ type }) => {
      workoutTypes[type] = (workoutTypes[type] || 0) + 1;
    });

    return {
      labels: Object.keys(workoutTypes),
      datasets: [{ data: Object.values(workoutTypes) }],
    };
  };

  if (isLoading || loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Estatísticas dos Treinos Concluídos</Text>
      {completedWorkouts.length > 0 ? (
        <BarChart
          data={prepareWorkoutStats()}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: theme.colors.background,
            backgroundGradientTo: theme.colors.background,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noDataText}>Nenhum treino concluído ainda.</Text>
      )}
      <Button onPress={fetchWorkoutStats}>Atualizar Estatísticas</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chart: {
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
