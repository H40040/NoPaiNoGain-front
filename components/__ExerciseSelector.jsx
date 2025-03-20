import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Text from './Text';
import Button from './Button';
import Input from './Input';
import { exerciseCategories } from '../data/exerciseLibrary';
import theme from '../theme';
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ExerciseSelector({ onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const filteredCategories = exerciseCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.exercises.some(exercise =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleConfirm = () => {
    if (selectedExercise) {
      onSelect(selectedExercise);
      onClose();
    }
  };

  const renderExerciseDetails = () => {
    if (!selectedExercise) return null;

    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{selectedExercise.name}</Text>
        <Text style={styles.detailsDescription}>{selectedExercise.description}</Text>
        
        <Text style={styles.sectionTitle}>Músculos Trabalhados</Text>
        <View style={styles.tagContainer}>
          {selectedExercise.muscles.map((muscle, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{muscle}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Instruções</Text>
        {selectedExercise.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>{index + 1}.</Text>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}

        {selectedExercise.tips && (
          <>
            <Text style={styles.sectionTitle}>Dicas</Text>
            {selectedExercise.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Icon name="lightbulb-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Biblioteca de Exercícios</Text>
        <Input
          placeholder="Buscar exercícios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.content}>
        <ScrollView style={styles.categoriesList}>
          {filteredCategories.map(category => (
            <View key={category.id} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              {category.exercises.map(exercise => (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseItem,
                    selectedExercise?.id === exercise.id && styles.exerciseItemSelected
                  ]}
                  onPress={() => handleSelectExercise(exercise)}
                >
                  <View>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDescription}>
                      {exercise.description}
                    </Text>
                  </View>
                  <View style={styles.exerciseMeta}>
                    <Text style={styles.exerciseDifficulty}>
                      {exercise.difficulty}
                    </Text>
                    <Icon
                      name={selectedExercise?.id === exercise.id ? 'check-circle' : 'chevron-right'}
                      size={24}
                      color={selectedExercise?.id === exercise.id ? theme.colors.primary : theme.colors.secondary}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>

        {selectedExercise && (
          <ScrollView style={styles.detailsSection}>
            {renderExerciseDetails()}
          </ScrollView>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={onClose}
          style={styles.footerButton}
        />
        <Button
          title="Confirmar"
          onPress={handleConfirm}
          disabled={!selectedExercise}
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
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    marginBottom: theme.spacing.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  categoriesList: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  categorySection: {
    marginBottom: theme.spacing.lg,
  },
  categoryTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  exerciseItemSelected: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  exerciseName: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
  },
  exerciseDescription: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  exerciseMeta: {
    alignItems: 'flex-end',
  },
  exerciseDifficulty: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  detailsSection: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  detailsContainer: {
    padding: theme.spacing.lg,
  },
  detailsTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  detailsDescription: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tag: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  instructionNumber: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    minWidth: 24,
  },
  instructionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});
