import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkouts, fetchWorkoutExecutions } from '../store/slices/workoutSlice';
import StatCard from '../components/StatCard';
import ProgressChart from '../components/ProgressCharts';

const DashboardScreen = () => {
  const dispatch = useDispatch();

  const { workouts, workoutExecutions, loading } = useSelector(state => state.workouts);

  // Chamada explícita dos serviços Redux ao montar a tela
  useEffect(() => {
    dispatch(fetchWorkouts());
    dispatch(fetchWorkoutExecutions());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <StatCard title="Total de Treinos" value={workouts.length} icon="dumbbell" />
      <StatCard title="Sequência Atual" value={currentStreak} icon="fire" />

      <ProgressChart workouts={workouts} workoutExecutions={workoutExecutions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  }
});

export default DashboardScreen;
