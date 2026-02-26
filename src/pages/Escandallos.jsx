import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Escandallos() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [prodsProv, setProdsProv] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [escandallos, setEscandallos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id_componente: '', cantidad: '', tipo_componente: 'P' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/productos/', { params: { per_page: 100 } }).then(r => setProductos(r.data.data)).catch(() => {});
    api.get('/productos-proveedor/todos').then(r => setProdsProv(r.data)).catch(() => {});
  }, []);

  const fetchEscandallo = async (idProd) => {
    if (!idProd) { setEscandallos([]); return; }
    setLoading(true);
    try { const r = await api.get('/escandallos/producto/' + idProd); setEscandallos(r.data); }
    catch {} finally { setLoading(false); }
  };

  const handleSelectProducto = (id) => { setSelectedProducto(id); fetchEscandallo(id); };

  const handleAutoGenerar = async () => {
    if (!selectedProducto) return;
    try {
      const r = await api.post('/escandallos/auto-generar/' + selectedProducto);
      setEscandallos(r.data);
      api.get('/productos/', { params: { per_page: 100 } }).then(r => setProductos(r.data.data)).catch(() => {});
    } catch (err) { alert(err.response?.data?.detail || 'Error'); }
  };

  const handleSave = async () => {
    setError('');
    if (!form.id_componente || !form.cantidad) { setError('Selecciona componente y cantidad'); return; }
    try {
      await api.post('/escandallos/', { id_producto: parseInt(selectedProducto), id_componente: parseInt(form.id_componente), cantidad: parseFloat(form.cantidad), tipo_componente: form.tipo_componente });
      setShowModal(false); fetchEscandallo(selectedProducto);
    } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este componente del escandallo?')) return;
    try { await api.delete('/escandallos/' + id); fetchEscandallo(selectedProducto); }
    catch (err) { alert(err.response?.data?.detail || 'Error'); }
  };

  const tipoLabels = { P: 'Producto', S: 'Servicio', R: 'Recurso' };
  const tipoColors = { P: { bg: '#e3f2fd', c: '#1565c0' }, S: { bg: '#fff3e0', c: '#e65100' }, R: { bg: '#f3e5f5', c: '#7b1fa2' } };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const costeTotal = escandallos.reduce((sum, e) => sum + (e.precio_coste * e.cantidad), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333' }}>Escandallos</h1>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px', fontWeight: '600' }}>Selecciona un producto para ver/editar su escandallo:</label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select style={{ ...inputStyle, flex: 1 }} value={selectedProducto} onChange={e => handleSelectProducto(e.target.value)}>
            <option value="">Seleccionar producto...</option>
            {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre} - {p.talla} ({p.tipo_producto || 'simple'})</option>)}
          </select>
          {selectedProducto && (
            <>
              <button onClick={handleAutoGenerar} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #7b1fa2, #9c27b0)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>Auto-generar</button>
              <button onClick={() => { setForm({ id_componente: '', cantidad: '', tipo_componente: 'P' }); setError(''); setShowModal(true); }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>+ Manual</button>
            </>
          )}
        </div>
      </div>

      {selectedProducto && (
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: '#f8faf8', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>Componentes del escandallo</span>
              <span style={{ fontSize: '13px', color: '#888', marginLeft: '12px' }}>{escandallos.length} componente(s)</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {escandallos.length > 0 && <div style={{ padding: '8px 16px', background: '#e8f5e9', borderRadius: '8px' }}><span style={{ fontSize: '13px', color: '#2e7d32', fontWeight: '600' }}>Coste por unidad: {costeTotal.toFixed(2)} EUR</span></div>}
              <div style={{ padding: '6px 12px', background: '#fff3e0', borderRadius: '8px' }}><span style={{ fontSize: '11px', color: '#e65100' }}>Precios auto-actualizados</span></div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' }}>
              {['Componente', 'Tipo', 'Origen', 'Cant/ud', 'Precio Coste', 'Coste Linea', 'Acciones'].map(h => <th key={h} style={{ padding: '14px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</td></tr>
              : escandallos.length === 0 ? <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Sin escandallo. Usa "Auto-generar" para crear automaticamente.</td></tr>
              : escandallos.map((e, i) => {
                const tc = tipoColors[e.tipo_componente] || { bg: '#eee', c: '#333' };
                return (
                  <tr key={e.id_escandallo} style={{ background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{e.componente_nombre}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: tc.bg, color: tc.c }}>{tipoLabels[e.tipo_componente]}</span></td>
                    <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: e.es_auto ? '#f3e5f5' : '#e8f5e9', color: e.es_auto ? '#7b1fa2' : '#2e7d6f' }}>{e.es_auto ? 'Auto' : 'Manual'}</span></td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600' }}>{e.cantidad}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#2e7d6f', fontWeight: '600' }}>{e.precio_coste.toFixed(2)} EUR</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#e65100' }}>{(e.precio_coste * e.cantidad).toFixed(2)} EUR</td>
                    <td style={{ padding: '12px 16px' }}><button onClick={() => handleDelete(e.id_escandallo)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '500px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Añadir Componente Manual</h2>
            {error && <p style={{ color: '#d32f2f', background: '#ffeaea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Componente (producto proveedor) *</label><select style={inputStyle} value={form.id_componente} onChange={e => setForm({...form, id_componente: e.target.value})}><option value="">Seleccionar...</option>{prodsProv.map(p => <option key={p.id_producto_proveedor} value={p.id_producto_proveedor}>{p.nombre} - {p.talla} ({p.precio_compra} EUR)</option>)}</select></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Tipo</label><select style={inputStyle} value={form.tipo_componente} onChange={e => setForm({...form, tipo_componente: e.target.value})}><option value="P">P - Producto (descuenta stock)</option><option value="S">S - Servicio (solo coste)</option><option value="R">R - Recurso (solo coste)</option></select></div>
              <div><label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Cantidad por unidad *</label><input style={inputStyle} type="number" step="0.001" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} placeholder="Ej: 1, 0.5" /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '10px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Añadir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}