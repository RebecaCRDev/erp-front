import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ESTADOS = ['preparando', 'en_transito', 'entregado', 'devuelto'];
const initialForm = { id_pedido_cliente: '', empresa_envio: '', codigo_seguimiento: '', costo_envio: 0, estado_envio: 'preparando', fecha_envio: new Date().toISOString().split('T')[0], fecha_entrega_estimada: '' };

export default function Envios() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const isAdmin = user?.rol === 'admin';

  const fetchData = async () => { setLoading(true); try { const r = await api.get('/envios/', { params: { page, per_page: 10 } }); setItems(r.data.data); setTotalPages(r.data.total_pages); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => { api.get('/pedidos-cliente/', { params: { per_page: 100 } }).then(r => setPedidos(r.data.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditing(null); setForm(initialForm); setError(''); setShowModal(true); };
  const openEdit = (i) => { setEditing(i.id_envio); setForm({ id_pedido_cliente: i.id_pedido_cliente, empresa_envio: i.empresa_envio || '', codigo_seguimiento: i.codigo_seguimiento || '', costo_envio: i.costo_envio, estado_envio: i.estado_envio, fecha_envio: i.fecha_envio || '', fecha_entrega_estimada: i.fecha_entrega_estimada || '' }); setError(''); setShowModal(true); };

  const handleSave = async () => {
    setError('');
    if (!form.id_pedido_cliente && !editing) { setError('Selecciona un pedido'); return; }
    try {
      if (editing) { await api.put('/envios/' + editing, { empresa_envio: form.empresa_envio, codigo_seguimiento: form.codigo_seguimiento, costo_envio: parseFloat(form.costo_envio), estado_envio: form.estado_envio, fecha_envio: form.fecha_envio || null, fecha_entrega_estimada: form.fecha_entrega_estimada || null }); }
      else { await api.post('/envios/', { ...form, costo_envio: parseFloat(form.costo_envio), id_pedido_cliente: parseInt(form.id_pedido_cliente) }); }
      setShowModal(false); fetchData();
    } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async (id) => { if (!confirm('Eliminar?')) return; try { await api.delete('/envios/' + id); fetchData(); } catch (err) { alert(err.response?.data?.detail || 'Error'); } };

  const ec = { preparando: { bg: '#fff3e0', c: '#e65100' }, en_transito: { bg: '#e3f2fd', c: '#1565c0' }, entregado: { bg: '#e8f5e9', c: '#2e7d32' }, devuelto: { bg: '#ffebee', c: '#c62828' } };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Envios</h1>
        <button onClick={openCreate} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>+ Nuevo Envio</button>
      </div>
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' }}>
            {['ID', 'Pedido', 'Cliente', 'Empresa', 'Seguimiento', 'Costo', 'Estado', 'Acciones'].map(h => <th key={h} style={{ padding: '14px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</td></tr>
            : items.length === 0 ? <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay envios</td></tr>
            : items.map((e, i) => {
              const colors = ec[e.estado_envio] || { bg: '#eee', c: '#333' };
              return (
                <tr key={e.id_envio} style={{ background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.id_envio}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>#{e.id_pedido_cliente}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.cliente_nombre || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.empresa_envio || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.codigo_seguimiento || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.costo_envio} EUR</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: colors.bg, color: colors.c }}>{e.estado_envio}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(e)} style={{ padding: '6px 12px', background: '#e8f5e9', color: '#2e7d6f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                      {isAdmin && <button onClick={() => handleDelete(e.id_envio)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
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
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>{editing ? 'Editar' : 'Nuevo'} Envio</h2>
            {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {!editing && <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Pedido Cliente *</label><select style={inputStyle} value={form.id_pedido_cliente} onChange={e => setForm({...form, id_pedido_cliente: e.target.value})}><option value="">Seleccionar...</option>{pedidos.map(p => <option key={p.id_pedido_cliente} value={p.id_pedido_cliente}>#{p.id_pedido_cliente} - {p.cliente_nombre} ({p.total} EUR)</option>)}</select></div>}
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Empresa envio</label><input style={inputStyle} value={form.empresa_envio} onChange={e => setForm({...form, empresa_envio: e.target.value})} /></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Codigo seguimiento</label><input style={inputStyle} value={form.codigo_seguimiento} onChange={e => setForm({...form, codigo_seguimiento: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Costo envio</label><input style={inputStyle} type="number" step="0.01" value={form.costo_envio} onChange={e => setForm({...form, costo_envio: e.target.value})} /></div>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Estado</label><select style={inputStyle} value={form.estado_envio} onChange={e => setForm({...form, estado_envio: e.target.value})}>{ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Fecha envio</label><input style={inputStyle} type="date" value={form.fecha_envio} onChange={e => setForm({...form, fecha_envio: e.target.value})} /></div>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Entrega estimada</label><input style={inputStyle} type="date" value={form.fecha_entrega_estimada} onChange={e => setForm({...form, fecha_entrega_estimada: e.target.value})} /></div>
              </div>
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
