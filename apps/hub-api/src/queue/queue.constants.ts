export const QUEUE_NAMES = {
  REPORT_PROCESSING: 'report-processing',
  RISK_SIGNAL_AGGREGATION: 'risk-signal-aggregation',
  NOTIFICATION_DISPATCH: 'notification-dispatch',
} as const;

export const JOB_NAMES = {
  PROCESS_SCAM_REPORT: 'process-scam-report',
  AGGREGATE_PHONE_SIGNALS: 'aggregate-phone-signals',
  SEND_BANK_ALERT: 'send-bank-alert',
} as const;
