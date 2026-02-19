import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0faf4 0%, #e8f5e9 50%, #f5f5f0 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '3px solid #2e7d6f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#2e7d6f',
          }}>
            <span style={{ color: '#c4a97d' }}>C</span>
            <span style={{ color: '#2e7d6f' }}>E</span>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '300',
            margin: '0 0 4px 0',
            letterSpacing: '1px',
          }}>
            <span style={{ color: '#c4a97d' }}>Crudo</span>
            <span style={{ color: '#2e7d6f' }}>Estudio</span>
          </h1>
          <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px 0' }}>
            Sistema de gestion ERP
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2e7d6f'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <input
              type="password"
              placeholder="Contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2e7d6f'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {error && (
            <p style={{
              color: '#d32f2f',
              fontSize: '14px',
              margin: '0 0 16px 0',
              padding: '10px',
              background: '#ffeaea',
              borderRadius: '8px',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#a5d6c5' : 'linear-gradient(135deg, #2e7d6f, #3a9d8f)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '0.5px',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
