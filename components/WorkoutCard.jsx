import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Text from '../components/Text';
import theme from '../theme';

const WorkoutCard = ({ workout, selected, onPress, onLongPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{workout.name}</Text>
        {selected && <Icon name="check-circle" size={24} color={theme.colors.primary} />}
      </View>
      <Text style={styles.description}>{workout.description || 'Sem descrição.'}</Text>
      <View style={styles.details}>
        <Text style={styles.exercises}>{workout.exercises.length} Exercícios</Text>
        <Text style={styles.type}>{workout.type}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginVertical: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  exercises: {
    color: theme.colors.textSecondary,
  },
  type: {
    fontStyle: 'italic',
    color: theme.colors.primary,
  },
});

export default WorkoutCard;