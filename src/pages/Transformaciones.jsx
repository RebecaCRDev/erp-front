import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Transformaciones() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [prodsProv, setProdsProv] = useState([]);
  const [prods, setProds] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [form, setForm] = useState({ id_producto_proveedor: '', id_producto: '', id_almacen_origen: '', id_almacen_destino: '', cantidad: '', fecha: new Date().toISOString().split('T')[0], notas: '' });
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try { const res = await api.get('/transformaciones/', { params: { page, per_page: 10 } }); setItems(res.data.data); setTotalPages(res.data.total_pages); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => {
    api.get('/productos-proveedor/todos').then(r => setProdsProv(r.data)).catch(() => {});
    api.get('/productos/', { params: { per_page: 100 } }).then(r => setProds(r.data.data)).catch(() => {});
    api.get('/almacenes/todos').then(r => setAlmacenes(r.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setError('');
    if (!form.id_producto_proveedor || !form.id_producto || !form.id_almacen_origen || !form.id_almacen_destino || !form.cantidad) { setError('Todos los campos son obligatorios'); return; }
    try {
      await api.post('/transformaciones/', { ...form, cantidad: parseInt(form.cantidad), id_producto_proveedor: parseInt(form.id_producto_proveedor), id_producto: parseInt(form.id_producto), id_almacen_origen: parseInt(form.id_almacen_origen), id_almacen_destino: parseInt(form.id_almacen_destino) });
      setShowModal(false); fetchData();
    } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const almRecepcion = almacenes.filter(a => a.tipo_almacen === 'recepcion');
  const almProduccion = almacenes.filter(a => a.tipo_almacen === 'produccion');
  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Transformaciones (Poner Logo)</h1>
        <button onClick={() => { setForm({ id_producto_proveedor: '', id_producto: '', id_almacen_origen: '', id_almacen_destino: '', cantidad: '', fecha: new Date().toISOString().split('T')[0], notas: '' }); setError(''); setShowModal(true); }} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>+ Nueva Transformacion</button>
      </div>
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' }}>
            {['ID', 'Producto Base', 'Producto Final', 'Origen', 'Destino', 'Cantidad', 'Fecha', 'Estado'].map(h => <th key={h} style={{ padding: '14px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</td></tr>
            : items.length === 0 ? <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay transformaciones</td></tr>
            : items.map((t, i) => (
              <tr key={t.id_transformacion} style={{ background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{t.id_transformacion}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{t.producto_proveedor_nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{t.producto_nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{t.almacen_origen_nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{t.almacen_destino_nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600' }}>{t.cantidad}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{t.fecha}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#e8f5e9', color: '#2e7d32' }}>{t.estado}</span></td>
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
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Nueva Transformacion</h2>
            {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Producto base (sin logo) *</label><select style={inputStyle} value={form.id_producto_proveedor} onChange={e => setForm({...form, id_producto_proveedor: e.target.value})}><option value="">Seleccionar...</option>{prodsProv.map(p => <option key={p.id_producto_proveedor} value={p.id_producto_proveedor}>{p.nombre} - {p.talla}</option>)}</select></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Producto final (con logo) *</label><select style={inputStyle} value={form.id_producto} onChange={e => setForm({...form, id_producto: e.target.value})}><option value="">Seleccionar...</option>{prods.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre} - {p.talla}</option>)}</select></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Almacen origen (recepcion) *</label><select style={inputStyle} value={form.id_almacen_origen} onChange={e => setForm({...form, id_almacen_origen: e.target.value})}><option value="">Seleccionar...</option>{almRecepcion.map(a => <option key={a.id_almacen} value={a.id_almacen}>{a.nombre}</option>)}</select></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Almacen destino (produccion) *</label><select style={inputStyle} value={form.id_almacen_destino} onChange={e => setForm({...form, id_almacen_destino: e.target.value})}><option value="">Seleccionar...</option>{almProduccion.map(a => <option key={a.id_almacen} value={a.id_almacen}>{a.nombre}</option>)}</select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Cantidad *</label><input style={inputStyle} type="number" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Fecha</label><input style={inputStyle} type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
              </div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Notas</label><textarea style={{...inputStyle, minHeight: '60px'}} value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '10px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Transformar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
