import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, Text, TouchableOpacity, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { saveWorkout } from '../store/slices/workoutSlice';
import Button from '../components/Button';
import Input from '../components/Input';
import ExerciseSelector from '../components/ExerciseSelector';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import theme from '../theme';
import * as storage from '../utils/storage';

export default function WorkoutDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  
  const { mode, workoutId, generatedWorkout } = params;
  const workouts = useSelector((state) => state.workouts.workouts);
  const generatedWorkoutData = useSelector((state) => state.workouts.generatedWorkout);
  const existingWorkout = workouts.find(w => w.id === workoutId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    exercises: [],
  });

  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && existingWorkout) {
      setFormData(existingWorkout);
      setIsAIGenerated(existingWorkout.isAIGenerated || false);
      setIsOffline(existingWorkout.isOffline || false);
    } else if (mode === 'create' && generatedWorkout === 'true' && generatedWorkoutData) {
      setFormData({
        ...generatedWorkoutData,
        isAIGenerated: true
      });
      setIsAIGenerated(true);
      // Verificar conectividade para determinar se é offline
      storage.isNetworkConnected().then(connected => {
        setIsOffline(!connected);
      });
    }
  }, [mode, existingWorkout, generatedWorkout, generatedWorkoutData]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'O nome do treino é obrigatório');
      return;
    }

    if (formData.exercises.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um exercício');
      return;
    }

    try {
      // Verificar conectividade para determinar se é offline
      const connected = await storage.isNetworkConnected();
      
      await dispatch(saveWorkout({
        ...formData,
        isAIGenerated: isAIGenerated,
        isOffline: isOffline || !connected
      })).unwrap();
      router.back();
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      Alert.alert('Erro', 'Falha ao salvar o treino');
    }
  };

  const handleAddExercise = () => {
    setEditingExerciseIndex(null);
    setShowExerciseSelector(true);
  };

  const handleEditExercise = (index) => {
    setEditingExerciseIndex(index);
    setShowExerciseSelector(true);
  };

  const handleSelectExercise = (exercise) => {
    const exerciseData = {
      ...exercise,
      sets: '3',
      reps: '12',
      weight: '',
    };

    if (editingExerciseIndex !== null) {
      const updatedExercises = [...formData.exercises];
      updatedExercises[editingExerciseIndex] = {
        ...exerciseData,
        sets: formData.exercises[editingExerciseIndex].sets,
        reps: formData.exercises[editingExerciseIndex].reps,
        weight: formData.exercises[editingExerciseIndex].weight,
      };
      setFormData({ ...formData, exercises: updatedExercises });
    } else {
      setFormData({
        ...formData,
        exercises: [...formData.exercises, exerciseData],
      });
    }
  };

  const handleRemoveExercise = (index) => {
    if (formData.exercises.length === 1) {
      Alert.alert('Aviso', 'O treino deve ter pelo menos um exercício');
      return;
    }
    const updatedExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const updateExerciseDetail = (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const handleShare = () => {
    setShowShareOptions(true);
  };

  const handleShareClose = () => {
    setShowShareOptions(false);
  };

  const shareAsText = async () => {
    try {
      // Formatar o treino como texto
      let shareText = `🏋️‍♂️ TREINO: ${formData.name}\n\n`;
      shareText += `📝 ${formData.description}\n\n`;
      shareText += `📋 EXERCÍCIOS:\n`;
      
      formData.exercises.forEach((exercise, index) => {
        shareText += `\n${index + 1}. ${exercise.name}\n`;
        shareText += `   - Séries: ${exercise.sets}\n`;
        shareText += `   - Repetições: ${exercise.reps}\n`;
        if (exercise.rest) {
          shareText += `   - Descanso: ${exercise.rest}s\n`;
        }
        if (exercise.notes) {
          shareText += `   - Observações: ${exercise.notes}\n`;
        }
      });
      
      shareText += `\n\nGerado pelo app No Pain No Gain 💪`;
      
      // Verificar se o compartilhamento está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Compartilhar usando a API de compartilhamento do Expo
        await Sharing.shareAsync('', { 
          mimeType: 'text/plain',
          dialogTitle: 'Compartilhar Treino',
          UTI: 'public.plain-text', // para iOS
          message: shareText // para Android
        });
      } else {
        Alert.alert(
          'Compartilhamento não disponível', 
          'O compartilhamento não está disponível neste dispositivo'
        );
      }
      
      setShowShareOptions(false);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o treino');
    }
  };

  const shareAsImage = async () => {
    try {
      setShowShareOptions(false);
      // Implementação futura - Gerar imagem do treino
      Alert.alert('Em breve', 'Compartilhamento como imagem será implementado em breve!');
    } catch (error) {
      console.error('Erro ao compartilhar como imagem:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o treino como imagem');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.homeButton}>
              <MaterialCommunityIcons name="home" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {mode === 'create' ? 'Novo Treino' : mode === 'edit' ? 'Editar Treino' : 'Detalhes do Treino'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/ProfileScreen')} style={styles.profileButton}>
              <MaterialCommunityIcons name="account-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {isAIGenerated && (
            <View style={styles.aiGeneratedBadge}>
              <MaterialCommunityIcons name="robot" size={20} color={theme.colors.white} />
              <Text style={styles.aiGeneratedText}>Gerado por IA</Text>
            </View>
          )}
          {isOffline && (
            <View style={styles.offlineBadge}>
              <MaterialCommunityIcons name="cloud-off-outline" size={20} color={theme.colors.white} />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.form}>
            <Input
              label="Nome do Treino"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Treino A - Superiores"
            />

            <Input
              label="Descrição"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Descreva seu treino"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Tipo"
              value={formData.type}
              onChangeText={(text) => setFormData({ ...formData, type: text })}
              placeholder="Ex: Força, Hipertrofia, Resistência"
            />

            <View style={styles.exercisesHeader}>
              <Text style={styles.subtitle}>Exercícios</Text>
              <Button
                title="Adicionar Exercício"
                onPress={handleAddExercise}
                variant="secondary"
              />
            </View>

            {formData.exercises.map((exercise, index) => (
              <View key={exercise.id || index} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View>
                    <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                    <Text style={styles.exerciseDescription}>
                      {exercise.description}
                    </Text>
                  </View>
                  <View style={styles.exerciseActions}>
                    <Button
                      title="Editar"
                      variant="secondary"
                      onPress={() => handleEditExercise(index)}
                      style={styles.actionButton}
                    />
                    <Button
                      title="Remover"
                      variant="danger"
                      onPress={() => handleRemoveExercise(index)}
                      style={styles.actionButton}
                    />
                  </View>
                </View>

                <View style={styles.exerciseDetails}>
                  <Input
                    label="Séries"
                    value={exercise.sets}
                    onChangeText={(text) => updateExerciseDetail(index, 'sets', text)}
                    placeholder="3"
                    keyboardType="numeric"
                    style={styles.exerciseInput}
                  />
                  <Input
                    label="Repetições"
                    value={exercise.reps}
                    onChangeText={(text) => updateExerciseDetail(index, 'reps', text)}
                    placeholder="12"
                    keyboardType="numeric"
                    style={styles.exerciseInput}
                  />
                  <Input
                    label="Peso (kg)"
                    value={exercise.weight}
                    onChangeText={(text) => updateExerciseDetail(index, 'weight', text)}
                    placeholder="20"
                    keyboardType="numeric"
                    style={styles.exerciseInput}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              title="Salvar"
              onPress={handleSave}
              style={styles.actionButton}
            />
            <Button
              title="Compartilhar"
              variant="secondary"
              icon="share"
              onPress={handleShare}
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showExerciseSelector}
        animationType="slide"
        onRequestClose={() => setShowExerciseSelector(false)}
      >
        <ExerciseSelector
          onSelect={handleSelectExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      </Modal>

      {/* Modal de compartilhamento */}
      <Modal
        visible={showShareOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={handleShareClose}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleShareClose}
        >
          <View style={styles.shareModal}>
            <Text style={styles.shareModalTitle}>Compartilhar Treino</Text>
            
            <TouchableOpacity 
              style={styles.shareOption} 
              onPress={shareAsText}
            >
              <MaterialCommunityIcons name="text-box-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.shareOptionText}>Compartilhar como texto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shareOption} 
              onPress={shareAsImage}
            >
              <MaterialCommunityIcons name="image-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.shareOptionText}>Compartilhar como imagem</Text>
            </TouchableOpacity>
            
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={handleShareClose}
              style={styles.cancelShareButton}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeButton: {
    marginRight: theme.spacing.md,
  },
  profileButton: {
    marginLeft: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.lg,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  subtitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
  },
  exerciseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
  },
  exerciseDescription: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  exerciseInput: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
  aiGeneratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  aiGeneratedText: {
    ...theme.typography.body,
    color: theme.colors.white,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.warning,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  },
  offlineText: {
    ...theme.typography.body,
    color: theme.colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  shareModal: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  shareModalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  shareOptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  cancelShareButton: {
    marginTop: theme.spacing.lg,
  },
});
