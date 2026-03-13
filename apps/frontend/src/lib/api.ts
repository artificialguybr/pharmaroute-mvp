/**
 * Typed API client for PharmaRoute backend.
 * Attaches the Supabase JWT to every request automatically.
 *
 * Usage:
 *   import { api } from './api';
 *   const pharmacies = await api.pharmacies.list({ bbox: '...' });
 */

import { supabase } from './supabase';

// API_URL is intentionally empty — Vite proxies /api/* → http://localhost:4000
// This eliminates CORS in development. In production, set VITE_API_URL to your API domain.
const API_URL = import.meta.env.VITE_API_URL ?? '';


async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ————————————————————————————————————————
// Auth
// ————————————————————————————————————————
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'seller' | 'manager';
    user_metadata: { name: string; role: string };
  };
}

export interface UserResponse {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    name: string;
    role: string;
    region: string;
    avatar: string;
    phone: string;
  };
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    request<void>('/api/auth/logout', { method: 'POST' }),

  me: () => request<UserResponse>('/api/auth/me'),
};

// ————————————————————————————————————————
// Pharmacies
// ————————————————————————————————————————
export interface ApiPharmacy {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  region: string;
  notes: string;
  contact_person: string;
  status: 'needs_visit' | 'visited_recently' | 'scheduled';
  last_visit: string | null;
  created_at: string;
}

export const pharmaciesApi = {
  list: (params?: { bbox?: string; region?: string; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<ApiPharmacy[]>(`/api/pharmacies${qs ? `?${qs}` : ''}`);
  },

  create: (body: Omit<ApiPharmacy, 'id' | 'last_visit' | 'created_at' | 'status'>) =>
    request<ApiPharmacy>('/api/pharmacies', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: Partial<ApiPharmacy>) =>
    request<ApiPharmacy>(`/api/pharmacies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request<void>(`/api/pharmacies/${id}`, { method: 'DELETE' }),
};

// ————————————————————————————————————————
// Visits
// ————————————————————————————————————————
export interface ApiVisit {
  id: string;
  date: string;
  notes: string;
  status: 'completed' | 'issue' | 'rescheduled';
  products_presented?: string;
  next_steps?: string;
  seller?: { id: string; name: string; avatar: string };
}

export const visitsApi = {
  listByPharmacy: (pharmacyId: string) =>
    request<ApiVisit[]>(`/api/visits/pharmacy/${pharmacyId}`),

  create: (body: {
    pharmacy_id: string;
    notes: string;
    status?: 'completed' | 'issue' | 'rescheduled';
    products_presented?: string;
    next_steps?: string;
  }) =>
    request<ApiVisit>('/api/visits', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// ————————————————————————————————————————
// Schedules
// ————————————————————————————————————————
export interface ApiSchedule {
  id: string;
  date: string;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  seller?: { id: string; name: string; avatar: string; region: string };
  pharmacy?: { id: string; name: string; address: string; lat: number; lng: number; region: string };
}

export const schedulesApi = {
  list: (params?: { sellerId?: string; date?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<ApiSchedule[]>(`/api/schedules${qs ? `?${qs}` : ''}`);
  },

  create: (body: { seller_id: string; pharmacy_id: string; date: string; notes?: string }) =>
    request<ApiSchedule>('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: { status?: string; notes?: string; date?: string }) =>
    request<ApiSchedule>(`/api/schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request<void>(`/api/schedules/${id}`, { method: 'DELETE' }),
};

// ————————————————————————————————————————
// Sellers
// ————————————————————————————————————————
export interface SellerCreateResponse {
  user: { id: string; email: string };
  profile: { name: string; role: string };
  onboarding: string;
}

export interface SellerDashboardStats {
  completedVisits: number;
  pendingVisits: number;
  efficiency: number;
}

export type SellerWithStats = {
  id: string;
  name: string;
  email?: string | null;
  role: string;
  region: string | null;
  avatar: string | null;
  phone: string | null;
  territory?: {
    lat: number;
    lng: number;
    radius: number;
  };
} & SellerDashboardStats;

export const sellersApi = {
  list: () => request<SellerWithStats[]>('/api/sellers'),

  create: (body: { email: string; name: string; region: string; phone?: string }) =>
    request<SellerCreateResponse>('/api/sellers', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: { name?: string; region?: string; phone?: string }) =>
    request<SellerWithStats>(`/api/sellers/${id}`, { // Assuming update returns the updated seller with stats
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

// ————————————————————————————————————————
// Dashboard
// ————————————————————————————————————————
export interface DashboardStatsResponse {
  stats: {
    visitsToday: number;
    totalPharmacies: number;
    needsVisit: number;
    activeSellers: number;
  };
  performanceData: Array<{
    name: string;
    concluídas: number;
    pendentes: number;
  }>;
  recentActivity: Array<{
    id: string;
    date: string;
    status: 'completed' | 'issue' | 'rescheduled';
    notes?: string;
    seller?: {
      id: string;
      name: string;
      avatar?: string | null;
    } | null;
    pharmacy?: {
      id: string;
      name: string;
      address?: string;
      region?: string;
    } | null;
  }>;
}

export const dashboardApi = {
  stats: (period?: string) => {
    const qs = period ? `?period=${period}` : '';
    return request<DashboardStatsResponse>(`/api/dashboard/stats${qs}`);
  },
};

// Unified export
export const api = {
  auth: authApi,
  pharmacies: pharmaciesApi,
  visits: visitsApi,
  schedules: schedulesApi,
  sellers: sellersApi,
  dashboard: dashboardApi,
};
