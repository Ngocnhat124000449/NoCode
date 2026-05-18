import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Request permission to receive push notifications.
 * Android 13+ requires runtime permission POST_NOTIFICATIONS.
 * Older Android grants implicitly; iOS goes through the messaging API.
 */
export async function requestPushPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      // @ts-ignore — POST_NOTIFICATIONS exists from API 33
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) return false;
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function getFcmToken(): Promise<string | null> {
  try {
    return await messaging().getToken();
  } catch {
    return null;
  }
}

export function onTokenRefresh(callback: (token: string) => void) {
  return messaging().onTokenRefresh(callback);
}

export function onForegroundMessage(
  callback: (msg: FirebaseMessagingTypes.RemoteMessage) => void,
) {
  return messaging().onMessage(callback);
}

/**
 * Subscribe device to a topic — used for community-wide alerts that don't
 * require knowing every individual token (server pushes to topic instead).
 */
export async function subscribeToTopic(topic: string): Promise<void> {
  await messaging().subscribeToTopic(topic);
}

export async function unsubscribeFromTopic(topic: string): Promise<void> {
  await messaging().unsubscribeFromTopic(topic);
}
