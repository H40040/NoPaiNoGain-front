import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import theme from '../theme';
import { createUserGoal } from '../store/slices/userGoalsSlice';

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

export default function CreateUserGoalScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.userGoals || {});
  
  // Estado para os campos do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'peso',
    targetValue: '',
    currentValue: '',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias a partir de hoje
    category: 'saúde',
    reminderFrequency: 'semanal'
  });
  
  // Estado para controlar a exibição do seletor de data
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Opções para os selects
  const typeOptions = [
    { label: 'Peso', value: 'peso' },
    { label: 'Medida', value: 'medida' },
    { label: 'Repetições', value: 'repeticoes' },
    { label: 'Distância', value: 'distancia' },
    { label: 'Tempo', value: 'tempo' },
    { label: 'Outro', value: 'outro' }
  ];
  
  const categoryOptions = [
    { label: 'Saúde', value: 'saúde' },
    { label: 'Fitness', value: 'fitness' },
    { label: 'Nutrição', value: 'nutrição' },
    { label: 'Bem-estar', value: 'bem-estar' },
    { label: 'Outro', value: 'outro' }
  ];
  
  const frequencyOptions = [
    { label: 'Diária', value: 'diária' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Quinzenal', value: 'quinzenal' },
    { label: 'Mensal', value: 'mensal' },
    { label: 'Nenhuma', value: 'nenhuma' }
  ];
  
  // Função para atualizar os campos do formulário
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Função para lidar com a mudança de data
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleChange('targetDate', selectedDate);
    }
  };
  
  // Formatar data para exibição
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Função para validar o formulário
  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'O título da meta é obrigatório');
      return false;
    }
    
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'A descrição da meta é obrigatória');
      return false;
    }
    
    if (formData.type !== 'outro' && (!formData.targetValue || isNaN(Number(formData.targetValue)))) {
      Alert.alert('Erro', 'O valor alvo deve ser um número válido');
      return false;
    }
    
    if (formData.type !== 'outro' && (!formData.currentValue || isNaN(Number(formData.currentValue)))) {
      Alert.alert('Erro', 'O valor atual deve ser um número válido');
      return false;
    }
    
    const today = new Date();
    if (formData.targetDate < today) {
      Alert.alert('Erro', 'A data alvo deve ser no futuro');
      return false;
    }
    
    return true;
  };
  
  // Função para enviar o formulário
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    triggerHaptic('light');
    
    try {
      // Preparar dados para envio
      const goalData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        targetValue: formData.type !== 'outro' ? Number(formData.targetValue) : undefined,
        currentValue: formData.type !== 'outro' ? Number(formData.currentValue) : undefined,
        targetDate: formData.targetDate.toISOString(),
        category: formData.category,
        reminderFrequency: formData.reminderFrequency,
        status: 'ativa'
      };
      
      // Despachar ação para criar meta
      const resultAction = await dispatch(createUserGoal(goalData)).unwrap();
      
      if (resultAction) {
        triggerHaptic('success');
        Alert.alert(
          'Sucesso',
          'Meta criada com sucesso!',
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
      Alert.alert('Erro', err.message || 'Não foi possível criar a meta. Tente novamente.');
    }
  };
  
  // Função para cancelar e voltar à tela anterior
  const handleCancel = () => {
    triggerHaptic('light');
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Nova Meta</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          
          <Input
            label="Título"
            placeholder="Ex: Perder peso"
            value={formData.title}
            onChangeText={(text) => handleChange('title', text)}
            required
          />
          
          <Input
            label="Descrição"
            placeholder="Ex: Quero perder 5kg até o final do mês"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            multiline
            numberOfLines={3}
            required
          />
          
          <Select
            label="Categoria"
            options={categoryOptions}
            selectedValue={formData.category}
            onValueChange={(value) => handleChange('category', value)}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Detalhes da Meta</Text>
          
          <Select
            label="Tipo de Meta"
            options={typeOptions}
            selectedValue={formData.type}
            onValueChange={(value) => handleChange('type', value)}
          />
          
          {formData.type !== 'outro' && (
            <>
              <Input
                label="Valor Atual"
                placeholder={formData.type === 'peso' ? "Ex: 80" : "Ex: 10"}
                value={formData.currentValue}
                onChangeText={(text) => handleChange('currentValue', text)}
                keyboardType="numeric"
                required
              />
              
              <Input
                label="Valor Alvo"
                placeholder={formData.type === 'peso' ? "Ex: 75" : "Ex: 20"}
                value={formData.targetValue}
                onChangeText={(text) => handleChange('targetValue', text)}
                keyboardType="numeric"
                required
              />
            </>
          )}
          
          <View style={styles.datePickerContainer}>
            <Text style={styles.inputLabel}>Data Alvo</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(formData.targetDate)}</Text>
              <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={formData.targetDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
          
          <Select
            label="Frequência de Lembretes"
            options={frequencyOptions}
            selectedValue={formData.reminderFrequency}
            onValueChange={(value) => handleChange('reminderFrequency', value)}
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
            title="Criar Meta" 
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
  formSection: {
    marginBottom: 24,
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 16,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.input,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text,
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
});