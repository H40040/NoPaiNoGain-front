import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Text } from './Text';
import theme from '../theme';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: theme.colors.surface,
  backgroundGradientFrom: theme.colors.surface,
  backgroundGradientTo: theme.colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(244, 81, 30, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: theme.colors.primary,
  },
};

export default function ProgressCharts({ workoutData }) {
  const getLastNDays = (n) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    }
    return dates;
  };

  const getWorkoutCountsByDate = (days) => {
    const counts = new Array(days.length).fill(0);
    workoutData.forEach(workout => {
      if (workout.lastCompleted) {
        const completedDate = new Date(workout.lastCompleted)
          .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const index = days.indexOf(completedDate);
        if (index !== -1) {
          counts[index]++;
        }
      }
    });
    return counts;
  };

  const getWorkoutsByType = () => {
    const types = {};
    workoutData.forEach(workout => {
      const type = workout.type || 'Outros';
      types[type] = (types[type] || 0) + (workout.completedSessions || 0);
    });
    return {
      labels: Object.keys(types),
      data: Object.values(types),
    };
  };

  const last7Days = getLastNDays(7);
  const workoutCounts = getWorkoutCountsByDate(last7Days);
  const workoutTypes = getWorkoutsByType();

  const lineChartData = {
    labels: last7Days,
    datasets: [
      {
        data: workoutCounts,
        color: (opacity = 1) => `rgba(244, 81, 30, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: workoutTypes.labels,
    datasets: [
      {
        data: workoutTypes.data,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Treinos nos Últimos 7 Dias</Text>
        <LineChart
          data={lineChartData}
          width={screenWidth - theme.spacing.lg * 2}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Treinos por Tipo</Text>
        <BarChart
          data={barChartData}
          width={screenWidth - theme.spacing.lg * 2}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
  },
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  chartTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
});
