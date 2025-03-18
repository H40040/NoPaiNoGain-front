import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import API_BASE_URL from '../config';
import { useRouter } from 'expo-router';

export default function AdminDashboardScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/workouts`);
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao buscar treinos');
    }
  };

  const deleteWorkout = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/workouts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setWorkouts(workouts.filter(workout => workout.id !== id));
        Alert.alert('Sucesso', 'Treino excluído!');
      } else {
        Alert.alert('Erro', 'Não foi possível excluir o treino');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir treino');
    }
  };

  const handleManageGenerationSettings = () => {
    router.push('/AdminWorkoutGenerationScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.workoutItem}>
            <Text>{item.name}</Text>
            <Button title="Excluir" onPress={() => deleteWorkout(item.id)} color="red" />
          </View>
        )}
      />
      <Button title="Logout" onPress={() => navigation.replace('AdminLogin')} />
      <Button title="Configurar Geração de Treinos" onPress={handleManageGenerationSettings} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  workoutItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
