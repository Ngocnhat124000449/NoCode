import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface FcmMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * NotificationService — wraps firebase-admin SDK behind a thin API.
 *
 * Admin SDK is initialised lazily once we see a service account JSON in
 * env (FIREBASE_SERVICE_ACCOUNT). Until that env var is set on Vercel,
 * the service operates in NO-OP mode — calls succeed but log a warning.
 * This lets the rest of the app boot and run without Firebase configured.
 */
@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private admin: typeof import('firebase-admin') | null = null;
  private initialised = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const raw = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT');
    if (!raw) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled');
      return;
    }

    try {
      const credentials = JSON.parse(raw);
      const admin = await import('firebase-admin');
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
      }
      this.admin = admin;
      this.initialised = true;
      this.logger.log(`Firebase Admin initialised for project ${credentials.project_id}`);
    } catch (err) {
      this.logger.error(`Failed to initialise Firebase Admin: ${(err as Error).message}`);
    }
  }

  async registerDevice(
    userId: string,
    fcmToken: string,
    platform: 'android' | 'ios' = 'android',
    appVersion?: string,
  ) {
    // Upsert by fcmToken — if device existed under a different user, reassign.
    return this.prisma.device.upsert({
      where: { fcmToken },
      update: { userId, platform, appVersion, lastSeenAt: new Date() },
      create: { userId, fcmToken, platform, appVersion },
    });
  }

  async unregisterDevice(fcmToken: string) {
    return this.prisma.device
      .delete({ where: { fcmToken } })
      .catch(() => null);
  }

  /**
   * Send a notification to all devices owned by a user.
   * Stale tokens (FCM error UNREGISTERED) are cleaned from DB automatically.
   */
  async pushToUser(userId: string, message: FcmMessage): Promise<{ sent: number; cleaned: number }> {
    const devices = await this.prisma.device.findMany({ where: { userId } });
    if (devices.length === 0) return { sent: 0, cleaned: 0 };

    if (!this.initialised || !this.admin) {
      this.logger.warn(
        `[no-op] would push to ${devices.length} device(s) for user ${userId}: ${message.title}`,
      );
      return { sent: 0, cleaned: 0 };
    }

    const tokens = devices.map(d => d.fcmToken);
    const response = await this.admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title: message.title, body: message.body },
      data: message.data ?? {},
      android: {
        priority: 'high',
        notification: { channelId: 'scamshield-alerts' },
      },
    });

    // Clean up tokens that the FCM service says are no longer valid.
    const staleTokens: string[] = [];
    response.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error?.code ?? '';
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          staleTokens.push(tokens[i]);
        }
      }
    });

    if (staleTokens.length > 0) {
      await this.prisma.device.deleteMany({ where: { fcmToken: { in: staleTokens } } });
    }

    return { sent: response.successCount, cleaned: staleTokens.length };
  }

  /**
   * Send a community alert about a high-risk phone to all users.
   * Used by report-queue consumer when a phone crosses a report threshold.
   */
  async pushCommunityAlert(phoneHashSuffix: string, reportCount: number) {
    if (!this.initialised || !this.admin) {
      this.logger.warn(`[no-op] community alert — phone ${phoneHashSuffix}, ${reportCount} reports`);
      return;
    }
    // For now we topic-broadcast. Users subscribe to 'community-alerts' via FCM topic.
    await this.admin.messaging().send({
      topic: 'community-alerts',
      notification: {
        title: 'Cảnh báo cộng đồng',
        body: `Số có hash …${phoneHashSuffix} vừa được ${reportCount} người báo cáo`,
      },
      data: { type: 'community-alert', phoneHashSuffix, reportCount: String(reportCount) },
    });
  }
}
