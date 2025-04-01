import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearError } from '../store/slices/authSlice'; // Ensure correct import path
// ...other imports...

const RegisterScreen = () => {
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);

  useEffect(() => {
    if (error) {
      Alert.alert('Erro', error || 'Erro desconhecido.');
      dispatch(clearError()); // Correctly dispatch clearError
    }
  }, [error, dispatch]);

  // ...existing code...
};

export default RegisterScreen;