import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { saveWorkout, generateWorkout, checkGenerationEligibility } from '../store/slices/workoutSlice';
import { checkAnamneseStatus } from '../services/anamneseService';
import { checkAuth } from '../store/slices/authSlice';
import GeneratedWorkoutForm from '../components/GeneratedWorkoutForm';
import theme from '../theme';

const GeneratedWorkoutScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { generatedWorkout, loading } = useSelector(state => state.workouts);
  const { user } = useSelector(state => state.auth);

  const [canGenerate, setCanGenerate] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [hasAnamnese, setHasAnamnese] = useState(false);

  useEffect(() => {
    dispatch(checkAuth()).unwrap().catch(() => router.push('/login'));

    (async () => {
      const anamnese = await checkAnamneseStatus();
      setHasAnamnese(anamnese.hasAnamnese);

      if (!anamnese.hasAnamnese) {
        setBlockReason('Preencha a anamnese para gerar treinos personalizados.');
        return;
      }

      const eligibility = await dispatch(checkGenerationEligibility()).unwrap();
      setCanGenerate(eligibility.canGenerate);

      if (!eligibility.canGenerate) {
        setBlockReason(eligibility.reason);
      }
    })();
  }, [dispatch, router]);

  const handleGenerateWorkout = async (settings) => {
    if (!canGenerate) {
      Alert.alert('Aviso', blockReason);
      return;
    }

    try {
      await dispatch(generateWorkout(settings)).unwrap();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao gerar treino.');
    }
  };

  const handleSaveWorkout = async (workoutData) => {
    try {
      await dispatch(saveWorkout(workoutData)).unwrap();
      Alert.alert(
        'Treino Salvo com Sucesso!',
        'Deseja visualizar agora ou ir para Meus Treinos?',
        [
          { text: 'Visualizar', onPress: () => router.push(`/WorkoutDetailsScreen?id=${workoutData.id}`) },
          { text: 'Meus Treinos', onPress: () => router.push('/workouts') }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar o treino.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <GeneratedWorkoutForm
      workout={generatedWorkout}
      hasAnamnese={hasAnamnese}
      canGenerate={canGenerate}
      blockReason={blockReason}
      onGenerateWorkout={handleGenerateWorkout}
      onSaveWorkout={handleSaveWorkout}
    />
  );
};

export default GeneratedWorkoutScreen;
