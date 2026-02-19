import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.access_token);
    const me = await api.get('/auth/me');
    setUser(me.data);
    localStorage.setItem('user', JSON.stringify(me.data));
    return me.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getPermiso = (modulo) => {
    if (!user) return 'ninguno';
    if (user.rol === 'admin') return 'ver_editar';
    const p = user.permisos?.find(p => p.modulo === modulo);
    return p ? p.nivel : 'ninguno';
  };

  const canView = (modulo) => getPermiso(modulo) !== 'ninguno';
  const canEdit = (modulo) => getPermiso(modulo) === 'ver_editar';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getPermiso, canView, canEdit }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
