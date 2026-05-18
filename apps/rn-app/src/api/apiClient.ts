import { configCache } from '../cache/mmkv-instances';

export const API_BASE = 'https://duan6-lemon.vercel.app';

const TOKEN_KEY = 'auth:token';

export const tokenStorage = {
  get: (): string | null => configCache.getString(TOKEN_KEY) ?? null,
  set: (token: string): void => { configCache.set(TOKEN_KEY, token); },
  clear: (): void => { configCache.delete(TOKEN_KEY); },
};

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json() as { message?: string };
      if (body.message) message = Array.isArray(body.message) ? body.message[0] : body.message;
    } catch { /* ignore */ }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export const authApi = {
  login: (phone: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),

  register: (name: string, phone: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, phone, password }),
    }),
};

export interface RiskLookupResponse {
  score: number;
  level: string;
  reasons: string[];
}

export const riskApi = {
  lookup: (phone: string) =>
    request<RiskLookupResponse>(`/risk/lookup?phone=${encodeURIComponent(phone)}`),
};

export interface CreateReportRequest {
  phone: string;
  scenarioType: string;
  description?: string;
}

export const reportApi = {
  create: (data: CreateReportRequest) =>
    request<{ id: string }>('/report', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export interface RegisterDeviceRequest {
  fcmToken: string;
  platform?: 'android' | 'ios';
  appVersion?: string;
}

export const devicesApi = {
  register: (data: RegisterDeviceRequest) =>
    request<{ id: string; lastSeenAt: string }>('/devices/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  unregister: (fcmToken: string) =>
    request<void>('/devices/register', {
      method: 'DELETE',
      body: JSON.stringify({ fcmToken }),
    }),
};
