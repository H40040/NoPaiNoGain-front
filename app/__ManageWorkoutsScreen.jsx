import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { deleteWorkout } from '../store/slices/workoutSlice';
import Button from '../components/Button';
import theme from '../theme';

export default function ManageWorkoutsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const workouts = useSelector((state) => state.workouts.workouts);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelectionMode = () => {
    if (selectedWorkouts.length > 0) {
      Alert.alert(
        'Cancelar Seleção',
        'Deseja realmente cancelar a seleção atual?',
        [
          { text: 'Não', style: 'cancel' },
          { text: 'Sim', onPress: () => {
            setIsSelectionMode(false);
            setSelectedWorkouts([]);
          }}
        ]
      );
    } else {
      setIsSelectionMode(!isSelectionMode);
    }
  };

  const toggleWorkoutSelection = (workoutId) => {
    if (selectedWorkouts.includes(workoutId)) {
      setSelectedWorkouts(selectedWorkouts.filter(id => id !== workoutId));
    } else {
      setSelectedWorkouts([...selectedWorkouts, workoutId]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedWorkouts.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um treino para excluir.');
      return;
    }

    Alert.alert(
      'Confirmar exclusão',
      `Deseja excluir ${selectedWorkouts.length} treino(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteMultipleWorkouts(selectedWorkouts));
            setSelectedWorkouts([]);
            setIsSelectionMode(false);
          }
        }
      ]
    );
  };
  

  const handleEditWorkout = (workoutId) => {
    router.push(`/WorkoutDetailsScreen?id=${workoutId}&mode=edit`);
  };

  const renderWorkoutItem = ({ item }) => {
    const isSelected = selectedWorkouts.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.workoutItem,
          isSelected && styles.selectedWorkoutItem
        ]}
        onPress={() => isSelectionMode ? toggleWorkoutSelection(item.id) : handleEditWorkout(item.id)}
        onLongPress={() => {
          if (!isSelectionMode) {
            setIsSelectionMode(true);
            toggleWorkoutSelection(item.id);
          }
        }}
      >
        <View style={styles.workoutHeader}>
          <View style={styles.workoutTitleContainer}>
            {isSelectionMode && (
              <MaterialCommunityIcons
                name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                size={24}
                color={isSelected ? theme.colors.primary : theme.colors.text}
                style={styles.checkboxIcon}
              />
            )}
            <Text style={styles.workoutTitle}>{item.name}</Text>
            {item.isAIGenerated && (
              <MaterialCommunityIcons
                name="robot"
                size={18}
                color={theme.colors.secondary}
                style={styles.aiIcon}
              />
            )}
          </View>
          {!isSelectionMode && (
            <TouchableOpacity
              onPress={() => handleEditWorkout(item.id)}
              style={styles.editButton}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.homeButton}>
            <MaterialCommunityIcons name="home" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Gerenciar Treinos</Text>
          <TouchableOpacity onPress={() => router.push('/ProfileScreen')} style={styles.profileButton}>
            <MaterialCommunityIcons name="account-circle" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <Button
            title={isSelectionMode ? "Cancelar Seleção" : "Selecionar Treinos"}
            onPress={toggleSelectionMode}
            icon={isSelectionMode ? "close" : "checkbox-multiple-marked-outline"}
            variant="outline"
            style={styles.actionButton}
          />
          {isSelectionMode && (
            <Button
              title="Excluir Selecionados"
              onPress={handleDeleteSelected}
              icon="delete"
              variant="danger"
              style={styles.actionButton}
            />
          )}
        </View>
      </View>

      {workouts.length > 0 ? (
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
          <Button
            title="Criar Novo Treino"
            onPress={() => router.push('/workout-details?mode=create')}
            icon="plus"
            style={styles.emptyStateButton}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title="Voltar"
          onPress={() => router.back()}
          icon="arrow-left"
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title="Novo Treino"
          onPress={() => router.push('/workout-details?mode=create')}
          icon="plus"
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  headerActions: {
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
  selectedWorkoutItem: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  workoutTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxIcon: {
    marginRight: theme.spacing.sm,
  },
  workoutTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  aiIcon: {
    marginLeft: theme.spacing.sm,
  },
  editButton: {
    padding: theme.spacing.xs,
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
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  emptyStateButton: {
    minWidth: 200,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});
