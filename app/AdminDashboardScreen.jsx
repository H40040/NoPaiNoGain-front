import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import API_BASE_URL from '../config';
import Button from '../components/Button';
import Text from '../components/Text';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/workouts`);
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao buscar treinos');
    }
    setLoading(false);
  };

  const deleteWorkout = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/workouts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        Alert.alert('Sucesso', 'Treino excluído com sucesso!');
        fetchWorkouts();
      } else {
        Alert.alert('Erro', 'Não foi possível excluir o treino');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir treino');
    } finally {
      setLoading(false);
    }
  };

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Admin</Text>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteWorkout(item.id)}>
              <Icon name="delete" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Button onPress={() => router.push('/AdminWorkoutGenerationScreen')}>
        Configurações de Geração de Treinos
      </Button>

      <Button variant="outline" onPress={() => router.back()}>
        Sair
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
});
