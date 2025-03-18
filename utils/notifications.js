import notifee, { TriggerType, RepeatFrequency, AndroidImportance, AndroidStyle, AndroidCategory, AndroidVisibility } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = '@fitness_app/notification_settings';

export const defaultNotificationSettings = {
  enabled: true,
  reminderTime: '09:00', // Default reminder time
  frequency: 'daily',
  daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
  sound: 'default',
  vibration: true,
  advanceNotice: 15, // minutes before workout to send reminder
};

export const NOTIFICATION_SOUNDS = [
  { id: 'default', name: 'Padrão' },
  { id: 'bell', name: 'Sino' },
  { id: 'chime', name: 'Carrilhão' },
  { id: 'alert', name: 'Alerta' },
  { id: 'whistle', name: 'Apito' },
];

export const VIBRATION_PATTERNS = {
  default: [300, 500],
  gentle: [200, 200, 200],
  intense: [500, 200, 500, 200, 500],
  none: [],
};

export async function requestNotificationPermission() {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus;
}

export async function createWorkoutReminder(workout, date, options = {}) {
  const settings = await getNotificationSettings();
  
  const channelId = await notifee.createChannel({
    id: 'workout_reminders',
    name: 'Lembretes de Treino',
    importance: AndroidImportance.HIGH,
    sound: settings.sound !== 'default' ? settings.sound : undefined,
    vibration: settings.vibration,
  });

  // Create a trigger for the main notification
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
  };

  // Create the notification
  await notifee.createTriggerNotification(
    {
      id: `workout-${workout.id}`,
      title: 'Hora do Treino! ',
      body: `Não esqueça do seu treino "${workout.name}" hoje!`,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        style: {
          type: AndroidStyle.BIGTEXT,
          text: `É hora do seu treino "${workout.name}"!\n\nPreparado para dar o seu melhor hoje?`,
        },
        largeIcon: options.icon || 'ic_workout',
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: 'Iniciar Treino',
            pressAction: {
              id: 'start_workout',
              launchActivity: 'default',
            },
          },
          {
            title: 'Adiar',
            pressAction: {
              id: 'snooze',
            },
          },
        ],
        vibrationPattern: settings.vibration ? VIBRATION_PATTERNS.default : undefined,
        category: AndroidCategory.WORKOUT,
        visibility: AndroidVisibility.PUBLIC,
      },
      data: {
        workoutId: workout.id,
        type: 'workout_reminder',
      },
    },
    trigger,
  );

  // If advance notice is enabled, create a pre-workout reminder
  if (settings.advanceNotice > 0) {
    const advanceDate = new Date(date.getTime() - (settings.advanceNotice * 60 * 1000));
    
    // Only create advance notice if it's in the future
    if (advanceDate > new Date()) {
      const advanceTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: advanceDate.getTime(),
      };

      await notifee.createTriggerNotification(
        {
          id: `pre-workout-${workout.id}`,
          title: 'Treino em breve! ',
          body: `Seu treino "${workout.name}" começa em ${settings.advanceNotice} minutos`,
          android: {
            channelId,
            importance: AndroidImportance.DEFAULT,
            pressAction: {
              id: 'default',
            },
            vibrationPattern: settings.vibration ? VIBRATION_PATTERNS.gentle : undefined,
          },
          data: {
            workoutId: workout.id,
            type: 'pre_workout_reminder',
          },
        },
        advanceTrigger,
      );
    }
  }
}

