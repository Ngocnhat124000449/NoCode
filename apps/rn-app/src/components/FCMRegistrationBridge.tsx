import { useAuth } from '../context/AuthContext';
import { useFCMRegistration } from '../hooks/useFCMRegistration';

/**
 * Mount this somewhere inside <AuthProvider> to wire FCM token registration
 * to the auth lifecycle. The hook re-runs when the user logs in or out.
 */
export function FCMRegistrationBridge() {
  const { user } = useAuth();
  useFCMRegistration(Boolean(user));
  return null;
}
