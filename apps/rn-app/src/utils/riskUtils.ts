import { AppTheme } from '../theme/theme';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export function getRiskFromScore(score: number): RiskLevel {
  if (score < 30) return 'low';
  if (score < 55) return 'medium';
  if (score < 80) return 'high';
  return 'critical';
}

export function getRiskLabel(level: RiskLevel): string {
  return { low: 'Thấp', medium: 'Trung bình', high: 'Cao', critical: 'Nguy hiểm' }[level];
}

export function getRiskColors(level: RiskLevel, theme: AppTheme) {
  const map = {
    low:      { color: theme.colors.riskLow,      bg: theme.colors.riskLowBg,      text: theme.colors.riskLowText },
    medium:   { color: theme.colors.riskMedium,   bg: theme.colors.riskMediumBg,   text: theme.colors.riskMediumText },
    high:     { color: theme.colors.riskHigh,     bg: theme.colors.riskHighBg,     text: theme.colors.riskHighText },
    critical: { color: theme.colors.riskCritical, bg: theme.colors.riskCriticalBg, text: theme.colors.riskCriticalText },
  };
  return map[level];
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function isValidPhone(phone: string): boolean {
  return /^(0[3-9]\d{8})$/.test(phone.replace(/\s/g, ''));
}

// Returns E.164-like key for cache — strips spaces, converts 0xxx → +84xxx
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length === 11) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+84${digits.slice(1)}`;
  return `+${digits}`;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
