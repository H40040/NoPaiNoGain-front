import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Button from '../components/Button';
import theme from '../theme';
import { fetchGoalDetails, deleteUserGoal } from '../store/slices/userGoalsSlice';

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
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log('Haptics não disponível:', error);
    }
  }
};

export default function UserGoalDetailsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { goalId } = useLocalSearchParams();
  
  const { selectedGoal, loading, error } = useSelector(state => state.userGoals || {});
  
  // Carregar detalhes da meta ao montar o componente
  useEffect(() => {
    if (goalId) {
      dispatch(fetchGoalDetails(goalId));
    } else {
      Alert.alert('Erro', 'ID da meta não fornecido');
      router.back();
    }
  }, [dispatch, goalId, router]);
  
  // Formatar data para exibição
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Calcular dias restantes
  const calculateRemainingDays = (targetDate) => {
    if (!targetDate) return 0;
    
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Calcular progresso
  const calculateProgress = () => {
    if (!selectedGoal || selectedGoal.type === 'outro') return 0;
    
    const startValue = selectedGoal.startValue || 0;
    const targetValue = selectedGoal.targetValue || 0;
    const currentValue = selectedGoal.currentValue || 0;
    
    // Para metas de peso (onde menor é melhor)
    if (selectedGoal.type === 'peso' && startValue > targetValue) {
      const totalChange = startValue - targetValue;
      const currentChange = startValue - currentValue;
      return Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
    }
    
    // Para outros tipos de metas (onde maior é melhor)
    const totalChange = targetValue - startValue;
    const currentChange = currentValue - startValue;
    return Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
  };
  
  // Função para atualizar o progresso
  const handleUpdateProgress = () => {
    triggerHaptic('light');
    router.push({
      pathname: '/UpdateGoalProgressScreen',
      params: { goalId }
    });
  };
  
  // Função para excluir a meta
  const handleDelete = () => {
    triggerHaptic('medium');
    Alert.alert(
      'Excluir Meta',
      'Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await dispatch(deleteUserGoal(goalId)).unwrap();
              triggerHaptic('success');
              Alert.alert('Sucesso', 'Meta excluída com sucesso', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (err) {
              triggerHaptic('error');
              Alert.alert('Erro', err.message || 'Não foi possível excluir a meta');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  // Função para voltar à tela anterior
  const handleBack = () => {
    triggerHaptic('light');
    router.back();
  };
  
  if (loading || !selectedGoal) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando detalhes da meta...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={50} color={theme.colors.error} />
        <Text style={styles.errorText}>Erro ao carregar meta: {error}</Text>
        <Button 
          title="Tentar Novamente" 
          onPress={() => dispatch(fetchGoalDetails(goalId))} 
          type="primary"
        />
      </View>
    );
  }
  
  // Calcular progresso e dias restantes
  const progress = calculateProgress();
  const remainingDays = calculateRemainingDays(selectedGoal.targetDate);
  
  // Determinar cor do status
  const getStatusColor = () => {
    switch (selectedGoal.status) {
      case 'concluída':
        return theme.colors.success;
      case 'cancelada':
        return theme.colors.disabled;
      case 'pausada':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };
  
  // Determinar ícone para o tipo de meta
  const getTypeIcon = () => {
    switch (selectedGoal.type) {
      case 'peso':
        return 'scale';
      case 'medida':
        return 'tape-measure';
      case 'repeticoes':
        return 'repeat';
      case 'distancia':
        return 'map-marker-distance';
      case 'tempo':
        return 'timer-outline';
      default:
        return 'target';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes da Meta</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <MaterialCommunityIcons name="delete-outline" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>{selectedGoal.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>
                {selectedGoal.status.charAt(0).toUpperCase() + selectedGoal.status.slice(1)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.goalDescription}>{selectedGoal.description}</Text>
          
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Progresso</Text>
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
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Detalhes</Text>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialCommunityIcons name={getTypeIcon()} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tipo</Text>
                <Text style={styles.detailValue}>
                  {selectedGoal.type.charAt(0).toUpperCase() + selectedGoal.type.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialCommunityIcons name="tag-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Categoria</Text>
                <Text style={styles.detailValue}>
                  {selectedGoal.category.charAt(0).toUpperCase() + selectedGoal.category.slice(1)}
                </Text>
              </View>
            </View>
            
            {selectedGoal.type !== 'outro' && (
              <>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <MaterialCommunityIcons name="flag-outline" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Valor Inicial</Text>
                    <Text style={styles.detailValue}>{selectedGoal.startValue || 0}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <MaterialCommunityIcons name="flag-checkered" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Valor Alvo</Text>
                    <Text style={styles.detailValue}>{selectedGoal.targetValue}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <MaterialCommunityIcons name="trending-up" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Valor Atual</Text>
                    <Text style={styles.detailValue}>{selectedGoal.currentValue}</Text>
                  </View>
                </View>
              </>
            )}
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialCommunityIcons name="calendar-start" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Data de Início</Text>
                <Text style={styles.detailValue}>{formatDate(selectedGoal.startDate)}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialCommunityIcons name="calendar-end" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Data Alvo</Text>
                <Text style={styles.detailValue}>{formatDate(selectedGoal.targetDate)}</Text>
              </View>
            </View>
            
            {remainingDays > 0 && selectedGoal.status === 'ativa' && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Dias Restantes</Text>
                  <Text style={styles.detailValue}>{remainingDays} dias</Text>
                </View>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Frequência de Lembretes</Text>
                <Text style={styles.detailValue}>
                  {selectedGoal.reminderFrequency 
                    ? selectedGoal.reminderFrequency.charAt(0).toUpperCase() + selectedGoal.reminderFrequency.slice(1) 
                    : 'Nenhuma'}
                </Text>
              </View>
            </View>
          </View>
          
          {selectedGoal.status === 'ativa' && (
            <View style={styles.actionButtons}>
              <Button 
                title="Atualizar Progresso" 
                onPress={handleUpdateProgress} 
                type="primary"
                icon="trending-up"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  goalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 16,
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
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  progressSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: theme.colors.disabled,
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    width: 50,
    textAlign: 'right',
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  actionButtons: {
    marginTop: 8,
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
});
