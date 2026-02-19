import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TIPOS = ['manga_corta', 'manga_larga', 'tirantes', 'sudadera'];
const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const initialForm = { id_producto_proveedor: '', nombre: '', tipo_prenda: 'manga_corta', talla: 'M', color: '', precio_venta: '', descripcion: '', estado: 'activo' };

export default function Productos() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [prodsProv, setProdsProv] = useState([]);
  const [error, setError] = useState('');
  const isAdmin = user?.rol === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/productos/', { params: { page, per_page: 10, search } });
      setItems(res.data.data); setTotalPages(res.data.total_pages); setTotal(res.data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search]);
  useEffect(() => { api.get('/productos-proveedor/todos').then(r => setProdsProv(r.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditing(null); setForm(initialForm); setError(''); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item.id_producto);
    setForm({ id_producto_proveedor: item.id_producto_proveedor, nombre: item.nombre, tipo_prenda: item.tipo_prenda, talla: item.talla, color: item.color || '', precio_venta: item.precio_venta, descripcion: item.descripcion || '', estado: item.estado });
    setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.nombre.trim() || !form.id_producto_proveedor || !form.precio_venta) { setError('Nombre, producto base y precio son obligatorios'); return; }
    const payload = { ...form, precio_venta: parseFloat(form.precio_venta), id_producto_proveedor: parseInt(form.id_producto_proveedor) };
    try {
      if (editing) { await api.put('/productos/' + editing, payload); }
      else { await api.post('/productos/', payload); }
      setShowModal(false); fetchData();
    } catch (err) { setError(err.response?.data?.detail || 'Error al guardar'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Seguro?')) return;
    try { await api.delete('/productos/' + id); fetchData(); } catch (err) { alert(err.response?.data?.detail || 'Error'); }
  };

  const tipoLabel = (t) => t.replace('_', ' ').replace(/^\w/, c => c.toUpperCase());
  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Productos (con logo)</h1>
        <button onClick={openCreate} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>+ Nuevo</button>
      </div>
      <div style={{ marginBottom: '20px' }}><input type="text" placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ ...inputStyle, maxWidth: '400px' }} /></div>
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' }}>
            {['ID', 'Nombre', 'Tipo', 'Talla', 'Color', 'Precio Venta', 'Producto Base', 'Estado', 'Acciones'].map(h => <th key={h} style={{ padding: '14px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</td></tr>
            : items.length === 0 ? <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay productos</td></tr>
            : items.map((c, i) => (
              <tr key={c.id_producto} style={{ background: i % 2 === 0 ? '#fafafa' : 'white', borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.id_producto}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{c.nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{tipoLabel(c.tipo_prenda)}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.talla}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.color || '-'}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#2e7d6f' }}>{c.precio_venta} EUR</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.producto_proveedor?.nombre || '-'}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: c.estado === 'activo' ? '#e8f5e9' : '#ffebee', color: c.estado === 'activo' ? '#2e7d32' : '#c62828' }}>{c.estado}</span></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(c)} style={{ padding: '6px 12px', background: '#e8f5e9', color: '#2e7d6f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                    {isAdmin && <button onClick={() => handleDelete(c.id_producto)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: '13px', color: '#999' }}>{total} en total</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', fontSize: '13px', opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>Anterior</button>
            <span style={{ padding: '6px 14px', fontSize: '13px', color: '#666' }}>{page} / {totalPages || 1}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', fontSize: '13px', opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>Siguiente</button>
          </div>
        </div>
      </div>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#333', marginBottom: '24px' }}>{editing ? 'Editar' : 'Nuevo'} Producto</h2>
            {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Producto base (proveedor) *</label><select style={inputStyle} value={form.id_producto_proveedor} onChange={(e) => setForm({...form, id_producto_proveedor: e.target.value})}><option value="">Seleccionar...</option>{prodsProv.map(p => <option key={p.id_producto_proveedor} value={p.id_producto_proveedor}>{p.nombre} - {p.talla} - {p.precio_compra} EUR</option>)}</select></div>
              <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Nombre *</label><input style={inputStyle} value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Tipo prenda</label><select style={inputStyle} value={form.tipo_prenda} onChange={(e) => setForm({...form, tipo_prenda: e.target.value})}>{TIPOS.map(t => <option key={t} value={t}>{tipoLabel(t)}</option>)}</select></div>
                <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Talla</label><select style={inputStyle} value={form.talla} onChange={(e) => setForm({...form, talla: e.target.value})}>{TALLAS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Color</label><input style={inputStyle} value={form.color} onChange={(e) => setForm({...form, color: e.target.value})} /></div>
                <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Precio venta *</label><input style={inputStyle} type="number" step="0.01" value={form.precio_venta} onChange={(e) => setForm({...form, precio_venta: e.target.value})} /></div>
              </div>
              <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Descripcion</label><textarea style={{...inputStyle, minHeight: '60px'}} value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} /></div>
              <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Estado</label><select style={inputStyle} value={form.estado} onChange={(e) => setForm({...form, estado: e.target.value})}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '10px', background: 'white', color: '#666', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>{editing ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
