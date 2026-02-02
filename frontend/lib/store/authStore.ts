import { create } from 'zustand';
import { User } from '../types';
import { apiClient } from '../api/client';

interface AuthState {
  user: (User & { relatedId?: number }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User & { relatedId?: number }, token: string) => void;
  logout: () => void;
  setUser: (user: User & { relatedId?: number }) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userType', user.userType || '');
    }
    apiClient.setToken(token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
    }
    apiClient.clearToken();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, isAuthenticated: true });
  },

  initialize: async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          apiClient.setToken(token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
}));

