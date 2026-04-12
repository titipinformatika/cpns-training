import axios from 'axios';

const api = axios.create({
  baseURL: '/api',                              // proxy Vite akan forward ke backend
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,                               // timeout 30 detik
});

// ===== REQUEST INTERCEPTOR =====
// Otomatis tambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR =====
// Otomatis handle error 401 (token expired) & refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,  // Jika sukses, langsung return
  async (error) => {
    const originalRequest = error.config;

    // Jika dapat error 401 dan belum pernah retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Jika sedang dalam proses refresh, antri request ini
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Tidak ada refresh token → langsung logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Panggil endpoint refresh token
        // PENTING: Gunakan axios biasa (bukan `api`), agar tidak kena interceptor lagi
        const res = await axios.post('/api/auth/refresh-token', {
          refreshToken: refreshToken
        });

        const newToken = res.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);  // Retry request yang gagal
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Jika error 429 (rate limit)
    if (error.response?.status === 429) {
      console.error('Rate limited:', error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default api;
