import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TIPOS = ['proveedor', 'recepcion', 'produccion'];
const initialForm = { nombre: '', tipo_almacen: 'recepcion', capacidad: 0 };

export default function Almacenes() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const isAdmin = user?.rol === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try { const res = await api.get('/almacenes/', { params: { page, per_page: 10 } }); setItems(res.data.data); setTotalPages(res.data.total_pages); setTotal(res.data.total); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(initialForm); setError(''); setShowModal(true); };
  const openEdit = (i) => { setEditing(i.id_almacen); setForm({ nombre: i.nombre, tipo_almacen: i.tipo_almacen, capacidad: i.capacidad }); setError(''); setShowModal(true); };
  const handleSave = async () => {
    if (!form.nombre.trim()) { setError('Nombre obligatorio'); return; }
    try { if (editing) { await api.put('/almacenes/' + editing, form); } else { await api.post('/almacenes/', form); } setShowModal(false); fetchData(); } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };
  const handleDelete = async (id) => { if (!confirm('Seguro?')) return; try { await api.delete('/almacenes/' + id); fetchData(); } catch (err) { alert(err.response?.data?.detail || 'Error'); } };

  const tipoColor = { proveedor: '#e3f2fd', recepcion: '#fff3e0', produccion: '#e8f5e9' };
  const tipoText = { proveedor: '#1565c0', recepcion: '#e65100', produccion: '#2e7d32' };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Almacenes</h1>
        <button onClick={openCreate} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>+ Nuevo</button>
      </div>
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' }}>
            {['ID', 'Nombre', 'Tipo', 'Capacidad', 'Acciones'].map(h => <th key={h} style={{ padding: '14px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</td></tr>
            : items.map((c, i) => (
              <tr key={c.id_almacen} style={{ background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.id_almacen}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{c.nombre}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: tipoColor[c.tipo_almacen], color: tipoText[c.tipo_almacen] }}>{c.tipo_almacen}</span></td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.capacidad}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(c)} style={{ padding: '6px 12px', background: '#e8f5e9', color: '#2e7d6f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                    {isAdmin && <button onClick={() => handleDelete(c.id_almacen)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: '13px', color: '#999' }}>{total} en total</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', fontSize: '13px', opacity: page <= 1 ? 0.5 : 1 }}>Anterior</button>
            <span style={{ padding: '6px 14px', fontSize: '13px', color: '#666' }}>{page}/{totalPages || 1}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', fontSize: '13px', opacity: page >= totalPages ? 0.5 : 1 }}>Siguiente</button>
          </div>
        </div>
      </div>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '420px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>{editing ? 'Editar' : 'Nuevo'} Almacen</h2>
            {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Nombre *</label><input style={inputStyle} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Tipo</label><select style={inputStyle} value={form.tipo_almacen} onChange={e => setForm({...form, tipo_almacen: e.target.value})}>{TIPOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Capacidad</label><input style={inputStyle} type="number" value={form.capacidad} onChange={e => setForm({...form, capacidad: parseInt(e.target.value) || 0})} /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '10px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>{editing ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
