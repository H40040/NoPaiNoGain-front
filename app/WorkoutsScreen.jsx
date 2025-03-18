import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchWorkouts } from '../store/slices/workoutSlice';
import Button from '../components/Button';
import theme from '../theme';
import * as storage from '../utils/storage';

export default function WorkoutsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const workouts = useSelector((state) => state.workouts.workouts);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    dispatch(fetchWorkouts());
    loadUserData();
  }, [dispatch]);

  const loadUserData = async () => {
    try {
      const userData = await storage.getUserData();
      if (userData && userData.user) {
        setUserName(userData.user.name || '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.workoutItem, item.isOffline && styles.offlineWorkoutItem]}
      onPress={() => router.push(`/WorkoutDetailsScreen?id=${item.id}&mode=view`)}
    >
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutTitle}>{item.name}</Text>
        <View style={styles.workoutBadges}>
          {item.isOffline && (
            <View style={styles.offlineBadge}>
              <MaterialCommunityIcons
                name="cloud-off-outline"
                size={14}
                color={theme.colors.warning}
              />
              <Text style={styles.offlineBadgeText}>Offline</Text>
            </View>
          )}
          {item.isAIGenerated && (
            <MaterialCommunityIcons
              name="robot"
              size={18}
              color={theme.colors.secondary}
            />
          )}
        </View>
      </View>
      <Text style={styles.workoutDescription} numberOfLines={2}>
        {item.description || 'Sem descrição'}
      </Text>
      <View style={styles.workoutDetails}>
        <View style={styles.workoutDetail}>
          <MaterialCommunityIcons name="dumbbell" size={16} color={theme.colors.secondary} />
          <Text style={styles.workoutDetailText}>
            {item.exercises?.length || 0} exercícios
          </Text>
        </View>
        <View style={styles.workoutDetail}>
          <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.secondary} />
          <Text style={styles.workoutDetailText}>
            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push('/DashboardScreen')} style={styles.homeButton}>
            <MaterialCommunityIcons name="view-dashboard" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Treinos de {userName || 'Atleta'}</Text>
          <TouchableOpacity onPress={() => router.push('/ProfileScreen')} style={styles.profileButton}>
            <MaterialCommunityIcons name="account-circle" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.actions}>
          <Button
            title="Novo Treino"
            onPress={() => router.push('/WorkoutDetailsScreen?mode=create')}
            icon="plus"
            style={styles.actionButton}
          />
          <Button
            title="Gerar Treino com IA"
            onPress={() => router.push('/AnamneseFormScreen')}
            icon="robot"
            style={styles.actionButton}
            variant="secondary"
          />
          <Button
            title="Gerenciar"
            onPress={() => router.push('/ManageWorkoutsScreen')}
            icon="format-list-checks"
            style={styles.actionButton}
            variant="outline"
          />
        </View>
      </View>

      {workouts && workouts.length > 0 ? (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="dumbbell" size={64} color={theme.colors.disabled} />
          <Text style={styles.emptyStateText}>Você ainda não tem treinos</Text>
          <Text style={styles.emptyStateSubtext}>
            Crie um novo treino ou gere um com IA
          </Text>
          <View style={styles.emptyStateActions}>
            <Button
              title="Novo Treino"
              onPress={() => router.push('/WorkoutDetailsScreen?mode=create')}
              icon="plus"
              style={styles.emptyStateButton}
            />
            <Button
              title="Gerar com IA"
              onPress={() => router.push('/AnamneseFormScreen')}
              icon="robot"
              style={styles.emptyStateButton}
              variant="secondary"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  offlineWorkoutItem: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  workoutBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    marginRight: theme.spacing.xs,
  },
  offlineBadgeText: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.warning,
    marginLeft: 2,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  homeButton: {
    padding: theme.spacing.xs,
  },
  profileButton: {
    padding: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  workoutItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  workoutTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  workoutDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutDetailText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  emptyStateActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  emptyStateButton: {
    minWidth: 150,
    marginHorizontal: theme.spacing.sm,
  },
});
