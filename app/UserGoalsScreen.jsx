import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { fetchUserGoals, deleteUserGoal } from '../store/slices/userGoalsSlice';
import storage from '../utils/storage';
import Text from '../components/Text';
import Button from '../components/Button';
import GoalItem from '../components/GoalItem';
import theme from '../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

export default function UserGoalsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { goals, loading, error } = useSelector(state => state.userGoals);

  useEffect(() => {
    dispatch(fetchUserGoals());
  }, [dispatch]);

  const handleGoalPress = (goalId) => {
    router.push(`/UserGoalDetailsScreen?goalId=${goalId}`);
  };

  const handleDeleteGoal = async (goalId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await dispatch(deleteUserGoal(goalId)).unwrap();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      <Text style={styles.title}>Minhas Metas</Text>

      {error && <Text style={styles.errorText}>Erro ao carregar metas: {error}</Text>}

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você não possui metas cadastradas.</Text>
          <Button onPress={() => router.push('/CreateUserGoalScreen')}>Criar Meta</Button>
        </View>
      ) : (
        <ScrollView>
          {goals.map(goal => (
            <GoalItem
              key={goal._id}
              goal={goal}
              onPress={() => handleGoalPress(goal._id)}
              onDelete={() => handleDeleteGoal(goal._id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
});
