import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TIPOS = ['manga_corta', 'manga_larga', 'tirantes', 'sudadera'];
const TIPO_COMP = { P: 'Producto', S: 'Servicio', R: 'Recurso' };

export default function ConfigCostes() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ tipo_prenda: 'manga_corta', concepto: '', tipo_componente: 'S', cantidad: 1, precio_coste: '' });
  const [error, setError] = useState('');

  const fetchData = async () => { setLoading(true); try { const r = await api.get('/config-costes/'); setItems(r.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm({ tipo_prenda: 'manga_corta', concepto: '', tipo_componente: 'S', cantidad: 1, precio_coste: '' }); setError(''); setShowModal(true); };
  const openEdit = (i) => { setEditing(i.id_config); setForm({ tipo_prenda: i.tipo_prenda, concepto: i.concepto, tipo_componente: i.tipo_componente, cantidad: i.cantidad, precio_coste: i.precio_coste }); setError(''); setShowModal(true); };

  const handleSave = async () => {
    setError('');
    if (!form.concepto || !form.precio_coste) { setError('Completa concepto y precio'); return; }
    try {
      if (editing) { await api.put('/config-costes/' + editing, { ...form, cantidad: parseFloat(form.cantidad), precio_coste: parseFloat(form.precio_coste) }); }
      else { await api.post('/config-costes/', { ...form, cantidad: parseFloat(form.cantidad), precio_coste: parseFloat(form.precio_coste) }); }
      setShowModal(false); fetchData();
    } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async (id) => { if (!confirm('Eliminar?')) return; try { await api.delete('/config-costes/' + id); fetchData(); } catch (err) { alert(err.response?.data?.detail || 'Error'); } };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const tipoColors = { manga_corta: '#1565c0', manga_larga: '#2e7d6f', tirantes: '#e65100', sudadera: '#7b1fa2' };
  const tipoLabels = { manga_corta: 'Manga Corta', manga_larga: 'Manga Larga', tirantes: 'Tirantes', sudadera: 'Sudadera' };

  const grouped = {};
  TIPOS.forEach(t => { grouped[t] = items.filter(i => i.tipo_prenda === t); });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Configuracion de Costes</h1>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>Define los costes automaticos por tipo de prenda. Se aplicaran al generar escandallos.</p>
        </div>
        <button onClick={openCreate} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>+ Nuevo Coste</button>
      </div>

      {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</div> :
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {TIPOS.map(tipo => {
            const costes = grouped[tipo] || [];
            const total = costes.reduce((s, c) => s + c.precio_coste * c.cantidad, 0);
            const color = tipoColors[tipo];
            return (
              <div key={tipo} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', background: color, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>{tipoLabels[tipo]}</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Coste extra: {total.toFixed(2)} EUR/ud</span>
                </div>
                {costes.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Sin costes configurados</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {costes.map((c, i) => (
                        <tr key={c.id_config} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '500' }}>{c.concepto}</td>
                          <td style={{ padding: '10px 8px' }}><span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', background: c.tipo_componente === 'P' ? '#e3f2fd' : c.tipo_componente === 'S' ? '#fff3e0' : '#f3e5f5', color: c.tipo_componente === 'P' ? '#1565c0' : c.tipo_componente === 'S' ? '#e65100' : '#7b1fa2' }}>{TIPO_COMP[c.tipo_componente]}</span></td>
                          <td style={{ padding: '10px 8px', fontSize: '14px', textAlign: 'center' }}>x{c.cantidad}</td>
                          <td style={{ padding: '10px 8px', fontSize: '14px', fontWeight: '600', color }}>{c.precio_coste.toFixed(2)} EUR</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => openEdit(c)} style={{ padding: '4px 10px', background: '#e8f5e9', color: '#2e7d6f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Editar</button>
                              <button onClick={() => handleDelete(c.id_config)} style={{ padding: '4px 10px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>X</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      }

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '450px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>{editing ? 'Editar' : 'Nuevo'} Coste</h2>
            {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Tipo de prenda</label><select style={inputStyle} value={form.tipo_prenda} onChange={e => setForm({...form, tipo_prenda: e.target.value})}>{TIPOS.map(t => <option key={t} value={t}>{tipoLabels[t]}</option>)}</select></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Concepto *</label><input style={inputStyle} value={form.concepto} onChange={e => setForm({...form, concepto: e.target.value})} placeholder="Ej: Bordado, Mano de obra, Embalaje" /></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Tipo componente</label><select style={inputStyle} value={form.tipo_componente} onChange={e => setForm({...form, tipo_componente: e.target.value})}><option value="P">P - Producto (descuenta stock)</option><option value="S">S - Servicio (solo coste)</option><option value="R">R - Recurso (solo coste)</option></select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Cantidad</label><input style={inputStyle} type="number" step="0.001" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
                <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Precio coste *</label><input style={inputStyle} type="number" step="0.01" value={form.precio_coste} onChange={e => setForm({...form, precio_coste: e.target.value})} /></div>
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