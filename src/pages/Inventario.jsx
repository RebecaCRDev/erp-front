import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Inventario() {
  const [tab, setTab] = useState('proveedor');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventario/' + tab, { params: { per_page: 50 } });
      setItems(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const tabStyle = (t) => ({
    padding: '10px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    background: tab === t ? 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' : '#e8e8e8',
    color: tab === t ? 'white' : '#666',
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333', marginBottom: '24px' }}>Inventario</h1>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button style={tabStyle('proveedor')} onClick={() => setTab('proveedor')}>Productos Sin Logo (Recepcion)</button>
        <button style={tabStyle('producto')} onClick={() => setTab('producto')}>Productos Con Logo (Produccion)</button>
      </div>
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'linear-gradient(135deg, #2e7d6f, #3a9d8f)' }}>
            {['Producto', 'Almacen', 'Stock Actual', 'Stock Min', 'Stock Max', 'Estado'].map(h => <th key={h} style={{ padding: '14px 16px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Cargando...</td></tr>
            : items.length === 0 ? <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay inventario</td></tr>
            : items.map((c, i) => {
              const low = c.stock_actual <= c.stock_minimo;
              return (
                <tr key={i} style={{ background: low ? '#fff8e1' : (i % 2 === 0 ? '#fafafa' : 'white') }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{c.producto_nombre || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.almacen_nombre || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: low ? '#e65100' : '#2e7d32' }}>{c.stock_actual}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.stock_minimo}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.stock_maximo}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: low ? '#fff3e0' : '#e8f5e9', color: low ? '#e65100' : '#2e7d32' }}>{low ? 'Stock bajo' : 'OK'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
