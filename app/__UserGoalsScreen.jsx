import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Button from '../components/Button';
import theme from '../theme';
import { storage } from '../utils/storage';
import { fetchUserGoals, deleteUserGoal } from '../store/slices/userGoalsSlice';

// Função auxiliar para feedback tátil
const triggerHaptic = (type) => {
  if (Platform.OS !== 'web') {
    try {
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log('Haptics não disponível:', error);
    }
  }
};

// Componente para exibir uma meta individual
const GoalItem = ({ goal, onPress, onDelete, onUpdateProgress }) => {
  // Calcular progresso
  const progress = Math.min(100, Math.max(0, 
    goal.type === 'peso' 
      ? Math.abs((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue) * 100)
      : goal.progress || 0
  ));
  
  // Formatar data alvo
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Verificar se a meta está próxima do prazo (menos de 7 dias)
  const isNearDeadline = () => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };
  
  // Verificar se a meta está atrasada
  const isOverdue = () => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    return today > targetDate && goal.status !== 'concluída';
  };
  
  // Determinar cor do card com base no status
  const getCardColor = () => {
    if (goal.status === 'concluída') return theme.colors.success + '20';
    if (goal.status === 'cancelada') return theme.colors.disabled + '30';
    if (isOverdue()) return theme.colors.error + '20';
    if (isNearDeadline()) return theme.colors.warning + '20';
    return theme.colors.card;
  };
  
  return (
    <TouchableOpacity 
      style={[styles.goalCard, { backgroundColor: getCardColor() }]}
      onPress={() => onPress(goal)}
      activeOpacity={0.7}
    >
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>{goal.title}</Text>
        <TouchableOpacity 
          onPress={() => onDelete(goal._id)}
          style={styles.deleteButton}
        >
          <MaterialCommunityIcons name="delete-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.goalDescription}>{goal.description}</Text>
      
      <View style={styles.goalDetails}>
        <Text style={styles.goalDetailText}>
          <Text style={styles.goalDetailLabel}>Categoria: </Text>
          {goal.category || 'Geral'}
        </Text>
        <Text style={styles.goalDetailText}>
          <Text style={styles.goalDetailLabel}>Data alvo: </Text>
          {formatDate(goal.targetDate)}
        </Text>
        <Text style={styles.goalDetailText}>
          <Text style={styles.goalDetailLabel}>Status: </Text>
          {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progress}%`,
                backgroundColor: progress >= 100 
                  ? theme.colors.success 
                  : theme.colors.primary 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
      
      <View style={styles.goalActions}>
        <Button 
          title="Atualizar Progresso" 
          onPress={() => onUpdateProgress(goal)} 
          type="secondary"
          size="small"
        />
      </View>
    </TouchableOpacity>
  );
};

export default function UserGoalsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar autenticação ao montar o componente
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const userData = await storage.getUserData();
        if (!userData || !userData.token) {
          console.log('Nenhum dado de usuário encontrado, redirecionando para login...');
          router.replace('/(tabs)/LoginScreen');
          return;
        }
        
        // Carregar metas do usuário
        dispatch(fetchUserGoals());
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.replace('/(tabs)/LoginScreen');
      }
    };
    
    checkAuthentication();
  }, [dispatch, router]);
  
  // Acessar o estado de autenticação e metas do usuário
  const authState = useSelector((state) => ({
    user: state.auth?.user || null,
    isAuthenticated: state.auth?.isAuthenticated || false
  }));
  
  const userGoalsState = useSelector((state) => {
    if (!state || !state.userGoals) return { goals: [], loading: false, error: null };
    return state.userGoals;
  });
  
  // Garantir valores padrão para todas as propriedades
  const goals = userGoalsState?.goals || [];
  const loading = !!userGoalsState?.loading;
  const error = userGoalsState?.error;
  
  // Funções para manipular metas
  const handleGoalPress = (goal) => {
    // Navegar para a tela de detalhes da meta
    router.push({
      pathname: '/UserGoalDetailsScreen',
      params: { goalId: goal._id }
    });
  };
  
  const handleDeleteGoal = (goalId) => {
    triggerHaptic('medium');
    Alert.alert(
      'Excluir Meta',
      'Tem certeza que deseja excluir esta meta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          onPress: () => {
            dispatch(deleteUserGoal(goalId));
            triggerHaptic('success');
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const handleUpdateProgress = (goal) => {
    // Navegar para a tela de atualização de progresso
    router.push({
      pathname: '/UpdateGoalProgressScreen',
      params: { goalId: goal._id }
    });
  };
  
  const handleAddGoal = () => {
    triggerHaptic('light');
    router.push('/CreateUserGoalScreen');
  };
  
  // Filtrar metas por status
  const activeGoals = goals.filter(goal => goal.status === 'ativa');
  const completedGoals = goals.filter(goal => goal.status === 'concluída');
  const otherGoals = goals.filter(goal => goal.status !== 'ativa' && goal.status !== 'concluída');
  
  if (isLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando metas...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={50} color={theme.colors.error} />
        <Text style={styles.errorText}>Erro ao carregar metas: {error}</Text>
        <Button 
          title="Tentar Novamente" 
          onPress={() => dispatch(fetchUserGoals())} 
          type="primary"
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Metas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddGoal}
        >
          <MaterialCommunityIcons name="plus" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      
      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="target" size={80} color={theme.colors.disabled} />
          <Text style={styles.emptyText}>Você ainda não possui metas cadastradas</Text>
          <Button 
            title="Criar Primeira Meta" 
            onPress={handleAddGoal} 
            type="primary"
          />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeGoals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Metas Ativas ({activeGoals.length})</Text>
              {activeGoals.map(goal => (
                <GoalItem 
                  key={goal._id} 
                  goal={goal} 
                  onPress={handleGoalPress}
                  onDelete={handleDeleteGoal}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </View>
          )}
          
          {completedGoals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Metas Concluídas ({completedGoals.length})</Text>
              {completedGoals.map(goal => (
                <GoalItem 
                  key={goal._id} 
                  goal={goal} 
                  onPress={handleGoalPress}
                  onDelete={handleDeleteGoal}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </View>
          )}
          
          {otherGoals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Outras Metas ({otherGoals.length})</Text>
              {otherGoals.map(goal => (
                <GoalItem 
                  key={goal._id} 
                  goal={goal} 
                  onPress={handleGoalPress}
                  onDelete={handleDeleteGoal}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  goalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  goalDetails: {
    marginBottom: 12,
  },
  goalDetailText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  goalDetailLabel: {
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.disabled,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    width: 40,
    textAlign: 'right',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});