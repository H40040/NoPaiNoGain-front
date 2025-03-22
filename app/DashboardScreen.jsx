import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';
import axios from 'axios';
import config from '../config';
import Button from '../components/Button';
import Text from '../components/Text';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';

export default function DashboardScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.WORKOUTS.LIST}`);
      setWorkouts(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao buscar treinos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (id) => {
    Alert.alert('Confirmação', 'Tem certeza que deseja excluir este treino?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', onPress: async () => {
          try {
            await axios.delete(`${config.WORKOUTS.DELETE}/${id}`);
            setWorkouts(workouts.filter(workout => workout.id !== id));
            Alert.alert('Sucesso', 'Treino excluído com sucesso!');
          } catch (error) {
            Alert.alert('Erro', 'Falha ao excluir treino: ' + (error.response?.data?.message || error.message));
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Treinos Criados</Text>
      <Button onPress={fetchWorkouts} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : 'Atualizar Treinos'}
      </Button>
      {loading ? <ActivityIndicator size="large" color={theme.colors.primary} /> : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.workoutItem}>
              <Text style={styles.workoutText}>{item.name}</Text>
              <TouchableOpacity onPress={() => deleteWorkout(item.id)}>
                <Icon name="delete" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  workoutText: {
    fontSize: 16,
  },
});
