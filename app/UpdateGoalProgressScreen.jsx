import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import theme from '../theme';
import { fetchGoalDetails, updateGoalProgress } from '../store/slices/userGoalsSlice';

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

export default function UpdateGoalProgressScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { goalId } = useLocalSearchParams();
  
  const { selectedGoal, loading, error } = useSelector(state => state.userGoals || {});
  
  const [formData, setFormData] = useState({
    currentValue: '',
    status: 'ativa'
  });
  
  // Carregar detalhes da meta ao montar o componente
  useEffect(() => {
    if (goalId) {
      dispatch(fetchGoalDetails(goalId));
    } else {
      Alert.alert('Erro', 'ID da meta não fornecido');
      router.back();
    }
  }, [dispatch, goalId, router]);
  
  // Atualizar o formulário quando os detalhes da meta forem carregados
  useEffect(() => {
    if (selectedGoal) {
      setFormData({
        currentValue: selectedGoal.currentValue?.toString() || '',
        status: selectedGoal.status || 'ativa'
      });
    }
  }, [selectedGoal]);
  
  // Opções para o status da meta
  const statusOptions = [
    { label: 'Ativa', value: 'ativa' },
    { label: 'Concluída', value: 'concluída' },
    { label: 'Pausada', value: 'pausada' },
    { label: 'Cancelada', value: 'cancelada' }
  ];
  
  // Função para atualizar os campos do formulário
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Calcular progresso atual
  const calculateProgress = () => {
    if (!selectedGoal || selectedGoal.type === 'outro') return 0;
    
    const startValue = selectedGoal.startValue || 0;
    const targetValue = selectedGoal.targetValue || 0;
    const currentValue = parseFloat(formData.currentValue) || 0;
    
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
  
  // Função para validar o formulário
  const validateForm = () => {
    if (selectedGoal && selectedGoal.type !== 'outro' && (!formData.currentValue || isNaN(Number(formData.currentValue)))) {
      Alert.alert('Erro', 'O valor atual deve ser um número válido');
      return false;
    }
    
    return true;
  };
  
  // Função para enviar o formulário
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    triggerHaptic('light');
    
    try {
      // Verificar se a meta deve ser marcada como concluída automaticamente
      let status = formData.status;
      const progress = calculateProgress();
      
      if (progress >= 100 && status === 'ativa') {
        // Perguntar ao usuário se deseja marcar a meta como concluída
        Alert.alert(
          'Meta Atingida!',
          'Você atingiu 100% da sua meta! Deseja marcá-la como concluída?',
          [
            {
              text: 'Não',
              style: 'cancel'
            },
            {
              text: 'Sim',
              onPress: () => {
                // Atualizar status para concluída
                handleChange('status', 'concluída');
                // Continuar com o envio após a mudança de estado
                setTimeout(() => {
                  submitProgress('concluída');
                }, 300);
              }
            }
          ]
        );
        return;
      }
      
      // Se não precisar perguntar, enviar diretamente
      submitProgress(status);
    } catch (err) {
      triggerHaptic('error');
      Alert.alert('Erro', err.message || 'Não foi possível atualizar o progresso. Tente novamente.');
    }
  };
  
  // Função para enviar o progresso
  const submitProgress = async (status) => {
    try {
      // Preparar dados para envio
      const progressData = {
        currentValue: selectedGoal && selectedGoal.type !== 'outro' ? Number(formData.currentValue) : undefined,
        status: status || formData.status
      };
      
      // Despachar ação para atualizar progresso
      const resultAction = await dispatch(updateGoalProgress({
        id: goalId,
        progressData
      })).unwrap();
      
      if (resultAction) {
        triggerHaptic('success');
        Alert.alert(
          'Sucesso',
          'Progresso atualizado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (err) {
      triggerHaptic('error');
      Alert.alert('Erro', err.message || 'Não foi possível atualizar o progresso. Tente novamente.');
    }
  };
  
  // Função para cancelar e voltar à tela anterior
  const handleCancel = () => {
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
  
  // Calcular o progresso atual
  const progress = calculateProgress();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Atualizar Progresso</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.goalInfoCard}>
          <Text style={styles.goalTitle}>{selectedGoal.title}</Text>
          <Text style={styles.goalDescription}>{selectedGoal.description}</Text>
          
          <View style={styles.goalDetails}>
            <Text style={styles.goalDetailText}>
              <Text style={styles.goalDetailLabel}>Categoria: </Text>
              {selectedGoal.category || 'Geral'}
            </Text>
            <Text style={styles.goalDetailText}>
              <Text style={styles.goalDetailLabel}>Tipo: </Text>
              {selectedGoal.type.charAt(0).toUpperCase() + selectedGoal.type.slice(1)}
            </Text>
            {selectedGoal.type !== 'outro' && (
              <Text style={styles.goalDetailText}>
                <Text style={styles.goalDetailLabel}>Valor alvo: </Text>
                {selectedGoal.targetValue}
              </Text>
            )}
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
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Atualizar Progresso</Text>
          
          {selectedGoal.type !== 'outro' && (
            <Input
              label="Valor Atual"
              placeholder={selectedGoal.type === 'peso' ? "Ex: 80" : "Ex: 10"}
              value={formData.currentValue}
              onChangeText={(text) => handleChange('currentValue', text)}
              keyboardType="numeric"
              required
            />
          )}
          
          <Select
            label="Status da Meta"
            options={statusOptions}
            selectedValue={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Cancelar" 
            onPress={handleCancel} 
            type="secondary"
            style={styles.button}
          />
          <Button 
            title="Salvar" 
            onPress={handleSubmit} 
            type="primary"
            style={styles.button}
            loading={loading}
          />
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
  goalInfoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
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
  formSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
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
