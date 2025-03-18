import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { fetchCompletedWorkouts } from '../store/slices/workoutSlice';
import Text from '../components/Text';
import Button from '../components/Button';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import theme from '../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function WorkoutStatsScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { completedWorkouts, loading } = useSelector(state => state.workouts);

  useEffect(() => {
    dispatch(fetchCompletedWorkouts());
  }, [dispatch]);

  const prepareWorkoutStats = () => {
    const workoutTypes = {};

    completedWorkouts.forEach(({ type }) => {
      workoutTypes[type] = (workoutTypes[type] || 0) + 1;
    });

    return {
      labels: Object.keys(workoutTypes),
      datasets: [{ data: Object.values(workoutTypes) }],
    };
  };

  if (!completedWorkouts || loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Estatísticas dos Treinos</Text>

      {completedWorkouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="chart-timeline-variant" size={64} color={theme.colors.secondary} />
          <Text style={styles.emptyText}>Você ainda não concluiu nenhum treino.</Text>
        </View>
      ) : (
        <BarChart
          data={{
            labels: Object.keys(workoutTypes),
            datasets: [{ data: Object.values(workoutTypes) }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.background,
            color: () => theme.colors.primary,
            labelColor: () => theme.colors.text,
            barPercentage: 0.7,
          }}
          style={styles.chart}
        />
      )}

      <Button onPress={() => router.push('/DashboardScreen')} style={styles.button}>
        Voltar ao Dashboard
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 20,
    borderRadius: 8,
  },
  button: {
    marginTop: 20,
  },
});