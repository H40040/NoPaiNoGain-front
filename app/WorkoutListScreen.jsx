import React, { useEffect } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { fetchWorkouts } from '../store/slices/workoutSlice';
import Text from '../components/Text';
import WorkoutCard from '../components/WorkoutCard';
import theme from '../theme';

const WorkoutListScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { workouts, loading } = useSelector(state => state.workouts);

  useEffect(() => {
    dispatch(fetchWorkouts());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity onPress={() => router.push(`/WorkoutDetailsScreen?workoutId=${item.id}`)}>
      <WorkoutCard workout={item} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkoutItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum treino encontrado.</Text>}
      />
    </View>
  );
};

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
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.colors.textSecondary,
  },
});

export default WorkoutListScreen;
