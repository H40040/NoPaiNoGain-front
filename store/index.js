import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk'; // Import redux-thunk
import authReducer from './slices/authSlice';
import workoutReducer from './slices/workoutSlice';
import userGoalsReducer from './slices/userGoalsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    workouts: workoutReducer,
    userGoals: userGoalsReducer
    // ...other reducers
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk), // Add redux-thunk middleware
});

export default store;
