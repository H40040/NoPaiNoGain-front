import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Button from './Button';
import theme from '../theme';

const GeneratedWorkoutForm = ({ workout, hasAnamnese, canGenerate, blockReason, onGenerateWorkout, onSaveWorkout }) => {
  if (!hasAnamnese) {
    return (
      <View style={styles.blockContainer}>
        <Text style={styles.blockText}>Para gerar treinos personalizados, complete sua anamnese.</Text>
      </View>
    );
  }

  if (!canGenerate) {
    return (
      <View style={styles.blockContainer}>
        <Text style={styles.blockText}>{blockReason}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Treino Gerado</Text>
      {workout ? (
        <>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          <Text style={styles.description}>{workout.description}</Text>
          <Button title="Salvar Treino" onPress={() => onSaveWorkout(workout)} />
        </>
      ) : (
        <Button title="Gerar Novo Treino" onPress={() => onGenerateWorkout()} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.text,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: theme.colors.primary,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  blockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  blockText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default GeneratedWorkoutForm;