export async function createDailyReminder(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const settings = await getNotificationSettings();

  if (!settings.enabled) return;

  const channelId = await notifee.createChannel({
    id: 'daily_reminders',
    name: 'Lembretes Diários',
    importance: AndroidImportance.DEFAULT,
    sound: settings.sound !== 'default' ? settings.sound : undefined,
    vibration: settings.vibration,
  });

  // Remove existing daily reminders
  await cancelDailyReminders();

  // Create new triggers for each selected day of the week
  for (const dayOfWeek of settings.daysOfWeek) {
    const now = new Date();
    const nextDate = new Date();
    nextDate.setHours(hours, minutes, 0, 0);

    // Adjust to next occurrence of the day of week
    while (nextDate.getDay() !== dayOfWeek || nextDate < now) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: nextDate.getTime(),
      repeatFrequency: RepeatFrequency.WEEKLY,
    };

    await notifee.createTriggerNotification(
      {
        title: 'Lembrete de Treino ',
        body: 'Mantenha sua rotina! Que tal um treino hoje?',
        android: {
          channelId,
          importance: AndroidImportance.DEFAULT,
          style: {
            type: AndroidStyle.BIGTEXT,
            text: 'Mantenha sua rotina de exercícios! Um treino hoje vai te ajudar a alcançar seus objetivos de fitness mais rapidamente.',
          },
          largeIcon: 'ic_fitness',
          pressAction: {
            id: 'default',
          },
          actions: [
            {
              title: 'Ver Treinos',
              pressAction: {
                id: 'view_workouts',
                launchActivity: 'default',
              },
            },
          ],
          vibrationPattern: settings.vibration ? VIBRATION_PATTERNS.gentle : undefined,
          category: AndroidCategory.REMINDER,
        },
        data: {
          type: 'daily_reminder',
          dayOfWeek: dayOfWeek,
        },
      },
      trigger,
    );
  }
}

export async function createRestEndNotification() {
  const settings = await getNotificationSettings();
  
  const channelId = await notifee.createChannel({
    id: 'rest_timer',
    name: 'Temporizador de Descanso',
    importance: AndroidImportance.HIGH,
    sound: settings.sound !== 'default' ? settings.sound : undefined,
    vibration: settings.vibration,
  });

  await notifee.displayNotification({
    title: 'Descanso Concluído! ',
    body: 'Hora de continuar seu treino',
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      largeIcon: 'ic_timer',
      pressAction: {
        id: 'default',
      },
      vibrationPattern: settings.vibration ? VIBRATION_PATTERNS.intense : undefined,
      category: AndroidCategory.ALARM,
      visibility: AndroidVisibility.PUBLIC,
      lights: {
        color: '#FF0000',
        on: 500,
        off: 500,
      },
    },
  });
}

export async function cancelDailyReminders() {
  const notifications = await notifee.getTriggerNotificationIds();
  await Promise.all(notifications.map(id => notifee.cancelTriggerNotification(id)));
}

export async function cancelWorkoutReminder(workoutId) {
  await notifee.cancelTriggerNotification(`workout-${workoutId}`);
  await notifee.cancelTriggerNotification(`pre-workout-${workoutId}`);
}

export async function handleNotificationAction(notification, pressAction) {
  // Handle notification actions like snooze
  if (pressAction.id === 'snooze') {
    const { workoutId } = notification.data;
    if (workoutId) {
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 10);
      
      const workout = { id: workoutId, name: 'Treino Adiado' };
      await createWorkoutReminder(workout, snoozeTime, { icon: 'ic_snooze' });
    }
  }
}

export async function saveNotificationSettings(settings) {
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  if (settings.enabled) {
    await createDailyReminder(settings.reminderTime);
  } else {
    await cancelDailyReminders();
  }
}

export async function getNotificationSettings() {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : defaultNotificationSettings;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return defaultNotificationSettings;
  }
}

export async function updateNotificationTime(time) {
  const settings = await getNotificationSettings();
  settings.reminderTime = time;
  await saveNotificationSettings(settings);
}

export async function updateNotificationDays(days) {
  const settings = await getNotificationSettings();
  settings.daysOfWeek = days;
  await saveNotificationSettings(settings);
}

export async function toggleNotifications(enabled) {
  const settings = await getNotificationSettings();
  settings.enabled = enabled;
  await saveNotificationSettings(settings);
}

export async function updateNotificationSound(sound) {
  const settings = await getNotificationSettings();
  settings.sound = sound;
  await saveNotificationSettings(settings);
}

export async function toggleVibration(enabled) {
  const settings = await getNotificationSettings();
  settings.vibration = enabled;
  await saveNotificationSettings(settings);
}

export async function updateAdvanceNotice(minutes) {
  const settings = await getNotificationSettings();
  settings.advanceNotice = minutes;
  await saveNotificationSettings(settings);
}
