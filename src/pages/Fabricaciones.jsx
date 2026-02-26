import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Fabricaciones() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [escandallo, setEscandallo] = useState([]);
  const [form, setForm] = useState({ id_producto: '', id_almacen: '', cantidad: 1, fecha: new Date().toISOString().split('T')[0] });
  const [error, setError] = useState('');
  const isAdmin = user?.rol === 'admin';

  const fetchData = async () => { setLoading(true); try { const r = await api.get('/fabricaciones/', { params: { page, per_page: 10 } }); setItems(r.data.data); setTotalPages(r.data.total_pages); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => {
    api.get('/productos/', { params: { per_page: 100 } }).then(r => setProductos(r.data.data.filter(p => p.tipo_producto === 'compuesto'))).catch(() => {});
    api.get('/almacenes/todos').then(r => setAlmacenes(r.data)).catch(() => {});
  }, []);

  const handleSelectProducto = async (id) => {
    setForm({ ...form, id_producto: id });
    if (id) { try { const r = await api.get('/escandallos/producto/' + id); setEscandallo(r.data); } catch { setEscandallo([]); } }
    else { setEscandallo([]); }
  };

  const handleSave = async () => {
    setError('');
    if (!form.id_producto || !form.id_almacen || !form.cantidad) { setError('Completa todos los campos'); return; }
    if (escandallo.length === 0) { setError('Este producto no tiene escandallo definido'); return; }
    try {
      await api.post('/fabricaciones/', { id_producto: parseInt(form.id_producto), id_almacen: parseInt(form.id_almacen), cantidad: parseInt(form.cantidad), fecha: form.fecha });
      setShowModal(false); setEscandallo([]); fetchData();
    } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const openDetalle = async (id) => {
    try { const r = await api.get('/fabricaciones/' + id); setDetalle(r.data); setShowDetalle(true); }
    catch { alert('Error cargando detalle'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar fabricacion? Se revertira el stock.')) return;
    try { await api.delete('/fabricaciones/' + id); fetchData(); } catch (err) { alert(err.response?.data?.detail || 'Error'); }
  };

  const tipoLabels = { P: 'Producto', S: 'Servicio', R: 'Recurso' };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const costePrevisto = escandallo.reduce((sum, e) => sum + (e.precio_coste * e.cantidad * (parseInt(form.cantidad) || 0)), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Fabricacion</h1>
        <button onClick={() => { setForm({ id_producto: '', id_almacen: '', cantidad: 1, fecha: new Date().toISOString().split('T')[0] }); setEscandallo([]); setError(''); setShowModal(true); }} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>+ Nueva Fabricacion</button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' }}>
            {['ID', 'Producto', 'Empleado', 'Almacen', 'Cantidad', 'Fecha', 'Coste', 'Acciones'].map(h => <th key={h} style={{ padding: '14px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</td></tr>
            : items.length === 0 ? <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay fabricaciones</td></tr>
            : items.map((f, i) => (
              <tr key={f.id_fabricacion} style={{ background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '12px 16px' }}><span onClick={() => openDetalle(f.id_fabricacion)} style={{ color: '#2e7d6f', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>#{f.id_fabricacion}</span></td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{f.producto_nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{f.empleado_nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{f.almacen_nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600' }}>{f.cantidad} uds</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{f.fecha}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#e65100' }}>{f.coste_total.toFixed(2)} EUR</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openDetalle(f.id_fabricacion)} style={{ padding: '6px 12px', background: '#f3e5f5', color: '#7b1fa2', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Detalle</button>
                    {isAdmin && <button onClick={() => handleDelete(f.id_fabricacion)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', gap: '8px' }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', fontSize: '13px' }}>Anterior</button>
          <span style={{ padding: '6px 14px', fontSize: '13px' }}>{page}/{totalPages || 1}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', fontSize: '13px' }}>Siguiente</button>
        </div>
      </div>

      {/* DETALLE - INFORME DE COSTES */}
      {showDetalle && detalle && (() => {
        const componentes = detalle.componentes || [];
        const subtotalProductos = componentes.filter(c => c.tipo_componente === 'P').reduce((s, c) => s + (c.precio_coste * c.cantidad_total), 0);
        const subtotalServicios = componentes.filter(c => c.tipo_componente === 'S').reduce((s, c) => s + (c.precio_coste * c.cantidad_total), 0);
        const subtotalRecursos = componentes.filter(c => c.tipo_componente === 'R').reduce((s, c) => s + (c.precio_coste * c.cantidad_total), 0);
        const total = subtotalProductos + subtotalServicios + subtotalRecursos;
        const costePorUnidad = detalle.cantidad > 0 ? total / detalle.cantidad : 0;

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowDetalle(false)}>
            <div style={{ background: 'white', borderRadius: '20px', width: '700px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              
              {/* Cabecera tipo factura */}
              <div style={{ background: 'linear-gradient(135deg, #7b1fa2, #9c27b0)', padding: '28px 32px', borderRadius: '20px 20px 0 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' }}>Informe de Costes</div>
                    <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>FABRICACION #{detalle.id_fabricacion}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', textTransform: 'uppercase' }}>Fecha</div>
                    <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>{detalle.fecha}</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '28px 32px' }}>
                {/* Datos generales */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '28px', padding: '16px 20px', background: '#faf8fc', borderRadius: '12px', border: '1px solid #f0e6f6' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px', marginBottom: '4px' }}>Producto fabricado</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>{detalle.producto_nombre}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px', marginBottom: '4px' }}>Empleado</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>{detalle.empleado_nombre}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px', marginBottom: '4px' }}>Almacen</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>{detalle.almacen_nombre}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px', marginBottom: '4px' }}>Unidades fabricadas</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#7b1fa2' }}>{detalle.cantidad} uds</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px', marginBottom: '4px' }}>Coste por unidad</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#e65100' }}>{costePorUnidad.toFixed(2)} EUR</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px', marginBottom: '4px' }}>Coste total</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#c62828' }}>{total.toFixed(2)} EUR</div>
                  </div>
                </div>

                {/* Tabla de componentes */}
                <div style={{ fontSize: '12px', color: '#7b1fa2', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>Desglose de costes</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #7b1fa2' }}>
                      <th style={{ padding: '10px 0', textAlign: 'left', fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase' }}>Componente</th>
                      <th style={{ padding: '10px 0', textAlign: 'center', fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase' }}>Tipo</th>
                      <th style={{ padding: '10px 0', textAlign: 'center', fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase' }}>Cant/ud</th>
                      <th style={{ padding: '10px 0', textAlign: 'center', fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase' }}>Cant total</th>
                      <th style={{ padding: '10px 0', textAlign: 'right', fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase' }}>Precio ud</th>
                      <th style={{ padding: '10px 0', textAlign: 'right', fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase' }}>Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentes.map((c, i) => {
                      const importe = c.precio_coste * c.cantidad_total;
                      const tipoColor = c.tipo_componente === 'P' ? { bg: '#e3f2fd', c: '#1565c0' } : c.tipo_componente === 'S' ? { bg: '#fff3e0', c: '#e65100' } : { bg: '#f3e5f5', c: '#7b1fa2' };
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '12px 0', fontSize: '14px', fontWeight: '500' }}>{c.componente_nombre}</td>
                          <td style={{ padding: '12px 0', textAlign: 'center' }}><span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', background: tipoColor.bg, color: tipoColor.c }}>{tipoLabels[c.tipo_componente]}</span></td>
                          <td style={{ padding: '12px 0', textAlign: 'center', fontSize: '14px' }}>{c.cantidad_por_unidad}</td>
                          <td style={{ padding: '12px 0', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{c.cantidad_total}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px' }}>{c.precio_coste.toFixed(2)} EUR</td>
                          <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>{importe.toFixed(2)} EUR</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Subtotales */}
                <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '16px' }}>
                  {subtotalProductos > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                      <span style={{ color: '#666' }}>Subtotal materiales (P)</span>
                      <span style={{ fontWeight: '600' }}>{subtotalProductos.toFixed(2)} EUR</span>
                    </div>
                  )}
                  {subtotalServicios > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                      <span style={{ color: '#666' }}>Subtotal servicios (S)</span>
                      <span style={{ fontWeight: '600' }}>{subtotalServicios.toFixed(2)} EUR</span>
                    </div>
                  )}
                  {subtotalRecursos > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                      <span style={{ color: '#666' }}>Subtotal recursos (R)</span>
                      <span style={{ fontWeight: '600' }}>{subtotalRecursos.toFixed(2)} EUR</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', marginTop: '8px', background: '#7b1fa2', borderRadius: '10px' }}>
                    <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>TOTAL FABRICACION</span>
                    <span style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>{total.toFixed(2)} EUR</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', marginTop: '4px', background: '#f3e5f5', borderRadius: '8px' }}>
                    <span style={{ color: '#7b1fa2', fontSize: '13px', fontWeight: '600' }}>Coste unitario ({detalle.cantidad} uds)</span>
                    <span style={{ color: '#7b1fa2', fontSize: '15px', fontWeight: '700' }}>{costePorUnidad.toFixed(2)} EUR/ud</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button onClick={() => setShowDetalle(false)} style={{ padding: '10px 28px', background: 'linear-gradient(135deg, #7b1fa2, #9c27b0)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL CREAR */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '550px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Nueva Fabricacion</h2>
            {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Producto a fabricar *</label><select style={inputStyle} value={form.id_producto} onChange={e => handleSelectProducto(e.target.value)}><option value="">Seleccionar producto compuesto...</option>{productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre} - {p.talla}</option>)}</select></div>
              {escandallo.length > 0 && (
                <div style={{ background: '#f8f0ff', borderRadius: '10px', padding: '12px 16px', border: '1px solid #e1bee7' }}>
                  <div style={{ fontSize: '12px', color: '#7b1fa2', fontWeight: '600', marginBottom: '6px' }}>ESCANDALLO ({escandallo.length} componentes)</div>
                  {escandallo.map((e, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#555', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{e.componente_nombre}: {e.cantidad} x {parseInt(form.cantidad) || 0} = <strong>{(e.cantidad * (parseInt(form.cantidad) || 0)).toFixed(1)}</strong> uds</span>
                      <span style={{ color: '#7b1fa2', fontWeight: '600' }}>{(e.precio_coste * e.cantidad * (parseInt(form.cantidad) || 0)).toFixed(2)} EUR</span>
                    </div>
                  ))}
                  <div style={{ fontSize: '14px', color: '#e65100', fontWeight: '700', marginTop: '8px', borderTop: '1px solid #e1bee7', paddingTop: '8px', textAlign: 'right' }}>Coste estimado: {costePrevisto.toFixed(2)} EUR</div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Almacen *</label><select style={inputStyle} value={form.id_almacen} onChange={e => setForm({...form, id_almacen: e.target.value})}><option value="">Seleccionar...</option>{almacenes.map(a => <option key={a.id_almacen} value={a.id_almacen}>{a.nombre} ({a.tipo_almacen})</option>)}</select></div>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Cantidad a fabricar *</label><input style={inputStyle} type="number" min="1" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
              </div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Fecha</label><input style={inputStyle} type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '10px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #7b1fa2, #9c27b0)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Fabricar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
