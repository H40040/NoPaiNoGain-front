import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Text from '../components/Text';
import Button from '../components/Button';
import Input from '../components/Input';
import { exerciseCategories } from '../data/exerciseLibrary';
import theme from '../theme';
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ExerciseSelector({ onSelect, onCancel }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(false);

  const filteredCategories = exerciseCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.exercises.some(exercise =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleConfirmSelection = async () => {
    if (selectedExercise) {
      setLoading(true);
      await onSelect(selectedExercise);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Buscar exercícios..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView style={styles.scrollView}>
        {filteredCategories.map((category) => (
          <View key={category.id}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            {category.exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.exerciseItem,
                  selectedExercise?.id === exercise.id && styles.selectedExerciseItem,
                ]}
                onPress={() => setSelectedExercise(exercise)}
              >
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                {selectedExercise?.id === exercise.id && <Icon name="check-circle" size={24} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleConfirmSelection} disabled={!selectedExercise || loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirmar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    color: theme.colors.textPrimary,
  },
  exerciseItem: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: theme.colors.textPrimary,
  },
});