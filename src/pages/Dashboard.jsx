import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState([]);
  const [prodsProv, setProdsProv] = useState([]);
  const [selectedProd, setSelectedProd] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
    api.get('/productos-proveedor/todos').then(r => setProdsProv(r.data)).catch(() => {});
    api.get('/dashboard/historico-precios').then(r => setHistorico(r.data)).catch(() => {});
  }, []);

  const fetchHistorico = (id) => {
    setSelectedProd(id);
    const params = id ? { id_producto_proveedor: id } : {};
    api.get('/dashboard/historico-precios', { params }).then(r => setHistorico(r.data)).catch(() => {});
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando dashboard...</div>;
  if (!stats) return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Error cargando datos</div>;

  const cardStyle = (bg, border) => ({ background: bg, borderLeft: '4px solid ' + border, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' });
  const numStyle = { fontSize: '28px', fontWeight: '700' };
  const labelStyle = { fontSize: '13px', color: '#666', fontWeight: '500' };
  const smallStyle = { fontSize: '12px', color: '#999' };
  const estadoColors = { pendiente: { bg: '#fff3e0', c: '#e65100' }, procesando: { bg: '#e3f2fd', c: '#1565c0' }, enviado: { bg: '#e3f2fd', c: '#1565c0' }, recibido: { bg: '#e8f5e9', c: '#2e7d32' }, entregado: { bg: '#e8f5e9', c: '#2e7d32' }, cancelado: { bg: '#ffebee', c: '#c62828' } };
  const beneficio = stats.facturas?.beneficio_bruto || 0;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>Hola, {user?.nombre}</h1>
        <p style={{ fontSize: '14px', color: '#888' }}>Resumen general de CrudoEstudio</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={cardStyle('#f0faf7', '#2e7d6f')}>
          <span style={{ ...numStyle, color: '#2e7d6f' }}>{(stats.facturas?.facturado_ventas || 0).toFixed(2)} EUR</span>
          <span style={labelStyle}>Facturado ventas</span>
          <span style={smallStyle}>{stats.facturas?.ventas_total || 0} facturas</span>
        </div>
        <div style={cardStyle('#fef7f0', '#e65100')}>
          <span style={{ ...numStyle, color: '#e65100' }}>{(stats.facturas?.facturado_compras || 0).toFixed(2)} EUR</span>
          <span style={labelStyle}>Facturado compras</span>
          <span style={smallStyle}>{stats.facturas?.compras_total || 0} facturas</span>
        </div>
        <div style={cardStyle(beneficio >= 0 ? '#f0faf7' : '#fef0f0', beneficio >= 0 ? '#2e7d32' : '#c62828')}>
          <span style={{ ...numStyle, color: beneficio >= 0 ? '#2e7d32' : '#c62828' }}>{beneficio.toFixed(2)} EUR</span>
          <span style={labelStyle}>Beneficio bruto</span>
          <span style={smallStyle}>Ventas - Compras</span>
        </div>
        <div style={cardStyle('#f3e5f5', '#7b1fa2')}>
          <span style={{ ...numStyle, color: '#7b1fa2' }}>{(stats.fabricacion?.coste || 0).toFixed(2)} EUR</span>
          <span style={labelStyle}>Coste fabricacion</span>
          <span style={smallStyle}>{stats.fabricacion?.total || 0} fabricaciones ({stats.fabricacion?.unidades || 0} uds)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Clientes', val: stats.resumen.clientes, icon: '\uD83D\uDC65', path: '/clientes', color: '#2e7d6f' },
          { label: 'Proveedores', val: stats.resumen.proveedores, icon: '\uD83C\uDFED', path: '/proveedores', color: '#7b1fa2' },
          { label: 'Productos', val: stats.resumen.productos, icon: '\uD83D\uDC55', path: '/productos', color: '#1565c0' },
          { label: 'Stock produccion', val: stats.stock.produccion, icon: '\uD83D\uDCE6', path: '/inventario', color: '#e65100' },
        ].map(c => (
          <div key={c.label} onClick={() => navigate(c.path)} style={{ background: 'white', borderRadius: '12px', padding: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '28px' }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: c.color }}>{c.val}</div>
              <div style={{ fontSize: '13px', color: '#888' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>Historico de precios de compra</h3>
            <select value={selectedProd} onChange={e => fetchHistorico(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}>
              <option value="">Todos los productos</option>
              {prodsProv.map(p => <option key={p.id_producto_proveedor} value={p.id_producto_proveedor}>{p.nombre}</option>)}
            </select>
          </div>
          <div style={{ padding: '16px 20px', maxHeight: '400px', overflowY: 'auto' }}>
            {historico.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No hay datos de compras aun</div>
            ) : historico.map((prod, pi) => (
              <div key={pi} style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: pi < historico.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>{prod.nombre}</div>
                <div style={{ display: 'flex', alignItems: 'end', gap: '12px' }}>
                  {prod.precios.map((p, i) => {
                    const prev = i > 0 ? prod.precios[i - 1].precio : null;
                    const diff = prev !== null ? p.precio - prev : 0;
                    const diffColor = diff > 0 ? '#c62828' : diff < 0 ? '#2e7d32' : '#888';
                    const arrow = diff > 0 ? '\u25B2' : diff < 0 ? '\u25BC' : '';
                    const precios = prod.precios.map(x => x.precio);
                    const maxP = Math.max(...precios);
                    const minP = Math.min(...precios);
                    const range = maxP - minP || 1;
                    const barH = prod.precios.length > 1 ? ((p.precio - minP) / range) * 40 + 20 : 40;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '80px', maxWidth: '120px' }}>
                        <div style={{ fontSize: '10px', color: '#999' }}>{p.fecha}</div>
                        <div style={{ width: '100%', height: barH + 'px', background: diff > 0 ? 'linear-gradient(180deg, #ef5350, #c62828)' : diff < 0 ? 'linear-gradient(180deg, #66bb6a, #2e7d32)' : 'linear-gradient(180deg, #2e7d6f, #3a9d8f)', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'white' }}>{p.precio.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: '9px', color: '#999' }}>{p.factura}</div>
                        {prev !== null && (
                          <div style={{ fontSize: '10px', fontWeight: '700', color: diffColor }}>
                            {arrow} {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>Stock total</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#1565c0' }}>{stats.stock.recepcion}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>Sin logo</div>
              </div>
              <div style={{ fontSize: '24px', color: '#ddd', alignSelf: 'center' }}>\u2192</div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#2e7d6f' }}>{stats.stock.produccion}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>Con logo</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>Actividad</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Alertas stock', val: stats.stock.alertas_bajo, warn: true },
                { label: 'Pedidos cli. pend.', val: stats.ventas.pendientes, warn: true },
                { label: 'Pedidos prov. pend.', val: stats.compras.pendientes, warn: true },
                { label: 'Envios en curso', val: stats.envios_pendientes, warn: false },
              ].map(a => (
                <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#555' }}>{a.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: a.warn && a.val > 0 ? '#e65100' : '#2e7d32' }}>{a.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>Pagos</h3>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#2e7d6f' }}>{stats.pagos.cobrados.toFixed(2)} EUR</div>
            <div style={{ fontSize: '12px', color: '#999' }}>cobrados</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#e65100', marginTop: '8px' }}>{stats.pagos.pendientes.toFixed(2)} EUR</div>
            <div style={{ fontSize: '12px', color: '#999' }}>pendientes</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>Ultimas fabricaciones</h3>
            <button onClick={() => navigate('/fabricaciones')} style={{ fontSize: '12px', color: '#7b1fa2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Ver todas</button>
          </div>
          {(stats.ultimas_fabricaciones || []).length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No hay fabricaciones</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
              {stats.ultimas_fabricaciones.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 20px', fontSize: '13px', color: '#999' }}>#{f.id}</td>
                  <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '500' }}>{f.producto}</td>
                  <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '600' }}>{f.cantidad} uds</td>
                  <td style={{ padding: '10px 8px', fontSize: '12px', color: '#7b1fa2', fontWeight: '600' }}>{f.coste.toFixed(2)} EUR</td>
                </tr>
              ))}
            </tbody></table>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>Pedidos cliente</h3>
            <button onClick={() => navigate('/pedidos-cliente')} style={{ fontSize: '12px', color: '#2e7d6f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Ver todos</button>
          </div>
          {stats.ultimos_pedidos_cliente.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No hay pedidos</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
              {stats.ultimos_pedidos_cliente.map(p => {
                const ec = estadoColors[p.estado] || { bg: '#eee', c: '#333' };
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 20px', fontSize: '13px', color: '#999' }}>#{p.id}</td>
                    <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '500' }}>{p.cliente}</td>
                    <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '600', color: '#2e7d6f' }}>{p.total} EUR</td>
                    <td style={{ padding: '10px 8px' }}><span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', background: ec.bg, color: ec.c }}>{p.estado}</span></td>
                  </tr>
                );
              })}
            </tbody></table>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>Pedidos proveedor</h3>
            <button onClick={() => navigate('/pedidos-proveedor')} style={{ fontSize: '12px', color: '#2e7d6f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Ver todos</button>
          </div>
          {stats.ultimos_pedidos_proveedor.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No hay pedidos</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
              {stats.ultimos_pedidos_proveedor.map(p => {
                const ec = estadoColors[p.estado] || { bg: '#eee', c: '#333' };
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 20px', fontSize: '13px', color: '#999' }}>#{p.id}</td>
                    <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '500' }}>{p.proveedor}</td>
                    <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '600', color: '#e65100' }}>{p.total} EUR</td>
                    <td style={{ padding: '10px 8px' }}><span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', background: ec.bg, color: ec.c }}>{p.estado}</span></td>
                  </tr>
                );
              })}
            </tbody></table>
          )}
        </div>
      </div>
    </div>
  );
}
