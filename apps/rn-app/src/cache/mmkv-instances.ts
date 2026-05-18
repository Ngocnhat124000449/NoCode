import { MMKV } from 'react-native-mmkv';

export const riskCache   = new MMKV({ id: 'risk-cache' });
export const configCache = new MMKV({ id: 'config-cache' });
