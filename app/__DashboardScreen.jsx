import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../theme';
import { storage } from '../utils/storage';
import { fetchWorkouts, fetchExecutionHistory } from '../store/slices/workoutSlice';

// Função auxiliar para feedback tátil com verificação de plataforma
const triggerHaptic = (type) => {
  if (Platform.OS !== 'web') {
    try {
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log('Haptics não disponível:', error);
    }
  }
};

export default function DashboardScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  
  // Verificar se o estado do Redux está inicializado
  useEffect(() => {
    // Tentar verificar a autenticação ao montar o componente
    const checkAuthentication = async () => {
      try {
        // Verificar se há dados de autenticação salvos
        const userData = await storage.getUserData();
        if (!userData || !userData.token) {
          console.log('Nenhum dado de usuário encontrado, redirecionando para login...');
          router.replace('/(tabs)/LoginScreen');
          return;
        }
        
        loading= false;
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.replace('/(tabs)/LoginScreen');
      }
    };
    
    checkAuthentication();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWorkouts());
      dispatch(fetchWorkoutExecutions());
    }
  }, [dispatch, isAuthenticated]);
  
  
  // Substituir seletores existentes por:
  const authState = useSelector((state) => ({
    user: state.auth?.user || null,
    isAuthenticated: state.auth?.isAuthenticated || false
  }));

