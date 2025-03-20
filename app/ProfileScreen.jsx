import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { updateUserProfile, fetchUserProfile } from '../store/slices/userSlice';
import { logoutUser } from '../store/slices/authSlice';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../theme';
import config from '../config';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.user);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) setProfileData(user);
  }, [user]);


  

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileData(prev => ({ ...prev, profileImage: result.uri }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${config.API_URL}/user/profile`, profileData);
      dispatch(updateUserProfile(profileData));
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setIsSaving(false);
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
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
      <Button onPress={handleImagePick}>Alterar Foto</Button>
      <Input label="Nome" value={profileData.name} onChangeText={(value) => handleChange('name', value)} />
      <Input label="Email" value={profileData.email} editable={false} />
      <Input label="Idade" value={profileData.age} onChangeText={(value) => handleChange('age', value)} keyboardType="numeric" />
      <Input label="Peso" value={profileData.weight} onChangeText={(value) => handleChange('weight', value)} keyboardType="numeric" />
      <Input label="Altura" value={profileData.height} onChangeText={(value) => handleChange('height', value)} keyboardType="numeric" />
      <Input label="Objetivo Fitness" value={profileData.fitnessGoal} onChangeText={(value) => handleChange('fitnessGoal', value)} />
      <Button onPress={handleSave} disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</Button>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};
