import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { saveWorkout, generateWorkout } from '../store/slices/workoutSlice';
import { checkAuth } from '../store/slices/authSlice';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../theme';
//import * as workoutGenerationService from '../services/workoutGeneration';
//import * as anamneseService from '../services/anamnese';
import { storage } from '../utils/storage';
import { updateActivity } from '../utils/authManager';

export default function GeneratedWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();  
  const generatedWorkout = useSelector((state) => state.workouts.generatedWorkout);
  const error = useSelector((state) => state.workouts.error);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    exercises: [],
    isAIGenerated: true,
    isOffline: false
  });

  const [loading, setLoading] = useState(true);
  const [canGenerate, setCanGenerate] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [remainingDays, setRemainingDays] = useState(0);
  const [hasAnamnese, setHasAnamnese] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth()).unwrap().catch(() => {
      router.push('/login');
    });
    checkEligibility();
  }, [dispatch, router]);

  const checkEligibility = async () => {
    try {
      setLoading(true);
      
      // Verificar status da anamnese
      const anamneseStatus = await anamneseService.checkAnamneseStatus();
      setHasAnamnese(anamneseStatus.hasAnamnese);

      if (!anamneseStatus.hasAnamnese) {
        setBlockReason('É necessário preencher a anamnese antes de gerar um treino');
        setCanGenerate(false);
        setLoading(false);
        return;
      }

      // Verificar elegibilidade para geração
      const eligibility = await generateWorkout.checkGenerationEligibility();
      setCanGenerate(eligibility.canGenerate);
      
      if (!eligibility.canGenerate) {
        setBlockReason(eligibility.reason || 'Não é possível gerar um novo treino no momento');
        if (eligibility.remainingDays) {
          setRemainingDays(eligibility.remainingDays);
        }
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Erro ao gerar treino.';
      Alert.alert('Erro na Geração do Treino', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (generatedWorkout) {
      // Verificar conectividade para determinar se é offline
      storage.isNetworkConnected().then(connected => {
        setFormData({
          name: generatedWorkout.name || 'Treino Personalizado',
          description: generatedWorkout.description || '',
          exercises: generatedWorkout.exercises || [],
          isAIGenerated: true,
          isOffline: !connected
        });
      });
    }
  }, [generatedWorkout]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      exercises: updatedExercises
    });
  };

  const handleSaveWorkout = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Por favor, dê um nome ao seu treino.');
      return;
    }

    if (formData.exercises.length === 0) {
      Alert.alert('Erro', 'Seu treino precisa ter pelo menos um exercício.');
      return;
    }

    try {
      // Verificar conectividade para determinar se é offline
      const connected = await storage.isNetworkConnected();
      
      const workoutToSave = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isOffline: formData.isOffline || !connected
      };

      await dispatch(saveWorkout(workoutToSave)).unwrap();
      Alert.alert(
        'Treino Salvo com Sucesso!',
        'Deseja visualizar agora ou ir para Meus Treinos?',
        [
          { text: 'Visualizar', onPress: () => router.push(`/WorkoutDetailsScreen?id=${workoutToSave.id}`) },
          { text: 'Ir para Meus Treinos', onPress: () => router.push('/workouts') }
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      Alert.alert('Erro', 'Falha ao salvar o treino');
    }
  };

  const handleRemoveExercise = (index) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises.splice(index, 1);
    
    setFormData({
      ...formData,
      exercises: updatedExercises
    });
  };

  const handleAddExercise = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        {
          name: '',
          sets: '',
          reps: '',
          rest: '',
          notes: ''
        }
      ]
    });
  };

  const handleGenerateWorkout = async () => {
    if (!canGenerate) {
      Alert.alert('Aviso', blockReason);
      return;
    }

    try {
      setLoading(true);
      
      // Registrar operação de longa duração para evitar expiração da sessão
      await storage.setLongRunningOperation({
        type: 'AI_WORKOUT_GENERATION',
        userId: user?.id || 'anonymous',
        details: 'Gerando treino com IA'
      });
      
      // Atualizar timestamp de atividade para evitar logout por inatividade
      updateActivity();
      
      // Obter configurações de geração
      const settings = await workoutGenerationService.getGenerationSettings();
      
      // Iniciar geração do treino
      const generatedWorkout = await dispatch(generateWorkout(settings)).unwrap();
      
      // Atualizar o estado com o treino gerado
      setFormData({
        name: generatedWorkout.name || 'Treino Personalizado',
        description: generatedWorkout.description || '',
        exercises: generatedWorkout.exercises || [],
        isAIGenerated: true,
        isOffline: false
      });
      
      // Limpar registro de operação de longa duração
      await storage.clearLongRunningOperation();
      
      // Atualizar timestamp de atividade novamente
      updateActivity();
      
    } catch (error) {
      console.error('Erro ao gerar treino:', error);
      Alert.alert('Erro', 'Não foi possível gerar o treino');
      
      // Limpar registro de operação de longa duração em caso de erro
      await storage.clearLongRunningOperation();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnamnese = () => {
    router.push('/AnamneseFormScreen');
  };

  if (isLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Gerando seu treino personalizado...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={styles.errorTitle}>Erro ao gerar treino</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Voltar e Tentar Novamente"
          onPress={() => router.back()}
          style={styles.errorButton}
        />
      </View>
    );
  }

  if (!generatedWorkout) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={theme.colors.warning} />
        <Text style={styles.errorTitle}>Nenhum treino gerado</Text>
        <Text style={styles.errorText}>Volte e preencha o formulário para gerar um treino personalizado.</Text>
        <Button
          title="Voltar para o Formulário"
          onPress={() => router.push('/AnamneseFormScreen')}
          style={styles.errorButton}
        />
      </View>
    );
  }

  if (!hasAnamnese) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Geração de Treino</Text>
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              É necessário preencher a anamnese antes de gerar um treino personalizado.
            </Text>
            <Button
              title="Preencher Anamnese"
              onPress={handleCreateAnamnese}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  if (!canGenerate) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Geração de Treino</Text>
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>{blockReason}</Text>
            {remainingDays > 0 && (
              <Text style={styles.remainingDaysText}>
                Dias restantes para nova geração: {remainingDays}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.push('/')} style={styles.homeButton}>
              <MaterialCommunityIcons name="home" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Treino Gerado</Text>
            <TouchableOpacity onPress={() => router.push('/ProfileScreen')} style={styles.profileButton}>
              <MaterialCommunityIcons name="account-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.badgesContainer}>
            <View style={styles.aiGeneratedBadge}>
              <MaterialCommunityIcons name="robot" size={20} color={theme.colors.white} />
              <Text style={styles.aiGeneratedText}>Gerado por IA</Text>
            </View>
            {formData.isOffline && (
              <View style={styles.offlineBadge}>
                <MaterialCommunityIcons name="cloud-off-outline" size={20} color={theme.colors.white} />
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Nome do Treino"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Ex: Treino de Hipertrofia"
          />
          
          <Input
            label="Descrição"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Descreva o objetivo e características do treino"
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.exercisesHeader}>
            <Text style={styles.exercisesTitle}>Exercícios</Text>
            <Button
              title="Adicionar Exercício"
              onPress={handleAddExercise}
              icon="plus"
              variant="outline"
              style={styles.addButton}
            />
          </View>
          
          {formData.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseNumber}>Exercício {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveExercise(index)}
                  style={styles.removeButton}
                >
                  <MaterialCommunityIcons name="delete" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
              
              <Input
                label="Nome do Exercício"
                value={exercise.name}
                onChangeText={(value) => handleExerciseChange(index, 'name', value)}
                placeholder="Ex: Supino Reto"
              />
              
              <View style={styles.exerciseRow}>
                <Input
                  label="Séries"
                  value={exercise.sets}
                  onChangeText={(value) => handleExerciseChange(index, 'sets', value)}
                  placeholder="Ex: 3"
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
                
                <Input
                  label="Repetições"
                  value={exercise.reps}
                  onChangeText={(value) => handleExerciseChange(index, 'reps', value)}
                  placeholder="Ex: 12"
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
                
                <Input
                  label="Descanso (seg)"
                  value={exercise.rest}
                  onChangeText={(value) => handleExerciseChange(index, 'rest', value)}
                  placeholder="Ex: 60"
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
              </View>
              
              <Input
                label="Observações"
                value={exercise.notes}
                onChangeText={(value) => handleExerciseChange(index, 'notes', value)}
                placeholder="Dicas ou instruções específicas"
                multiline
                numberOfLines={2}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Voltar"
          onPress={() => router.back()}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title="Salvar Treino"
          onPress={handleSaveWorkout}
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
  scrollView: {
    flex: 1,
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  aiGeneratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  aiGeneratedText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    marginLeft: theme.spacing.xs,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  offlineText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    marginLeft: theme.spacing.xs,
  },
  formContainer: {
    padding: theme.spacing.lg,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  exercisesTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  addButton: {
    minWidth: 150,
  },
  exerciseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  exerciseNumber: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallInput: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  errorTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  errorButton: {
    minWidth: 200,
  },
  content: {
    padding: 20,
  },
  warningContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 16,
    color: theme.colors.error,
    marginBottom: 15,
    textAlign: 'center',
  },
  remainingDaysText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  generateContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  generateText: {
    fontSize: 16,
    color: theme.colors.success,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
  },
});
