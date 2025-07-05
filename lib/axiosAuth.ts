// /lib/axios-auth.ts
import axios from 'axios';
import { useAuthStore } from './auth';

const axiosAuth = axios.create({
  // baseURL: 'http://192.168.165.62:8000/api/v1/',
  baseURL: 'http://127.0.0.1:8000/api/v1/',
  // baseURL: 'https://campussecuritybackend.onrender.com/api/v1/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR — attach access token
axiosAuth.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && !config.url?.includes('auth/login')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Flag to prevent multiple refreshes at once
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// RESPONSE INTERCEPTOR — handle 401 and refresh token
axiosAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore.getState();

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (!authStore.refreshToken) {
        authStore.logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosAuth(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/v1/token/refresh/', {
          // const res = await axios.post('http://127.0.0.1:8000/api/v1/token/refresh/', {
          refresh: authStore.refreshToken,
        });

        const newAccessToken = res.data.access;
        useAuthStore.getState().setAccessToken(newAccessToken); // Make sure you have this method
        axiosAuth.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return axiosAuth(originalRequest);
      } catch (err) {
        processQueue(err, null);
        authStore.logout();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosAuth;
