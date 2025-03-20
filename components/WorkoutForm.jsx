import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Button from './Button';
import Input from './Input';
import theme from '../theme';

const WorkoutForm = ({ workoutData = {}, onSave }) => {
  const [formData, setFormData] = useState({
    name: workoutData.name || '',
    description: workoutData.description || '',
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }
    onSave(formData);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar/Editar Treino</Text>
      <Input
        label="Nome do Treino"
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
      />
      <Input
        label="Descrição"
        value={formData.description}
        onChangeText={(text) => handleChange('description', text)}
        multiline
      />
      <Button title="Salvar Treino" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text,
    textAlign: 'center',
  },
});

export default WorkoutForm;
