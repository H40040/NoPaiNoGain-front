import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const CreateUserGoalScreen = () => {
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateGoal = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/goals`, { goal, description });
      console.log('Goal created:', response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Create a New Goal</Text>
      <TextInput placeholder="Goal Title" value={goal} onChangeText={setGoal} />
      <TextInput placeholder="Goal Description" value={description} onChangeText={setDescription} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {loading ? <ActivityIndicator size="large" color="#0000ff" /> : <Button title="Create Goal" onPress={handleCreateGoal} disabled={loading} />}
    </View>
  );
};

export default CreateUserGoalScreen;