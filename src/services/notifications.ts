import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function configureNotifications() {
  const permission = await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function notifyBookmarkMilestone(totalBookmarks: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bookmark milestone reached',
      body: `You now have ${totalBookmarks} saved courses ready for focused study time.`,
    },
    trigger: null,
  });
}

export async function scheduleReturnReminder() {
  await Notifications.cancelScheduledNotificationAsync('return-reminder').catch(() => null);
  await Notifications.scheduleNotificationAsync({
    identifier: 'return-reminder',
    content: {
      title: 'Your next lesson is waiting',
      body: 'Come back to HouseofEdTech and keep your learning streak moving.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 24,
    },
  });
}
