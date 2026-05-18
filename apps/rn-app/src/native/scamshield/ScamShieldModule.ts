import { NativeModules, Platform } from 'react-native';

export interface CallLogEntry {
  id: string;
  phone: string;
  date: string;       // ISO 8601
  duration: number;  // seconds
  type: number;       // 1=incoming, 2=outgoing, 3=missed
  name: string;
}

export interface AppVersion {
  versionName: string;
  versionCode: number;
}

interface ScamShieldNativeModule {
  getCallHistory(limit: number): Promise<CallLogEntry[]>;
  openCallScreeningSettings(): Promise<boolean>;
  openNotificationSettings(): Promise<boolean>;
  getAppVersion(): Promise<AppVersion>;
  dialPhone(phoneNumber: string): Promise<boolean>;
}

const LINKING_ERROR =
  'ScamShield native module is not linked. ' +
  'Rebuild the Android app: cd android && ./gradlew assembleDebug';

const Native = (() => {
  if (Platform.OS !== 'android') return null;
  const mod = NativeModules.ScamShield as ScamShieldNativeModule | undefined;
  if (!mod) throw new Error(LINKING_ERROR);
  return mod;
})();

function requireAndroid<T>(fn: () => Promise<T>): Promise<T> {
  if (Platform.OS !== 'android') {
    return Promise.reject(new Error('ScamShieldModule is Android-only'));
  }
  return fn();
}

export const ScamShieldModule = {
  getCallHistory(limit = 50): Promise<CallLogEntry[]> {
    return requireAndroid(() => Native!.getCallHistory(limit));
  },

  openCallScreeningSettings(): Promise<boolean> {
    return requireAndroid(() => Native!.openCallScreeningSettings());
  },

  openNotificationSettings(): Promise<boolean> {
    return requireAndroid(() => Native!.openNotificationSettings());
  },

  getAppVersion(): Promise<AppVersion> {
    return requireAndroid(() => Native!.getAppVersion());
  },

  dialPhone(phoneNumber: string): Promise<boolean> {
    return requireAndroid(() => Native!.dialPhone(phoneNumber));
  },
};
