import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../theme';

export default function ProfileScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    fitnessGoal: ''
  });

  // Opções para os selects
  const ageOptions = Array.from({ length: 83 }, (_, i) => ({ 
    label: `${i + 18} anos`, 
    value: `${i + 18}` 
  }));

  const weightOptions = Array.from({ length: 151 }, (_, i) => ({ 
    label: `${i + 40} kg`, 
    value: `${i + 40}` 
  }));

  const heightOptions = Array.from({ length: 101 }, (_, i) => ({ 
    label: `${i + 140} cm`, 
    value: `${i + 140}` 
  }));

  const genderOptions = [
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Feminino', value: 'Feminino' },
    { label: 'Não binário', value: 'Não binário' },
    { label: 'Prefiro não especificar', value: 'Prefiro não especificar' }
  ];

  const fitnessGoalOptions = [
    { label: 'Perda de peso', value: 'Perda de peso' },
    { label: 'Hipertrofia', value: 'Hipertrofia' },
    { label: 'Resistência', value: 'Resistência' },
    { label: 'Saúde geral', value: 'Saúde geral' },
    { label: 'Definição muscular', value: 'Definição muscular' },
    { label: 'Reabilitação', value: 'Reabilitação' }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados do usuário
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
      
      // Carregar imagem de perfil
      const storedProfileImage = await AsyncStorage.getItem('profileImage');
      if (storedProfileImage) {
        setProfileImage(storedProfileImage);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setIsLoading(false);
      Alert.alert('Erro', 'Não foi possível carregar seus dados. Tente novamente.');
    }
  };

  const saveUserData = async () => {
    try {
      setIsLoading(true);
      
      // Validar nome e email
      if (!userData.name.trim()) {
        Alert.alert('Erro', 'Por favor, informe seu nome.');
        setIsLoading(false);
        return;
      }
      
      if (!userData.email.trim() || !userData.email.includes('@')) {
        Alert.alert('Erro', 'Por favor, informe um email válido.');
        setIsLoading(false);
        return;
      }
      
      // Salvar dados do usuário
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // Salvar imagem de perfil
      if (profileImage) {
        await AsyncStorage.setItem('profileImage', profileImage);
      }
      
      setIsLoading(false);
      Alert.alert('Sucesso', 'Seus dados foram salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      setIsLoading(false);
      Alert.alert('Erro', 'Não foi possível salvar seus dados. Tente novamente.');
    }
  };

  const handleInputChange = (field, value) => {
    setUserData({
      ...userData,
      [field]: value
    });
  };

  const pickImage = async () => {
    try {
      // Solicitar permissão para acessar a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }
      
      // Abrir o seletor de imagens
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Salvar a imagem em base64
        const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
    }
  };

  const removeProfileImage = () => {
    Alert.alert(
      'Remover foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            try {
              setProfileImage(null);
              await AsyncStorage.removeItem('profileImage');
            } catch (error) {
              console.error('Erro ao remover imagem:', error);
              Alert.alert('Erro', 'Não foi possível remover a imagem. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.push('/DashboardScreen')} style={styles.homeButton}>
              <MaterialCommunityIcons name="home" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Meu Perfil</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialCommunityIcons name="account" size={80} color={theme.colors.textSecondary} />
            </View>
          )}
          
          <View style={styles.imageActions}>
            <Button
              title="Alterar Foto"
              onPress={pickImage}
              icon="camera"
              variant="outline"
              style={styles.imageButton}
            />
            
            {profileImage && (
              <Button
                title="Remover"
                onPress={removeProfileImage}
                icon="delete"
                variant="danger"
                style={styles.imageButton}
              />
            )}
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          
          <Input
            label="Nome"
            value={userData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Seu nome completo"
          />
          
          <Input
            label="Email"
            value={userData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="seu@email.com"
            keyboardType="email-address"
          />
          
          <Text style={styles.sectionTitle}>Dados Físicos</Text>
          
          <Input
            label="Idade"
            value={userData.age}
            onChangeText={(value) => handleInputChange('age', value)}
            placeholder="Ex: 30"
            options={ageOptions}
            type="select"
          />
          
          <View style={styles.row}>
            <Input
              label="Peso (kg)"
              value={userData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              placeholder="Ex: 70"
              options={weightOptions}
              type="select"
              style={styles.halfInput}
            />
            
            <Input
              label="Altura (cm)"
              value={userData.height}
              onChangeText={(value) => handleInputChange('height', value)}
              placeholder="Ex: 175"
              options={heightOptions}
              type="select"
              style={styles.halfInput}
            />
          </View>
          
          <Input
            label="Gênero"
            value={userData.gender}
            onChangeText={(value) => handleInputChange('gender', value)}
            placeholder="Masculino, Feminino, Não binário, Prefiro não especificar"
            options={genderOptions}
            type="select"
          />
          
          <Input
            label="Objetivo Fitness"
            value={userData.fitnessGoal}
            onChangeText={(value) => handleInputChange('fitnessGoal', value)}
            placeholder="Ex: Perda de peso, Hipertrofia, etc."
            options={fitnessGoalOptions}
            type="select"
          />
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
          title="Salvar"
          onPress={saveUserData}
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
  },
  homeButton: {
    padding: theme.spacing.xs,
  },
  placeholder: {
    width: 24,
    height: 24,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  imageButton: {
    marginHorizontal: theme.spacing.sm,
  },
  formContainer: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
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
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
});
