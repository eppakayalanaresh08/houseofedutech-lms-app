import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const returnReminderType = "return-reminder";

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
    const requested = await Notifications.requestPermissionsAsync();

    if (!requested.granted) {
      return false;
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}

export async function notifyBookmarkMilestone(totalBookmarks: number) {
  const granted = await configureNotifications();

  if (!granted || totalBookmarks < 5) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Bookmark milestone reached",
      body: `You now have ${totalBookmarks} saved courses ready for focused study time.`,
      data: {
        type: "bookmark-milestone",
        totalBookmarks,
      },
    },
    trigger: null,
  });
}

export async function scheduleReturnReminder() {
  const granted = await configureNotifications();

  if (!granted) {
    return false;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const existingReminder = scheduled.find(
    (item) => item.content.data?.type === returnReminderType,
  );

  if (existingReminder) {
    await Notifications.cancelScheduledNotificationAsync(
      existingReminder.identifier,
    ).catch(() => null);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your next lesson is waiting",
      body: "Come back to HouseofEdTech and keep learning with your saved courses.",
      data: {
        type: returnReminderType,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      // seconds: 60,
      seconds: 60 * 60 * 24,
    },
  });

  return true;
}
