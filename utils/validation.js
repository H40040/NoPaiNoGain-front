export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateName = (name) => {
  return name.length >= 2;
};

export const validateWorkout = (workout) => {
  const requiredFields = ['name', 'description', 'exercises'];
  return requiredFields.every(field => workout[field]);
};

export const validateExercise = (exercise) => {
  const requiredFields = ['name', 'sets', 'reps'];
  return requiredFields.every(field => exercise[field]);
};
