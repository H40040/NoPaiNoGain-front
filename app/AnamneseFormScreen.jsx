import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { generateWorkout } from '../store/slices/workoutSlice';
import Input from '../components/Input';
import Button from '../components/Button';
import theme from '../theme';
import storage from '../utils/storage';

export default function AnamneseFormScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '', idade: '', peso: '', altura: '', genero: '', objetivo: '', nivel: '', restricoes: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    const userData = await storage.getItem(storage.USER_DATA_KEY);
    if (userData) {
      setFormData(JSON.parse(userData));
    }
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.idade || !formData.peso || !formData.altura) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const generatedWorkout = await dispatch(generateWorkout(formData)).unwrap();
      Alert.alert(
        'Treino Gerado com Sucesso!',
        'Deseja visualizar agora ou ir para Meus Treinos?',
        [
          { text: 'Visualizar', onPress: () => router.push(`/WorkoutDetailsScreen?id=${generatedWorkout.id}`) },
          { text: 'Meus Treinos', onPress: () => router.push('/workouts') }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao gerar treino.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Input placeholder="Nome" value={formData.nome} onChangeText={(value) => setFormData({ ...formData, nome: value })} />
      <Input placeholder="Idade" value={formData.idade} onChangeText={(value) => setFormData({ ...formData, idade: value })} keyboardType="numeric" />
      <Input placeholder="Peso (kg)" value={formData.peso} onChangeText={(value) => setFormData({ ...formData, peso: value })} keyboardType="numeric" />
      <Input placeholder="Altura (cm)" value={formData.altura} onChangeText={(value) => setFormData({ ...formData, altura: value })} keyboardType="numeric" />
      <Input placeholder="Gênero" value={formData.genero} onChangeText={(value) => setFormData({ ...formData, genero: value })} />
      <Input placeholder="Objetivo" value={formData.objetivo} onChangeText={(value) => setFormData({ ...formData, objetivo: value })} />
      <Input placeholder="Nível" value={formData.nivel} onChangeText={(value) => setFormData({ ...formData, nivel: value })} />
      <Input placeholder="Restrições" value={formData.restricoes} onChangeText={(value) => setFormData({ ...formData, restricoes: value })} />

      <Button onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : 'Gerar Treino'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});