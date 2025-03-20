import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const UpdateGoalProgressScreen = ({ goalId }) => {
  const [progress, setProgress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdateProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`${API_BASE_URL}/goals/${goalId}/progress`, { progress });
    } catch (err) {
      setError('Failed to update progress.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Update Goal Progress</Text>
      <TextInput placeholder="Progress" value={progress} onChangeText={setProgress} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {loading ? <ActivityIndicator size="large" color="#0000ff" /> : <Button title="Update Progress" onPress={handleUpdateProgress} disabled={loading} />}
    </View>
  );
};

export default UpdateGoalProgressScreen;