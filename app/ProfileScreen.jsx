import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile } from '../store/slices/userSlice';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../theme';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, loading } = useSelector(state => state.user);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    fitnessGoal: '',
    profileImage: null,
  });

  useEffect(() => {
    if (user) setProfileData(user);
  }, [user]);

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateUserProfile(profileData)).unwrap();
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao atualizar perfil.');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      handleChange('profileImage', `data:image/jpeg;base64,${result.assets[0].base64}`);
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
    <ScrollView style={{ padding: 20 }}>
      <Input label="Nome" value={profileData.name} onChangeText={(v) => handleChange('name', v)} />
      <Input label="Email" value={profileData.email} onChangeText={(v) => handleChange('email', v)} />
      <Input label="Idade" value={profileData.age} onChangeText={(v) => handleChange('age', v)} />
      <Input label="Peso" value={profileData.weight} onChangeText={(v) => handleChange('weight', v)} />
      <Input label="Altura" value={profileData.height} onChangeText={(v) => handleChange('height', v)} />
      <Input label="Gênero" value={profileData.gender} onChangeText={(v) => handleChange('gender', v)} />
      <Input label="Objetivo Fitness" value={profileData.fitnessGoal} onChangeText={(v) => handleChange('fitnessGoal', v)} />

      <Button onPress={pickImage} variant="outline">Selecionar Foto</Button>
      <Button onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : 'Salvar Perfil'}
      </Button>
      <Button variant="outline" onPress={() => router.back()}>
        Voltar
      </Button>
    </ScrollView>
  );
}