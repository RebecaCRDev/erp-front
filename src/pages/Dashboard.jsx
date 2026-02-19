import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando dashboard...</div>;
  if (!stats) return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Error cargando datos</div>;

  const cardStyle = (bg, border) => ({
    background: bg, borderLeft: '4px solid ' + border, borderRadius: '12px',
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px',
  });
  const numStyle = { fontSize: '28px', fontWeight: '700' };
  const labelStyle = { fontSize: '13px', color: '#666', fontWeight: '500' };
  const smallStyle = { fontSize: '12px', color: '#999' };

  const estadoColors = {
    pendiente: { bg: '#fff3e0', c: '#e65100' }, procesando: { bg: '#e3f2fd', c: '#1565c0' },
    enviado: { bg: '#e3f2fd', c: '#1565c0' }, recibido: { bg: '#e8f5e9', c: '#2e7d32' },
    entregado: { bg: '#e8f5e9', c: '#2e7d32' }, cancelado: { bg: '#ffebee', c: '#c62828' },
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
          Hola, {user?.nombre}
        </h1>
        <p style={{ fontSize: '14px', color: '#888' }}>Resumen general de CrudoEstudio</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={cardStyle('#f0faf7', '#2e7d6f')}>
          <span style={{ ...numStyle, color: '#2e7d6f' }}>{stats.ventas.ingresos.toFixed(2)} EUR</span>
          <span style={labelStyle}>Ventas totales</span>
          <span style={smallStyle}>{stats.ventas.total_pedidos} pedidos ({stats.ventas.pendientes} pendientes)</span>
        </div>
        <div style={cardStyle('#fef7f0', '#e65100')}>
          <span style={{ ...numStyle, color: '#e65100' }}>{stats.compras.gastos.toFixed(2)} EUR</span>
          <span style={labelStyle}>Compras totales</span>
          <span style={smallStyle}>{stats.compras.total_pedidos} pedidos ({stats.compras.pendientes} pendientes)</span>
        </div>
        <div style={cardStyle('#f0f4fe', '#1565c0')}>
          <span style={{ ...numStyle, color: '#1565c0' }}>{stats.pagos.cobrados.toFixed(2)} EUR</span>
          <span style={labelStyle}>Pagos cobrados</span>
          <span style={smallStyle}>{stats.pagos.pendientes.toFixed(2)} EUR pendientes</span>
        </div>
        <div style={cardStyle('#fef0f0', '#c62828')}>
          <span style={{ ...numStyle, color: stats.stock.alertas_bajo > 0 ? '#c62828' : '#2e7d32' }}>{stats.stock.alertas_bajo}</span>
          <span style={labelStyle}>Alertas de stock</span>
          <span style={smallStyle}>{stats.envios_pendientes} envios en curso</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Clientes', val: stats.resumen.clientes, icon: 'CL', path: '/clientes', color: '#2e7d6f' },
          { label: 'Proveedores', val: stats.resumen.proveedores, icon: 'PR', path: '/proveedores', color: '#7b1fa2' },
          { label: 'Productos', val: stats.resumen.productos, icon: 'PD', path: '/productos', color: '#1565c0' },
          { label: 'Stock produccion', val: stats.stock.produccion, icon: 'ST', path: '/inventario', color: '#e65100' },
        ].map(c => (
          <div key={c.label} onClick={() => navigate(c.path)} style={{
            background: 'white', borderRadius: '12px', padding: '20px', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: c.color }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: c.color }}>{c.val}</div>
              <div style={{ fontSize: '13px', color: '#888' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>Ultimos pedidos de cliente</h3>
            <button onClick={() => navigate('/pedidos-cliente')} style={{ fontSize: '12px', color: '#2e7d6f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Ver todos</button>
          </div>
          {stats.ultimos_pedidos_cliente.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No hay pedidos</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {stats.ultimos_pedidos_cliente.map(p => {
                  const ec = estadoColors[p.estado] || { bg: '#eee', c: '#333' };
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '12px 20px', fontSize: '13px', color: '#999' }}>#{p.id}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '500' }}>{p.cliente}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#2e7d6f' }}>{p.total} EUR</td>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#999' }}>{p.fecha}</td>
                      <td style={{ padding: '12px 20px' }}><span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: ec.bg, color: ec.c }}>{p.estado}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>Ultimos pedidos a proveedor</h3>
            <button onClick={() => navigate('/pedidos-proveedor')} style={{ fontSize: '12px', color: '#2e7d6f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Ver todos</button>
          </div>
          {stats.ultimos_pedidos_proveedor.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No hay pedidos</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {stats.ultimos_pedidos_proveedor.map(p => {
                  const ec = estadoColors[p.estado] || { bg: '#eee', c: '#333' };
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '12px 20px', fontSize: '13px', color: '#999' }}>#{p.id}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '500' }}>{p.proveedor}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#e65100' }}>{p.total} EUR</td>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#999' }}>{p.fecha}</td>
                      <td style={{ padding: '12px 20px' }}><span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: ec.bg, color: ec.c }}>{p.estado}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>Margen estimado</h3>
          <div style={{ fontSize: '32px', fontWeight: '700', color: (stats.ventas.ingresos - stats.compras.gastos) >= 0 ? '#2e7d32' : '#c62828' }}>
            {(stats.ventas.ingresos - stats.compras.gastos).toFixed(2)} EUR
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Ingresos - Gastos</div>
          <div style={{ marginTop: '12px', height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: stats.ventas.ingresos > 0 ? Math.min((stats.pagos.cobrados / stats.ventas.ingresos) * 100, 100) + '%' : '0%', background: 'linear-gradient(90deg, #2e7d6f, #3a9d8f)', borderRadius: '3px' }}></div>
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{stats.ventas.ingresos > 0 ? ((stats.pagos.cobrados / stats.ventas.ingresos) * 100).toFixed(0) : 0}% cobrado</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>Stock total</h3>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1565c0' }}>{stats.stock.recepcion}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Sin logo</div>
            </div>
            <div style={{ fontSize: '24px', color: '#ddd', alignSelf: 'center' }}>-&gt;</div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#2e7d6f' }}>{stats.stock.produccion}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Con logo</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>Actividad</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#555' }}>Pedidos cliente pend.</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: stats.ventas.pendientes > 0 ? '#e65100' : '#2e7d32' }}>{stats.ventas.pendientes}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#555' }}>Pedidos prov. pend.</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: stats.compras.pendientes > 0 ? '#e65100' : '#2e7d32' }}>{stats.compras.pendientes}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#555' }}>Envios en curso</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: stats.envios_pendientes > 0 ? '#1565c0' : '#2e7d32' }}>{stats.envios_pendientes}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#555' }}>Pagos pendientes</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: stats.pagos.pendientes > 0 ? '#e65100' : '#2e7d32' }}>{stats.pagos.pendientes.toFixed(2)} EUR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}