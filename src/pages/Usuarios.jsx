import { useState, useEffect } from 'react';
import api from '../api/axios';

const MODULOS = ['dashboard','clientes','proveedores','productos','productos_proveedor','pedidos_cliente','pedidos_proveedor','inventario','envios','pagos','almacenes','usuarios'];
const NIVELES = ['ninguno', 'ver', 'ver_editar'];

export default function Usuarios() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'usuario', permisos: MODULOS.map(m => ({ modulo: m, nivel: 'ver' })) });
  const [error, setError] = useState('');

  const fetchData = async () => { setLoading(true); try { const r = await api.get('/usuarios/', { params: { page, per_page: 10 } }); setItems(r.data.data); setTotalPages(r.data.total_pages); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [page]);

  const openCreate = () => { setEditing(null); setForm({ nombre: '', email: '', password: '', rol: 'usuario', permisos: MODULOS.map(m => ({ modulo: m, nivel: 'ver' })) }); setError(''); setShowModal(true); };
  const openEdit = (u) => {
    const permisos = MODULOS.map(m => { const found = u.permisos.find(p => p.modulo === m); return { modulo: m, nivel: found ? found.nivel : 'ninguno' }; });
    setEditing(u.id_usuario); setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol, permisos }); setError(''); setShowModal(true);
  };

  const updatePermiso = (modulo, nivel) => { setForm({...form, permisos: form.permisos.map(p => p.modulo === modulo ? {...p, nivel} : p)}); };

  const handleSave = async () => {
    setError('');
    if (!form.nombre || !form.email) { setError('Nombre y email obligatorios'); return; }
    if (!editing && !form.password) { setError('Contrasena obligatoria para nuevo usuario'); return; }
    try {
      const payload = { nombre: form.nombre, email: form.email, rol: form.rol, permisos: form.rol === 'usuario' ? form.permisos : undefined };
      if (form.password) payload.password = form.password;
      if (editing) { await api.put('/usuarios/' + editing, payload); }
      else { payload.password = form.password; await api.post('/usuarios/', payload); }
      setShowModal(false); fetchData();
    } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async (id) => { if (!confirm('Eliminar usuario?')) return; try { await api.delete('/usuarios/' + id); fetchData(); } catch (err) { alert(err.response?.data?.detail || 'Error'); } };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Usuarios</h1>
        <button onClick={openCreate} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>+ Nuevo Usuario</button>
      </div>
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' }}>
            {['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map(h => <th key={h} style={{ padding: '14px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</td></tr>
            : items.map((u, i) => (
              <tr key={u.id_usuario} style={{ background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{u.id_usuario}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{u.nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: u.rol === 'admin' ? '#e3f2fd' : '#f3e5f5', color: u.rol === 'admin' ? '#1565c0' : '#7b1fa2' }}>{u.rol}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: u.estado === 'activo' ? '#e8f5e9' : '#ffebee', color: u.estado === 'activo' ? '#2e7d32' : '#c62828' }}>{u.estado}</span></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(u)} style={{ padding: '6px 12px', background: '#e8f5e9', color: '#2e7d6f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                    <button onClick={() => handleDelete(u.id_usuario)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '560px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>{editing ? 'Editar' : 'Nuevo'} Usuario</h2>
            {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Nombre *</label><input style={inputStyle} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Email *</label><input style={inputStyle} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>{editing ? 'Nueva contrasena (dejar vacio para no cambiar)' : 'Contrasena *'}</label><input style={inputStyle} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Rol</label><select style={inputStyle} value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}><option value="usuario">Usuario</option><option value="admin">Admin</option></select></div>
              {form.rol === 'usuario' && (
                <div>
                  <h3 style={{ fontSize: '16px', color: '#2e7d6f', marginBottom: '12px' }}>Permisos por modulo</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {form.permisos.map(p => (
                      <div key={p.modulo} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#fafafa', borderRadius: '8px' }}>
                        <span style={{ fontSize: '13px', flex: 1, textTransform: 'capitalize' }}>{p.modulo.replace('_', ' ')}</span>
                        <select style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px' }} value={p.nivel} onChange={e => updatePermiso(p.modulo, e.target.value)}>
                          {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
