import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f0' }}>
      <Sidebar />
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          padding: '16px 32px',
          background: 'white',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '16px',
        }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {user?.nombre}
          </span>
          <span style={{
            padding: '6px 14px',
            background: user?.rol === 'admin' ? '#2e7d6f' : '#3a9d8f',
            color: 'white',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
          }}>
            {user?.rol}
          </span>
        </header>
        <main style={{ flex: 1, padding: '24px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
