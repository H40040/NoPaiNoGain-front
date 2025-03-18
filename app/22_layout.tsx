import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from '../store'; // Import your store
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (loaded) {
        try {
          // Adicionar um pequeno delay para garantir que tudo esteja carregado
          await new Promise(resolve => setTimeout(resolve, 100));
          // Esconder a SplashScreen quando os recursos estiverem carregados
          await SplashScreen.hideAsync();
          console.log('SplashScreen ocultada com sucesso');
        } catch (error) {
          console.warn('Erro ao esconder a SplashScreen:', error);
        }
      }
    };

    hideSplashScreen();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}> {/* Wrap Stack with Provider */}
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack 
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' }
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="RegisterScreen" options={{ title: 'Register', headerShown: false }}/>
          <Stack.Screen name="DashboardScreen" options={{ title: 'Dashboard', headerShown: false }}/>
          <Stack.Screen name="ProfileScreen" options={{ title: 'Profile', headerShown: false }}/>
          <Stack.Screen name="WorkoutsScreen" options={{ title: 'Workouts', headerShown: false }}/>
          <Stack.Screen name="WorkoutDetailsScreen" options={{ title: 'Workout Details', headerShown: false }}/>
          <Stack.Screen name="AdminDashboardScreen" options={{ title: 'Admin Dashboard', headerShown: false }}/>
          <Stack.Screen name="AdminWorkoutGenerationScreen" options={{ title: 'Admin Workout Generation', headerShown: false }}/>
          <Stack.Screen name="AnamneseFormScreen" options={{ title: 'Anamnese Form', headerShown: false }}/>
          <Stack.Screen name="GeneratedWorkoutScreen" options={{ title: 'Generated Workout', headerShown: false }}/>
          <Stack.Screen name="HelpScreen" options={{ title: 'Help', headerShown: false }}/>
          <Stack.Screen name="ManageWorkoutsScreen" options={{ title: 'Manage Workouts', headerShown: false }}/>
          <Stack.Screen name="WorkoutExecutionScreen" options={{ title: 'Workout Execution', headerShown: false }}/>
          <Stack.Screen name="WorkoutStatsScreen" options={{ title: 'Workout Stats', headerShown: false }}/>
          <Stack.Screen name="NotificationSettingsScreen" options={{ title: 'Notification Settings', headerShown: false }}/>
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}
