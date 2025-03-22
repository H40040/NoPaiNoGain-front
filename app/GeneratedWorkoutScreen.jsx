import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';
import config from '../config';

const GeneratedWorkoutScreen = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await axios.get(`${config.WORKOUTS.LIST}`);
        setWorkouts(response.data);
      } catch (err) {
        setError('Failed to load workouts.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  return (
    <View>
      <Text>Generated Workouts</Text>
      {loading ? <ActivityIndicator size="large" color="#0000ff" /> : <FlatList data={workouts} keyExtractor={(item) => item.id} renderItem={({ item }) => <Text>{item.name}</Text>} />}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};

export default GeneratedWorkoutScreen;