// Acesso a propriedades com operador opcional:
  const userName = authState.user?.name || 'Visitante';
  
  // Garantir que user tenha um valor válido mesmo se authState.user for undefined
  const user = authState?.user || { name: 'Atleta' };
  const isAuthenticated = !!authState?.isAuthenticated;
  
  // Usar seletor seguro para o estado dos workouts
  const workoutsState = useSelector((state) => {
    // Verificar se state e state.workouts existem antes de acessar
    if (!state || !state.workouts) return { workouts: [], executionHistory: [], loading: false };
    return state.workouts;
  });
  
  // Garantir valores padrão para todas as propriedades
  const workouts = workoutsState?.workouts || [];
  const completedWorkouts = workoutsState?.executionHistory || [];
  const { loading } = useSelector(state => state.workouts);
  
  // Verificar o estado de autenticação e redirecionar se necessário
  useEffect(() => {
    console.log('Estado de autenticação:', { isAuthenticated, user });
    
    if (!isAuthenticated && !loading) {
      console.log('Usuário não autenticado, redirecionando para login...');
      // Usar setTimeout para evitar problemas de navegação durante a renderização
      setTimeout(() => {
        router.replace('/(tabs)/LoginScreen');
      }, 100);
    }
  }, [isAuthenticated, user, router, loading]);

  const [weeklyStats, setWeeklyStats] = useState({
    labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
  });

  const [workoutTypeStats, setWorkoutTypeStats] = useState({
    labels: ['Força', 'Cardio', 'Flexibilidade', 'Outros'],
    datasets: [{ data: [0, 0, 0, 0] }],
  });

  useEffect(() => {
    // Carregar treinos e treinos completados ao iniciar
    dispatch(fetchWorkouts());
    dispatch(fetchExecutionHistory());
  }, [dispatch]);

  useEffect(() => {
    if (completedWorkouts && completedWorkouts.length > 0) {
      calculateWeeklyStats();
      calculateWorkoutTypeStats();
    }
  }, [completedWorkouts, workouts]);

  const calculateWeeklyStats = () => {
    try {
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const dailyCounts = last7Days.map(date => {
        return completedWorkouts.filter(execution => 
          execution.endTime && execution.endTime.split('T')[0] === date
        ).length;
      });

      setWeeklyStats({
        labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        datasets: [{ data: dailyCounts }],
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas semanais:', error);
    }
  };

  const calculateWorkoutTypeStats = () => {
    try {
      const typeCount = {
        'Força': 0,
        'Cardio': 0,
        'Flexibilidade': 0,
        'Outros': 0
      };
      
      completedWorkouts.forEach(execution => {
        // Buscar o tipo do treino associado à execução
        const workout = workouts.find(w => w.id === execution.workoutId);
        const type = workout?.type || 'Outros';
        
        if (typeCount[type] !== undefined) {
          typeCount[type] += 1;
        } else {
          typeCount['Outros'] += 1;
        }
      });

      setWorkoutTypeStats({
        labels: Object.keys(typeCount),
        datasets: [{ data: Object.values(typeCount) }],
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas por tipo:', error);
    }
  };

  const calculateWorkoutStreak = () => {
    if (!completedWorkouts || completedWorkouts.length === 0) return 0;

    try {
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Ordenar execuções por data (mais recente primeiro)
      const sortedExecutions = [...completedWorkouts]
        .filter(e => e.endTime)
        .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

      for (let i = 0; i < 30; i++) { // Verificar até 30 dias atrás
        const dayExecutions = sortedExecutions.filter(execution => {
          const executionDate = new Date(execution.endTime);
          executionDate.setHours(0, 0, 0, 0);
          const checkDate = new Date(currentDate);
          checkDate.setDate(currentDate.getDate() - i);
          return executionDate.getTime() === checkDate.getTime();
        });

        if (dayExecutions.length > 0) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Erro ao calcular sequência:', error);
      return 0;
    }
  };

  const renderStatCard = (title, value, icon) => (
    <TouchableOpacity 
      style={styles.statCard}
      onPress={() => {
        triggerHaptic('light');
      }}
    >
      <MaterialCommunityIcons name={icon} size={28} color={theme.colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(244, 81, 30, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: () => theme.colors.text,
  };

  // Renderizar um indicador de carregamento enquanto verificamos a autenticação
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando seu dashboard...</Text>
        <Text style={styles.debugText}>Verificando autenticação...</Text>
      </View>
    );
  }
  
  // Renderizar uma mensagem de erro se não estiver autenticado
  if (!isAuthenticated) {
    console.log('Renderizando tela de não autenticado');
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Você não está autenticado</Text>
        <Text style={styles.debugText}>Estado de autenticação: {JSON.stringify({isAuthenticated, user: user ? 'presente' : 'ausente'})}</Text>
        <Button 
          title="Voltar para o Login" 
          onPress={() => {
            triggerHaptic('medium');
            router.replace('/(tabs)/LoginScreen');
          }} 
          style={{marginTop: 20}}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Olá, {user?.name || 'Atleta'}!</Text>
        <Text style={styles.subtitle}>Seu progresso esta semana</Text>
      </View>

      <View style={styles.statsContainer}>
        {renderStatCard(
          'Sequência',
          calculateWorkoutStreak(),
          'fire'
        )}
        {renderStatCard(
          'Total',
          completedWorkouts.length,
          'dumbbell'
        )}
        {renderStatCard(
          'Esta Semana',
          weeklyStats?.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0,
          'calendar-check'
        )}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Treinos nos Últimos 7 Dias</Text>
        <LineChart
          data={weeklyStats || { labels: [], datasets: [{ data: [] }] }}
          width={Dimensions.get('window').width - theme.spacing.lg * 2}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {workoutTypeStats?.labels?.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Treinos por Tipo</Text>
          <BarChart
            data={workoutTypeStats || { labels: [], datasets: [{ data: [] }] }}
            width={Dimensions.get('window').width - theme.spacing.lg * 2}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Iniciar Novo Treino"
          onPress={() => {
            triggerHaptic('medium');
            router.push('/WorkoutsScreen');
          }}
          style={styles.actionButton}
          icon="dumbbell"
        />
        <Button
          title="Ver Estatísticas"
          onPress={() => {
            triggerHaptic('light');
            router.push('/WorkoutStatsScreen');
          }}
          variant="secondary"
          style={styles.actionButton}
          icon="chart-line"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  debugText: {
    marginTop: 10,
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.error || '#FF5252',
    textAlign: 'center',
    marginBottom: 10,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  welcomeText: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.subtitle,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statValue: {
    ...theme.typography.title,
    fontSize: 24,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  statTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  chartContainer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  chartTitle: {
    ...theme.typography.heading,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chart: {
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
  },
  actions: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    marginBottom: theme.spacing.sm,
  },
});
