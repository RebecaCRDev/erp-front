import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '\uD83D\uDCCA', modulo: 'dashboard' },
  { path: '/clientes', label: 'Clientes', icon: '\uD83D\uDC65', modulo: 'clientes' },
  { path: '/proveedores', label: 'Proveedores', icon: '\uD83C\uDFED', modulo: 'proveedores' },
  { path: '/productos', label: 'Productos', icon: '\uD83D\uDC55', modulo: 'productos' },
  { path: '/productos-proveedor', label: 'Prod. Proveedor', icon: '\uD83D\uDCE6', modulo: 'productos_proveedor' },
  { path: '/pedidos-cliente', label: 'Pedidos Cliente', icon: '\uD83D\uDED2', modulo: 'pedidos_cliente' },
  { path: '/pedidos-proveedor', label: 'Pedidos Proveedor', icon: '\uD83D\uDCCB', modulo: 'pedidos_proveedor' },
  { path: '/facturas-venta', label: 'Facturas Venta', icon: '\uD83E\uDDFE', modulo: 'pedidos_cliente' },
  { path: '/facturas-compra', label: 'Facturas Compra', icon: '\uD83D\uDCC4', modulo: 'pedidos_proveedor' },
  { path: '/inventario', label: 'Inventario', icon: '\uD83D\uDCC8', modulo: 'inventario' },
  { path: '/transformaciones', label: 'Transformaciones', icon: '\uD83D\uDD04', modulo: 'inventario' },
  { path: '/envios', label: 'Envios', icon: '\uD83D\uDE9A', modulo: 'envios' },
  { path: '/pagos', label: 'Pagos', icon: '\uD83D\uDCB3', modulo: 'pagos' },
  { path: '/almacenes', label: 'Almacenes', icon: '\uD83C\uDFE2', modulo: 'almacenes' },
];

const adminItems = [
  { path: '/usuarios', label: 'Usuarios', icon: '\uD83D\uDD10', modulo: 'usuarios' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const getPermiso = (modulo) => {
    if (!user) return 'ninguno';
    if (user.rol === 'admin') return 'ver_editar';
    const p = user.permisos?.find(p => p.modulo === modulo);
    return p ? p.nivel : 'ninguno';
  };

  const visibleItems = menuItems.filter(item => getPermiso(item.modulo) !== 'ninguno');
  const allItems = user?.rol === 'admin' ? [...visibleItems, ...adminItems] : visibleItems;

  return (
    <div style={{
      width: '240px', minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8faf8 0%, #f0f5f0 100%)',
      borderRight: '1px solid #e0e8e0',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, zIndex: 100,
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #e0e8e0', textAlign: 'center' }}>
        <div style={{
          width: '50px', height: '50px', borderRadius: '50%',
          border: '2px solid #2e7d6f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 8px', fontSize: '20px', fontWeight: 'bold',
        }}>
          <span style={{ color: '#c4a97d' }}>C</span>
          <span style={{ color: '#2e7d6f' }}>E</span>
        </div>
        <div style={{ fontSize: '18px', fontWeight: '300' }}>
          <span style={{ color: '#c4a97d' }}>Crudo</span>
          <span style={{ color: '#2e7d6f' }}>Estudio</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {allItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 20px', margin: '2px 8px', borderRadius: '10px',
                cursor: 'pointer', fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? 'white' : '#555',
                background: isActive ? 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#e8f0e8'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #e0e8e0' }}>
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>{user?.nombre}</div>
        <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' }}>{user?.rol}</div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '10px', background: 'transparent',
          border: '1px solid #d32f2f', color: '#d32f2f', borderRadius: '8px',
          cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s',
        }}
          onMouseEnter={(e) => { e.target.style.background = '#d32f2f'; e.target.style.color = 'white'; }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#d32f2f'; }}
        >Cerrar sesion</button>
      </div>
    </div>
  );
}
