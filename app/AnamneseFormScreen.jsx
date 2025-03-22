import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { generateWorkout } from '../store/slices/workoutSlice';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import theme from '../theme';
import storage from '../utils/storage';
import config from '../config';

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
    try {
      const response = await axios.get(`${config.ANAMNESE.CHECK_STATUS}`);
      setFormData(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados da anamnese.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnamnese = async () => {
    setLoading(true);
    try {
      await axios.post(`${config.ANAMNESE.CREATE}`, formData);
      Alert.alert('Sucesso', 'Dados da anamnese salvos com sucesso!');
      dispatch(generateWorkout(formData));
      router.push('/GeneratedWorkoutScreen');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados da anamnese.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Input label="Nome" value={formData.nome} onChangeText={(text) => setFormData({ ...formData, nome: text })} />
      <Input label="Idade" value={formData.idade} onChangeText={(text) => setFormData({ ...formData, idade: text })} keyboardType="numeric" />
      <Input label="Peso (kg)" value={formData.peso} onChangeText={(text) => setFormData({ ...formData, peso: text })} keyboardType="numeric" />
      <Input label="Altura (cm)" value={formData.altura} onChangeText={(text) => setFormData({ ...formData, altura: text })} keyboardType="numeric" />
      <Input label="Gênero" value={formData.genero} onChangeText={(text) => setFormData({ ...formData, genero: text })} />
      <Input label="Objetivo" value={formData.objetivo} onChangeText={(text) => setFormData({ ...formData, objetivo: text })} />
      <Input label="Nível" value={formData.nivel} onChangeText={(text) => setFormData({ ...formData, nivel: text })} />
      <Input label="Restrições" value={formData.restricoes} onChangeText={(text) => setFormData({ ...formData, restricoes: text })} />
      <Button onPress={handleSaveAnamnese} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : 'Salvar e Gerar Treino'}</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
});
