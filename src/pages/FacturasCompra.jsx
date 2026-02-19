import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function FacturasCompra() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [detalleFactura, setDetalleFactura] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [prodsProv, setProdsProv] = useState([]);
  const [form, setForm] = useState({ numero_factura_proveedor: '', id_proveedor: '', id_almacen: '', fecha_factura: new Date().toISOString().split('T')[0], lineas: [{ id_producto_proveedor: '', cantidad: 1, precio_compra: '' }] });
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({ id_proveedor: '', fecha_desde: '', fecha_hasta: '', numero_factura: '' });
  const isAdmin = user?.rol === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (filtros.id_proveedor) params.id_proveedor = filtros.id_proveedor;
      if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
      if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
      if (filtros.numero_factura) params.numero_factura = filtros.numero_factura;
      const r = await api.get('/facturas-compra/', { params });
      setItems(r.data.data);
      setTotalPages(r.data.total_pages);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, filtros]);
  useEffect(() => {
    api.get('/proveedores/', { params: { per_page: 100 } }).then(r => setProveedores(r.data.data)).catch(() => {});
    api.get('/almacenes/todos').then(r => setAlmacenes(r.data)).catch(() => {});
    api.get('/productos-proveedor/todos').then(r => setProdsProv(r.data)).catch(() => {});
  }, []);

  const addLine = () => setForm({...form, lineas: [...form.lineas, { id_producto_proveedor: '', cantidad: 1, precio_compra: '' }]});
  const removeLine = (i) => setForm({...form, lineas: form.lineas.filter((_, idx) => idx !== i)});
  const updateLine = (i, field, val) => { const l = [...form.lineas]; l[i][field] = val; setForm({...form, lineas: l}); };

  const calcTotal = () => form.lineas.reduce((sum, l) => sum + (parseFloat(l.cantidad || 0) * parseFloat(l.precio_compra || 0)), 0);

  const handleSave = async () => {
    setError('');
    if (!form.numero_factura_proveedor || !form.id_proveedor || !form.id_almacen) { setError('Completa numero factura, proveedor y almacen'); return; }
    if (form.lineas.length === 0) { setError('Agrega al menos una linea'); return; }
    for (const l of form.lineas) { if (!l.id_producto_proveedor || !l.cantidad || !l.precio_compra) { setError('Completa todos los campos de cada linea'); return; } }
    try {
      await api.post('/facturas-compra/', {
        numero_factura_proveedor: form.numero_factura_proveedor,
        id_proveedor: parseInt(form.id_proveedor),
        id_almacen: parseInt(form.id_almacen),
        fecha_factura: form.fecha_factura,
        lineas: form.lineas.map(l => ({ id_producto_proveedor: parseInt(l.id_producto_proveedor), cantidad: parseInt(l.cantidad), precio_compra: parseFloat(l.precio_compra) }))
      });
      setShowModal(false); fetchData();
    } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async (id) => { if (!confirm('Eliminar factura? Se revertira el stock.')) return; try { await api.delete('/facturas-compra/' + id); fetchData(); } catch (err) { alert(err.response?.data?.detail || 'Error'); } };

  const openDetalle = async (id) => {
    try { const r = await api.get('/facturas-compra/' + id); setDetalleFactura(r.data); setShowDetalle(true); }
    catch (err) { alert('Error cargando detalle'); }
  };

  const limpiarFiltros = () => { setFiltros({ id_proveedor: '', fecha_desde: '', fecha_hasta: '', numero_factura: '' }); setPage(1); };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Facturas de Compra</h1>
        <button onClick={() => { setForm({ numero_factura_proveedor: '', id_proveedor: '', id_almacen: '', fecha_factura: new Date().toISOString().split('T')[0], lineas: [{ id_producto_proveedor: '', cantidad: 1, precio_compra: '' }] }); setError(''); setShowModal(true); }} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>+ Nueva Factura</button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '150px' }}><label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Proveedor</label><select style={inputStyle} value={filtros.id_proveedor} onChange={e => { setFiltros({...filtros, id_proveedor: e.target.value}); setPage(1); }}><option value="">Todos</option>{proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}</select></div>
        <div style={{ flex: '1', minWidth: '150px' }}><label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Num. Factura</label><input style={inputStyle} value={filtros.numero_factura} onChange={e => { setFiltros({...filtros, numero_factura: e.target.value}); setPage(1); }} placeholder="Buscar..." /></div>
        <div style={{ minWidth: '140px' }}><label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Desde</label><input style={inputStyle} type="date" value={filtros.fecha_desde} onChange={e => { setFiltros({...filtros, fecha_desde: e.target.value}); setPage(1); }} /></div>
        <div style={{ minWidth: '140px' }}><label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Hasta</label><input style={inputStyle} type="date" value={filtros.fecha_hasta} onChange={e => { setFiltros({...filtros, fecha_hasta: e.target.value}); setPage(1); }} /></div>
        <button onClick={limpiarFiltros} style={{ padding: '10px 16px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#666' }}>Limpiar</button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' }}>
            {['ID', 'Num. Factura', 'Proveedor', 'Almacen', 'Fecha', 'Total', 'Acciones'].map(h => <th key={h} style={{ padding: '14px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</td></tr>
            : items.length === 0 ? <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay facturas</td></tr>
            : items.map((f, i) => (
              <tr key={f.id_factura_compra} style={{ background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                  <span onClick={() => openDetalle(f.id_factura_compra)} style={{ color: '#2e7d6f', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>#{f.id_factura_compra}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{f.numero_factura_proveedor}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{f.proveedor_nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{f.almacen_nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{f.fecha_factura}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#e65100' }}>{f.total.toFixed(2)} EUR</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openDetalle(f.id_factura_compra)} style={{ padding: '6px 12px', background: '#f3e5f5', color: '#7b1fa2', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Ver</button>
                    {isAdmin && <button onClick={() => handleDelete(f.id_factura_compra)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>}
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

      {showDetalle && detalleFactura && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowDetalle(false)}>
          <div style={{ background: 'white', borderRadius: '16px', width: '700px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #e65100, #ff8a50)', padding: '24px 32px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'white', fontSize: '22px', fontWeight: '700' }}>FACTURA COMPRA</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>ID Interno: #{detalleFactura.id_factura_compra}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>N. Factura: {detalleFactura.numero_factura_proveedor}</div>
              </div>
            </div>
            <div style={{ padding: '24px 32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div><div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Proveedor</div><div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>{detalleFactura.proveedor_nombre}</div></div>
                <div><div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Almacen</div><div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>{detalleFactura.almacen_nombre}</div></div>
                <div><div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Fecha</div><div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>{detalleFactura.fecha_factura}</div></div>
              </div>
              <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>Lineas de factura</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead><tr style={{ borderBottom: '2px solid #e65100' }}>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', color: '#888' }}>N.</th>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', color: '#888' }}>Producto</th>
                  <th style={{ padding: '8px 0', textAlign: 'center', fontSize: '12px', color: '#888' }}>Cant.</th>
                  <th style={{ padding: '8px 0', textAlign: 'right', fontSize: '12px', color: '#888' }}>Precio</th>
                  <th style={{ padding: '8px 0', textAlign: 'right', fontSize: '12px', color: '#888' }}>Importe</th>
                </tr></thead>
                <tbody>{detalleFactura.lineas.map(l => (
                  <tr key={l.id_linea} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 0', fontSize: '14px', color: '#999' }}>{l.numero_linea}</td>
                    <td style={{ padding: '10px 0', fontSize: '14px' }}>{l.producto_nombre}</td>
                    <td style={{ padding: '10px 0', fontSize: '14px', textAlign: 'center' }}>{l.cantidad}</td>
                    <td style={{ padding: '10px 0', fontSize: '14px', textAlign: 'right' }}>{l.precio_compra.toFixed(2)} EUR</td>
                    <td style={{ padding: '10px 0', fontSize: '14px', textAlign: 'right', fontWeight: '600' }}>{l.importe.toFixed(2)} EUR</td>
                  </tr>
                ))}</tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ padding: '16px 20px', background: '#fef7f0', borderRadius: '12px', border: '2px solid #e65100' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', fontSize: '20px', fontWeight: '700', color: '#e65100' }}><span>TOTAL</span><span>{detalleFactura.total.toFixed(2)} EUR</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={() => setShowDetalle(false)} style={{ padding: '10px 24px', background: '#e65100', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '650px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Nueva Factura de Compra</h2>
            {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Numero factura proveedor *</label><input style={inputStyle} value={form.numero_factura_proveedor} onChange={e => setForm({...form, numero_factura_proveedor: e.target.value})} placeholder="Ej: FAC-2026-001" /></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Proveedor *</label><select style={inputStyle} value={form.id_proveedor} onChange={e => setForm({...form, id_proveedor: e.target.value})}><option value="">Seleccionar...</option>{proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}</select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Almacen destino *</label><select style={inputStyle} value={form.id_almacen} onChange={e => setForm({...form, id_almacen: e.target.value})}><option value="">Seleccionar...</option>{almacenes.map(a => <option key={a.id_almacen} value={a.id_almacen}>{a.nombre} ({a.tipo_almacen})</option>)}</select></div>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Fecha</label><input style={inputStyle} type="date" value={form.fecha_factura} onChange={e => setForm({...form, fecha_factura: e.target.value})} /></div>
              </div>
              <h3 style={{ fontSize: '16px', color: '#e65100', marginTop: '8px' }}>Lineas de factura</h3>
              {form.lineas.map((l, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                  <div><label style={{ fontSize: '12px', color: '#666' }}>Producto</label><select style={inputStyle} value={l.id_producto_proveedor} onChange={e => updateLine(i, 'id_producto_proveedor', e.target.value)}><option value="">Seleccionar...</option>{prodsProv.map(p => <option key={p.id_producto_proveedor} value={p.id_producto_proveedor}>{p.nombre} - {p.talla}</option>)}</select></div>
                  <div><label style={{ fontSize: '12px', color: '#666' }}>Cant.</label><input style={inputStyle} type="number" min="1" value={l.cantidad} onChange={e => updateLine(i, 'cantidad', e.target.value)} /></div>
                  <div><label style={{ fontSize: '12px', color: '#666' }}>Precio</label><input style={inputStyle} type="number" step="0.01" value={l.precio_compra} onChange={e => updateLine(i, 'precio_compra', e.target.value)} /></div>
                  <button onClick={() => removeLine(i)} style={{ padding: '10px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>X</button>
                </div>
              ))}
              <button onClick={addLine} style={{ padding: '8px', background: '#f0f0f0', border: '1px dashed #ccc', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#666' }}>+ Agregar linea</button>
              <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: '700', color: '#e65100', padding: '12px 0', borderTop: '2px solid #f0f0f0' }}>Total: {calcTotal().toFixed(2)} EUR</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '10px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #e65100, #ff8a50)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Crear Factura</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}