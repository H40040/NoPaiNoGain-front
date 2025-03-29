// Atualizar config.js
//const API_BASE_URL = 'http://localhost:5000';
//const API_BASE_URL= "http://192.168.0.10:5000";
const API_BASE_URL= "http://10.0.0.109:5000";
//const API_BASE_URL= "http://127.0.0.1:5000";

const config = {
  API_BASE_URL: process.env.API_BASE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  AUTH_TOKEN_KEY: '@user_data',
  WORKOUT_STORAGE_KEY: '@workout_data',
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/login`,
    REGISTER: `${API_BASE_URL}/api/user/register`,
    PROFILE: `${API_BASE_URL}/api/user/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/user/change-password`,
    STATISTICS: `${API_BASE_URL}/api/user/statistics`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh-token`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  WORKOUTS: {
    LIST: `${API_BASE_URL}/api/workouts`,
    DETAILS: (id) => `${API_BASE_URL}/api/workouts/${id}`,
    CREATE: `${API_BASE_URL}/api/workouts`,
    UPDATE: (id) => `${API_BASE_URL}/api/workouts/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/workouts/${id}`,
    CLONAR: (id) => `${API_BASE_URL}/api/workouts/${id}/clone`,
    GERAR: `${API_BASE_URL}/api/workouts/generate-ai`,
    VERIFICAR_ELEGIBILIDADE_GERACAO: `${API_BASE_URL}/api/workouts/check-generation-eligibility`,
  },
  EXERCISES: {
    LIST: `${API_BASE_URL}/api/exercises`,
    DETAILS: (id) => `${API_BASE_URL}/api/exercises/${id}`,
    CREATE: `${API_BASE_URL}/api/exercises`,
    UPDATE: (id) => `${API_BASE_URL}/api/exercises/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/exercises/${id}`,
    POR_GRUPO_MUSCULAR: (group) => `${API_BASE_URL}/api/exercises/muscle-group/${group}`,
  },
  WORKOUT_EXECUTIONS: {
    START: `${API_BASE_URL}/api/workout-executions/start`,
    COMPLETE: (id) => `${API_BASE_URL}/api/workout-executions/${id}/complete`,
    HISTORY: `${API_BASE_URL}/api/workout-executions/history`,
    EXERCISE_RESULT: (id) => `${API_BASE_URL}/api/workout-executions/${id}/exercise-result`,
  },
  ANAMNESE: {
    GET: `${API_BASE_URL}/api/anamnese`,
    CREATE: `${API_BASE_URL}/api/anamnese`,
    UPDATE: `${API_BASE_URL}/api/anamnese`,
    CHECK_STATUS: `${API_BASE_URL}/api/anamnese/status`,
  },
  ADMIN: {
    USER_DETAILS: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
    STATISTICS: `${API_BASE_URL}/api/admin/statistics`,
    DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  },
  USER: {
    PROFILE: `${API_BASE_URL}/api/user/profile`,
    GOALS: `${API_BASE_URL}/api/user/goals`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/user/${id}`,
  },
  USER_GOALS: {
    LIST: `${API_BASE_URL}/api/user-goals`,
    DETAILS: (id) => `${API_BASE_URL}/api/user-goals/${id}`,
    CREATE: `${API_BASE_URL}/api/user-goals`,
    UPDATE: (id) => `${API_BASE_URL}/api/user-goals/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/user-goals/${id}`,
    UPDATE_PROGRESS: (id) => `${API_BASE_URL}/api/user-goals/${id}/progress`,
  }
};

export default config;