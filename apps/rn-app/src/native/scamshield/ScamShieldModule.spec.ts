jest.mock('react-native', () => ({
  NativeModules: {
    ScamShield: {
      getCallHistory:             jest.fn().mockResolvedValue([
        { id: '1', phone: '0901234567', date: '2026-05-15T07:00:00Z', duration: 120, type: 1, name: '' },
      ]),
      openCallScreeningSettings:  jest.fn().mockResolvedValue(true),
      openNotificationSettings:   jest.fn().mockResolvedValue(true),
      getAppVersion:              jest.fn().mockResolvedValue({ versionName: '1.0.0', versionCode: 1 }),
      dialPhone:                  jest.fn().mockResolvedValue(true),
    },
  },
  Platform: { OS: 'android' },
}));

import { ScamShieldModule } from './ScamShieldModule';

describe('ScamShieldModule', () => {
  it('getCallHistory returns call log entries', async () => {
    const entries = await ScamShieldModule.getCallHistory(10);
    expect(entries).toHaveLength(1);
    expect(entries[0].phone).toBe('0901234567');
    expect(entries[0].type).toBe(1);
  });

  it('openCallScreeningSettings resolves true', async () => {
    await expect(ScamShieldModule.openCallScreeningSettings()).resolves.toBe(true);
  });

  it('openNotificationSettings resolves true', async () => {
    await expect(ScamShieldModule.openNotificationSettings()).resolves.toBe(true);
  });

  it('getAppVersion returns version info', async () => {
    const ver = await ScamShieldModule.getAppVersion();
    expect(ver.versionName).toBe('1.0.0');
    expect(ver.versionCode).toBe(1);
  });

  it('dialPhone resolves true', async () => {
    await expect(ScamShieldModule.dialPhone('18005999920')).resolves.toBe(true);
  });
});
