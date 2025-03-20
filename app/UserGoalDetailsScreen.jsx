import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const UserGoalDetailsScreen = ({ goalId }) => {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoalDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/goals/${goalId}`);
        setGoal(response.data);
      } catch (err) {
        setError('Failed to fetch goal details.');
      } finally {
        setLoading(false);
      }
    };
    fetchGoalDetails();
  }, [goalId]);

  return (
    <View>
      <Text>Goal Details</Text>
      {loading ? <ActivityIndicator size="large" color="#0000ff" /> : goal ? <Text>{goal.name}: {goal.description}</Text> : <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};

export default UserGoalDetailsScreen;