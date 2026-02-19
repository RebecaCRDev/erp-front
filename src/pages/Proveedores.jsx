import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const initialForm = { nombre: '', email: '', telefono: '', estado: 'activo', direccion: { calle: '', numero: '', codigo_postal: '', ciudad: '', id_provincia: 1 } };

export default function Proveedores() {
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
  const [provincias, setProvincias] = useState([]);
  const [error, setError] = useState('');
  const isAdmin = user?.rol === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/proveedores/', { params: { page, per_page: 10, search } });
      setItems(res.data.data);
      setTotalPages(res.data.total_pages);
      setTotal(res.data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search]);
  useEffect(() => { api.get('/clientes/provincias/todas').then(r => setProvincias(r.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditing(null); setForm(initialForm); setError(''); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item.id_proveedor);
    setForm({
      nombre: item.nombre || '', email: item.email || '', telefono: item.telefono || '', estado: item.estado || 'activo',
      direccion: item.direccion ? { calle: item.direccion.calle || '', numero: item.direccion.numero || '', codigo_postal: item.direccion.codigo_postal || '', ciudad: item.direccion.ciudad || '', id_provincia: item.direccion.id_provincia || 1 } : { calle: '', numero: '', codigo_postal: '', ciudad: '', id_provincia: 1 },
    });
    setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    try {
      if (editing) { await api.put('/proveedores/' + editing, form); }
      else { await api.post('/proveedores/', form); }
      setShowModal(false); fetchData();
    } catch (err) { setError(err.response?.data?.detail || 'Error al guardar'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Seguro que quieres eliminar este proveedor?')) return;
    try { await api.delete('/proveedores/' + id); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Error al eliminar'); }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Proveedores</h1>
        <button onClick={openCreate} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>+ Nuevo Proveedor</button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <input type="text" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ ...inputStyle, maxWidth: '400px' }} />
      </div>
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' }}>
              {['ID', 'Nombre', 'Email', 'Telefono', 'Estado', 'Acciones'].map((h) => (
                <th key={h} style={{ padding: '14px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay proveedores</td></tr>
            ) : items.map((c, i) => (
              <tr key={c.id_proveedor} style={{ background: i % 2 === 0 ? '#fafafa' : 'white', borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.id_proveedor}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{c.nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>{c.email || '-'}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>{c.telefono || '-'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: c.estado === 'activo' ? '#e8f5e9' : '#ffebee', color: c.estado === 'activo' ? '#2e7d32' : '#c62828' }}>{c.estado}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(c)} style={{ padding: '6px 12px', background: '#e8f5e9', color: '#2e7d6f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                    {isAdmin && <button onClick={() => handleDelete(c.id_proveedor)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: '13px', color: '#999' }}>{total} proveedores en total</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px', cursor: page <= 1 ? 'not-allowed' : 'pointer', background: 'white', fontSize: '13px', opacity: page <= 1 ? 0.5 : 1 }}>Anterior</button>
            <span style={{ padding: '6px 14px', fontSize: '13px', color: '#666' }}>{page} / {totalPages || 1}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', background: 'white', fontSize: '13px', opacity: page >= totalPages ? 0.5 : 1 }}>Siguiente</button>
          </div>
        </div>
      </div>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#333', marginBottom: '24px' }}>{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
            {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Nombre *</label><input style={inputStyle} value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} /></div>
              <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Email</label><input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
              <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Telefono</label><input style={inputStyle} value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} /></div>
              <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Estado</label><select style={inputStyle} value={form.estado} onChange={(e) => setForm({...form, estado: e.target.value})}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
              <h3 style={{ fontSize: '16px', color: '#2e7d6f', marginTop: '8px' }}>Direccion</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Calle</label><input style={inputStyle} value={form.direccion.calle} onChange={(e) => setForm({...form, direccion: {...form.direccion, calle: e.target.value}})} /></div>
                <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Numero</label><input style={inputStyle} value={form.direccion.numero} onChange={(e) => setForm({...form, direccion: {...form.direccion, numero: e.target.value}})} /></div>
                <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Codigo Postal</label><input style={inputStyle} value={form.direccion.codigo_postal} onChange={(e) => setForm({...form, direccion: {...form.direccion, codigo_postal: e.target.value}})} /></div>
                <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Ciudad</label><input style={inputStyle} value={form.direccion.ciudad} onChange={(e) => setForm({...form, direccion: {...form.direccion, ciudad: e.target.value}})} /></div>
              </div>
              <div><label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Provincia</label><select style={inputStyle} value={form.direccion.id_provincia} onChange={(e) => setForm({...form, direccion: {...form.direccion, id_provincia: parseInt(e.target.value)}})}>{provincias.map((p) => (<option key={p.id_provincia} value={p.id_provincia}>{p.nombre}</option>))}</select></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '10px', background: 'white', color: '#666', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>{editing ? 'Guardar cambios' : 'Crear proveedor'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
