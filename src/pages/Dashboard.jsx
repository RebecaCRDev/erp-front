import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function MiniLineChart({ precios, width = 400, height = 120 }) {
  if (!precios || precios.length < 1) return null;
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const values = precios.map(p => p.precio);
    const maxV = Math.max(...values) * 1.1;
    const minV = Math.min(...values) * 0.9;
    const range = maxV - minV || 1;
    const padL = 50, padR = 20, padT = 20, padB = 30;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    // Grid lines
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(width - padR, y); ctx.stroke();
      ctx.fillStyle = '#999'; ctx.font = '10px Arial'; ctx.textAlign = 'right';
      const val = maxV - (range / 4) * i;
      ctx.fillText(val.toFixed(2), padL - 6, y + 3);
    }

    // Points and line
    const points = values.map((v, i) => ({
      x: padL + (precios.length === 1 ? chartW / 2 : (i / (precios.length - 1)) * chartW),
      y: padT + ((maxV - v) / range) * chartH
    }));

    // Area fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => { if (i > 0) ctx.lineTo(p.x, p.y); });
    ctx.lineTo(points[points.length - 1].x, padT + chartH);
    ctx.lineTo(points[0].x, padT + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    grad.addColorStop(0, 'rgba(46,125,111,0.2)');
    grad.addColorStop(1, 'rgba(46,125,111,0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => { if (i > 0) ctx.lineTo(p.x, p.y); });
    ctx.strokeStyle = '#2e7d6f';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Points
    points.forEach((p, i) => {
      const prev = i > 0 ? values[i - 1] : values[i];
      const color = values[i] > prev ? '#c62828' : values[i] < prev ? '#2e7d32' : '#2e7d6f';
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'white'; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
    });

    // Labels
    ctx.font = '9px Arial'; ctx.textAlign = 'center';
    points.forEach((p, i) => {
      ctx.fillStyle = '#333'; ctx.font = 'bold 11px Arial';
      ctx.fillText(values[i].toFixed(2) + ' EUR', p.x, p.y - 10);
      ctx.fillStyle = '#999'; ctx.font = '9px Arial';
      ctx.fillText(precios[i].fecha, p.x, padT + chartH + 14);
    });

  }, [precios, width, height]);

  return <canvas ref={canvasRef} style={{ width: width + 'px', height: height + 'px' }} />;
}

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
          <span style={smallStyle}>{stats.fabricacion?.total || 0} fab. ({stats.fabricacion?.unidades || 0} uds)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Clientes', val: stats.resumen.clientes, icon: '\uD83D\uDC65', path: '/clientes', color: '#2e7d6f' },
          { label: 'Proveedores', val: stats.resumen.proveedores, icon: '\uD83C\uDFED', path: '/proveedores', color: '#7b1fa2' },
          { label: 'Productos', val: stats.resumen.productos, icon: '\uD83D\uDC55', path: '/productos', color: '#1565c0' },
          { label: 'Stock total', val: (stats.stock.produccion || 0) + (stats.stock.recepcion || 0), icon: '\uD83D\uDCE6', path: '/inventario', color: '#e65100' },
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

      {/* HISTORICO DE PRECIOS - ANCHO COMPLETO */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#333', margin: 0 }}>Historico de precios de compra</h3>
            <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0' }}>Evolucion de los precios de materia prima</p>
          </div>
          <select value={selectedProd} onChange={e => fetchHistorico(e.target.value)} style={{ padding: '8px 16px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }}>
            <option value="">Todos los productos</option>
            {prodsProv.map(p => <option key={p.id_producto_proveedor} value={p.id_producto_proveedor}>{p.nombre}</option>)}
          </select>
        </div>
        <div style={{ padding: '24px' }}>
          {historico.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No hay datos de compras aun</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: historico.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {historico.map((prod, pi) => {
                const precios = prod.precios;
                const ultimo = precios[precios.length - 1];
                const primero = precios[0];
                const diff = precios.length > 1 ? ultimo.precio - primero.precio : 0;
                const diffPct = primero.precio > 0 && precios.length > 1 ? ((diff / primero.precio) * 100).toFixed(1) : '0.0';
                return (
                  <div key={pi} style={{ background: '#fafafa', borderRadius: '12px', padding: '20px', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>{prod.nombre}</div>
                        <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{precios.length} compra(s) registrada(s)</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#2e7d6f' }}>{ultimo.precio.toFixed(2)} EUR</div>
                        {precios.length > 1 && (
                          <div style={{ fontSize: '12px', fontWeight: '700', color: diff > 0 ? '#c62828' : diff < 0 ? '#2e7d32' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <span>{diff > 0 ? '\u25B2' : diff < 0 ? '\u25BC' : '='}</span>
                            <span>{diff > 0 ? '+' : ''}{diff.toFixed(2)} EUR ({diffPct}%)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <MiniLineChart precios={precios} width={420} height={140} />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {precios.map((p, i) => (
                        <div key={i} style={{ padding: '4px 10px', background: 'white', borderRadius: '6px', border: '1px solid #e8e8e8', fontSize: '11px', color: '#666' }}>
                          <span style={{ fontWeight: '600', color: '#333' }}>{p.precio.toFixed(2)}</span> - {p.factura} ({p.fecha})
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FILA: Stock + Actividad + Pagos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
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

      {/* FILA: Ultimas fabricaciones + pedidos */}
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
