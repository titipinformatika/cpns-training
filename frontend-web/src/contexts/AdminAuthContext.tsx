import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import adminApi from '../api/adminAxios';

interface AdminUser {
  id: number;
  nama: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) {
      adminApi.get('/admin/auth/me')
        .then(res => setAdmin(res.data.data))
        .catch(() => {
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
          setAdmin(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await adminApi.post('/admin/auth/login', { email, password });
    const { admin: adminData, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('adminAccessToken', accessToken);
    localStorage.setItem('adminRefreshToken', refreshToken);
    setAdmin(adminData);
  }

  function logout() {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    setAdmin(null);
    window.location.href = '/admin/login';
  }

  return (
    <AdminAuthContext.Provider value={{
      admin,
      isAuthenticated: !!admin,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
