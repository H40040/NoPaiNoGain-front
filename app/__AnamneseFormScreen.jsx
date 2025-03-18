import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Text, TouchableOpacity, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { generateWorkout } from '../store/slices/workoutSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';
import theme from '../theme';
import * as storage from '../utils/storage';

export default function AnamneseFormScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    peso: '',
    altura: '',
    genero: '',
    objetivo: '',
    nivel: '',
    restricoes: '',
    preferencias: '',
    dias_semana: '',
    tempo_treino: '',
  });
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [userName, setUserName] = useState('');
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (loading) {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 15000, // 15 segundos para completar a animação
        useNativeDriver: false,
      }).start();

      // Textos de progresso para mostrar durante o carregamento
      const progressMessages = [
        'Analisando suas informações...',
        'Criando plano personalizado...',
        'Selecionando exercícios ideais...',
        'Ajustando intensidade do treino...',
        'Finalizando seu programa de treino...'
      ];

      let currentIndex = 0;
      setProgressText(progressMessages[0]);

      // Atualizar o texto a cada 3 segundos
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % progressMessages.length;
        setProgressText(progressMessages[currentIndex]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  const loadUserData = async () => {
    try {
      const userData = await storage.USER_DATA_KEY;
      if (userData) {
        setUserName(userData.name || '');
        
        // Preencher formulário com dados do usuário
        setFormData(prevState => ({
          ...prevState,
          nome: userData.name || '',
          idade: userData.age || '',
          peso: userData.weight || '',
          altura: userData.height || '',
          genero: userData.gender || '',
          objetivo: userData.fitnessGoal || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando o campo for preenchido
    if (value.trim() !== '') {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['nome', 'idade', 'peso', 'altura', 'genero', 'objetivo', 'nivel', 'dias_semana', 'tempo_treino'];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'Este campo é obrigatório';
      }
    });

    // Validações específicas
    if (formData.idade && (isNaN(formData.idade) || parseInt(formData.idade) < 15 || parseInt(formData.idade) > 100)) {
      newErrors.idade = 'Idade deve ser entre 15 e 100 anos';
    }

    if (formData.peso && (isNaN(formData.peso) || parseFloat(formData.peso) < 30 || parseFloat(formData.peso) > 300)) {
      newErrors.peso = 'Peso deve ser entre 30 e 300 kg';
    }

    if (formData.altura && (isNaN(formData.altura) || parseInt(formData.altura) < 100 || parseInt(formData.altura) > 250)) {
      newErrors.altura = 'Altura deve ser entre 100 e 250 cm';
    }

    if (formData.dias_semana && (isNaN(formData.dias_semana) || parseInt(formData.dias_semana) < 1 || parseInt(formData.dias_semana) > 7)) {
      newErrors.dias_semana = 'Dias por semana deve ser entre 1 e 7';
    }

    if (formData.tempo_treino && (isNaN(formData.tempo_treino) || parseInt(formData.tempo_treino) < 15 || parseInt(formData.tempo_treino) > 180)) {
      newErrors.tempo_treino = 'Tempo de treino deve ser entre 15 e 180 minutos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validar formulário
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      Alert.alert('Erro no formulário', Object.values(errors)[0]);
      return;
    }

    setIsSubmitting(true);
    setShowProgress(true);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 0.1;
          return newProgress > 0.9 ? 0.9 : newProgress;
        });
      }, 300);

      // Enviar dados para gerar treino
      await dispatch(generateWorkout(formData));
      
      // Limpar intervalo e finalizar progresso
      clearInterval(progressInterval);
      setProgress(1);
      
      // Aguardar animação de conclusão
      setTimeout(() => {
        setIsSubmitting(false);
        setShowProgress(false);
        
        // Navegar para a tela de treino gerado
        router.push('/GeneratedWorkoutScreen');
      }, 500);
    } catch (error) {
      console.error('Erro ao gerar treino:', error);
      setIsSubmitting(false);
      setShowProgress(false);
      Alert.alert('Erro', 'Ocorreu um erro ao gerar o treino. Tente novamente.');
    }
  };

  if (loading) {
    const width = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="robot" size={80} color={theme.colors.primary} />
        <Text style={styles.loadingTitle}>Gerando seu treino personalizado</Text>
        <Text style={styles.loadingText}>{progressText}</Text>
        
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width }]} />
        </View>
        
        <Text style={styles.loadingSubtext}>
          Isso pode levar alguns segundos...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.homeButton}>
            <MaterialCommunityIcons name="home" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Formulário de Anamnese</Text>
          <TouchableOpacity onPress={() => router.push('/ProfileScreen')} style={styles.profileButton}>
            <MaterialCommunityIcons name="account-circle" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {userName ? `Olá ${userName}, preencha as informações abaixo para gerar seu treino personalizado` : 'Preencha as informações abaixo para gerar um treino personalizado'}
        </Text>
      </View>
      <View style={styles.form}>
        <Input
          label="Nome Completo *"
          value={formData.nome}
          onChangeText={(text) => handleChange('nome', text)}
          placeholder="Seu nome completo"
          error={errors.nome}
        />

        <Input
          label="Idade *"
          value={formData.idade}
          onChangeText={(text) => handleChange('idade', text)}
          placeholder="Sua idade"
          keyboardType="numeric"
          error={errors.idade}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Peso (kg) *"
              value={formData.peso}
              onChangeText={(text) => handleChange('peso', text)}
              placeholder="Seu peso em kg"
              keyboardType="numeric"
              error={errors.peso}
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Altura (cm) *"
              value={formData.altura}
              onChangeText={(text) => handleChange('altura', text)}
              placeholder="Sua altura em cm"
              keyboardType="numeric"
              error={errors.altura}
            />
          </View>
        </View>

        <Input
          label="Gênero *"
          value={formData.genero}
          onChangeText={(text) => handleChange('genero', text)}
          placeholder="Selecione seu gênero"
          type="select"
          options={[
            { label: 'Masculino', value: 'masculino' },
            { label: 'Feminino', value: 'feminino' },
            { label: 'Outro', value: 'outro' },
          ]}
          error={errors.genero}
        />

        <Input
          label="Objetivo Principal *"
          value={formData.objetivo}
          onChangeText={(text) => handleChange('objetivo', text)}
          placeholder="Selecione seu objetivo"
          type="select"
          options={[
            { label: 'Perda de Peso', value: 'perda_peso' },
            { label: 'Ganho de Massa Muscular', value: 'hipertrofia' },
            { label: 'Definição Muscular', value: 'definicao' },
            { label: 'Condicionamento Físico', value: 'condicionamento' },
            { label: 'Saúde e Bem-estar', value: 'saude' },
          ]}
          error={errors.objetivo}
        />

        <Input
          label="Nível de Treino *"
          value={formData.nivel}
          onChangeText={(text) => handleChange('nivel', text)}
          placeholder="Selecione seu nível"
          type="select"
          options={[
            { label: 'Iniciante', value: 'iniciante' },
            { label: 'Intermediário', value: 'intermediario' },
            { label: 'Avançado', value: 'avancado' },
          ]}
          error={errors.nivel}
        />

        <Input
          label="Restrições ou Lesões"
          value={formData.restricoes}
          onChangeText={(text) => handleChange('restricoes', text)}
          placeholder="Descreva qualquer restrição ou lesão"
          multiline
          numberOfLines={3}
          error={errors.restricoes}
        />

        <Input
          label="Preferências de Exercícios"
          value={formData.preferencias}
          onChangeText={(text) => handleChange('preferencias', text)}
          placeholder="Exercícios ou equipamentos que você prefere"
          multiline
          numberOfLines={3}
          error={errors.preferencias}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Dias por Semana *"
              value={formData.dias_semana}
              onChangeText={(text) => handleChange('dias_semana', text)}
              placeholder="Quantos dias"
              keyboardType="numeric"
              error={errors.dias_semana}
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Tempo por Treino (min) *"
              value={formData.tempo_treino}
              onChangeText={(text) => handleChange('tempo_treino', text)}
              placeholder="Minutos"
              keyboardType="numeric"
              error={errors.tempo_treino}
            />
          </View>
        </View>

        <View style={styles.disclaimer}>
          <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.disclaimerText}>
            Os campos marcados com * são obrigatórios. Quanto mais informações você fornecer, melhor será o treino gerado.
          </Text>
        </View>

        <Button 
          title="Gerar Treino Personalizado" 
          onPress={handleSubmit} 
          style={styles.submitButton}
          icon="robot"
          loading={isSubmitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.lg,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfInput: {
    width: '48%',
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  loadingTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  loadingText: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  loadingSubtext: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.md,
  },
  disclaimerText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  homeButton: {
    marginRight: theme.spacing.md,
  },
  profileButton: {
    marginLeft: theme.spacing.md,
  },
});
