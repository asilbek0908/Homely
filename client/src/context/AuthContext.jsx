import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount, validate existing token
  useEffect(() => {
    const validateToken = async () => {
      const saved = localStorage.getItem('token');
      if (!saved) { setLoading(false); return; }
      try {
        const data = await getMe();
        setUser(data.user);
        setToken(saved);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user.role;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user.role;
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
