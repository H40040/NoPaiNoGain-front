import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../theme';
import Button from '../components/Button';
import { fetchWorkouts, fetchCompletedWorkouts } from '../store/slices/workoutSlice';

const WorkoutStatsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const workouts = useSelector((state) => state.workouts?.workouts || []);
  const completedWorkouts = useSelector((state) => state.workouts?.completedWorkouts || []);
  const loading = useSelector((state) => state.workouts?.loading);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [workoutTypeStats, setWorkoutTypeStats] = useState([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    // Carregar treinos e treinos completados ao iniciar
    dispatch(fetchWorkouts());
    dispatch(fetchCompletedWorkouts());
  }, [dispatch]);

  useEffect(() => {
    if (completedWorkouts && completedWorkouts.length > 0) {
      calculateStats();
    }
  }, [completedWorkouts]);

  const calculateStats = () => {
    // Calcular total de treinos
    setTotalWorkouts(completedWorkouts.length);

    // Calcular estatísticas mensais (últimos 6 meses)
    const last6Months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('pt-BR', { month: 'short' });
      last6Months.push({
        month: monthName,
        count: 0,
      });
    }

    completedWorkouts.forEach(workout => {
      if (workout.completedAt) {
        const completedDate = new Date(workout.completedAt);
        const monthDiff = (today.getMonth() - completedDate.getMonth()) + 
                          (today.getFullYear() - completedDate.getFullYear()) * 12;
        
        if (monthDiff >= 0 && monthDiff < 6) {
          last6Months[5 - monthDiff].count += 1;
        }
      }
    });

    setMonthlyStats(last6Months);

    // Calcular estatísticas por tipo de treino
    const typeCount = {};
    completedWorkouts.forEach(workout => {
      const type = workout.type || 'Outro';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const typeStats = Object.keys(typeCount).map(type => ({
      type,
      count: typeCount[type],
    }));

    setWorkoutTypeStats(typeStats);

    // Calcular sequência atual e mais longa
    const sortedWorkouts = [...completedWorkouts].sort((a, b) => 
      new Date(b.completedAt) - new Date(a.completedAt)
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate = null;

    sortedWorkouts.forEach(workout => {
      if (!workout.completedAt) return;
      
      const completedDate = new Date(workout.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (!lastDate) {
        // Primeiro treino
        lastDate = completedDate;
        currentStreak = 1;
      } else {
        const diffDays = Math.floor((lastDate - completedDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Dias consecutivos
          currentStreak += 1;
        } else if (diffDays > 1) {
          // Quebra da sequência
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
          currentStreak = 1;
        }
        
        lastDate = completedDate;
      }
    });

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    setStreakData({ current: currentStreak, longest: longestStreak });
  };

  const renderMonthlyChart = () => {
    if (monthlyStats.length === 0) return null;

    const data = {
      labels: monthlyStats.map(stat => stat.month),
      datasets: [
        {
          data: monthlyStats.map(stat => stat.count),
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Treinos Concluídos"]
    };

    const chartConfig = {
      backgroundGradientFrom: theme.colors.surface,
      backgroundGradientTo: theme.colors.surface,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
      labelColor: (opacity = 1) => theme.colors.text,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: theme.colors.primary
      }
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Treinos Mensais</Text>
        <LineChart
          data={data}
          width={Dimensions.get("window").width - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
        />
      </View>
    );
  };

  const renderWorkoutTypeChart = () => {
    if (workoutTypeStats.length === 0) return null;

    const data = {
      labels: workoutTypeStats.map(stat => stat.type),
      datasets: [
        {
          data: workoutTypeStats.map(stat => stat.count)
        }
      ]
    };

    const chartConfig = {
      backgroundGradientFrom: theme.colors.surface,
      backgroundGradientTo: theme.colors.surface,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
      labelColor: (opacity = 1) => theme.colors.text,
      style: {
        borderRadius: 16
      },
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Treinos por Categoria</Text>
        <BarChart
          data={data}
          width={Dimensions.get("window").width - 32}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          verticalLabelRotation={30}
          withInnerLines={false}
        />
      </View>
    );
  };

  const renderSummaryStats = () => {
    return (
      <View style={styles.summaryContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="dumbbell" size={32} color={theme.colors.primary} />
          <Text style={styles.statValue}>{totalWorkouts}</Text>
          <Text style={styles.statLabel}>Total de Treinos</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="fire" size={32} color={theme.colors.primary} />
          <Text style={styles.statValue}>{streakData.current}</Text>
          <Text style={styles.statLabel}>Sequência Atual</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="trophy" size={32} color={theme.colors.primary} />
          <Text style={styles.statValue}>{streakData.longest}</Text>
          <Text style={styles.statLabel}>Maior Sequência</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Estatísticas de Treino</Text>
        
        {completedWorkouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={64} color={theme.colors.secondary} />
            <Text style={styles.emptyText}>
              Nenhum treino concluído ainda. Complete treinos para ver suas estatísticas.
            </Text>
          </View>
        ) : (
          <>
            {renderSummaryStats()}
            {renderMonthlyChart()}
            {renderWorkoutTypeChart()}
          </>
        )}
        
        <Button 
          title="Voltar para Dashboard" 
          onPress={() => router.push('/DashboardScreen')}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    ...theme.shadows.small,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.small,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  button: {
    marginTop: 24,
  }
});

export default WorkoutStatsScreen;
