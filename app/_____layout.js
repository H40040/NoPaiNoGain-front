import React from 'react';
import { Stack } from 'expo-router';
import RegisterScreen from './(tabs)/RegisterScreen';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    </Stack>
  );
}