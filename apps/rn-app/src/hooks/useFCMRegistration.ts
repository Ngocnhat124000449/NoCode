import { useEffect } from 'react';
import { Platform } from 'react-native';
import {
  requestPushPermission,
  getFcmToken,
  onTokenRefresh,
  onForegroundMessage,
  subscribeToTopic,
} from '../services/fcm.service';
import { devicesApi } from '../api/apiClient';

/**
 * Wire up FCM for an authenticated user.
 *
 * - Requests permission once on first authed mount.
 * - Pushes the current FCM token to the backend.
 * - Re-pushes whenever Firebase rotates the token (rare but happens).
 * - Subscribes to the community-alerts topic so server can broadcast
 *   warnings without enumerating every device.
 * - Logs foreground messages — the OS handles display when the app
 *   is backgrounded.
 *
 * The hook is a no-op while `isAuthenticated === false` so we never send
 * a token before we have a valid user to associate it with.
 */
export function useFCMRegistration(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      const granted = await requestPushPermission();
      if (!granted || cancelled) return;

      const token = await getFcmToken();
      if (!token || cancelled) return;

      try {
        await devicesApi.register({
          fcmToken: token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        });
      } catch {
        // backend down, expired auth, etc. — caller will retry next session.
      }

      cleanups.push(
        onTokenRefresh(async newToken => {
          try {
            await devicesApi.register({
              fcmToken: newToken,
              platform: Platform.OS === 'ios' ? 'ios' : 'android',
            });
          } catch { /* swallow */ }
        }),
      );

      try {
        await subscribeToTopic('community-alerts');
      } catch { /* topic subscribe is best-effort */ }

      cleanups.push(
        onForegroundMessage(msg => {
          // eslint-disable-next-line no-console
          console.log('[FCM foreground]', msg.notification?.title, msg.notification?.body);
        }),
      );
    })();

    return () => {
      cancelled = true;
      cleanups.forEach(fn => fn());
    };
  }, [isAuthenticated]);
}
