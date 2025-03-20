import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';

const GoalItem = ({ goal, onPress, onDelete }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{goal.title}</Text>
        <Text style={styles.description}>{goal.description}</Text>
        <Text style={styles.status}>Status: {goal.status}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <MaterialCommunityIcons name="delete" size={24} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  deleteButton: {
    padding: 5,
  },
});

export default GoalItem;
