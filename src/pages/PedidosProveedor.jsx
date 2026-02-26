import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const ESTADOS_PROV = ["pendiente", "enviado", "recibido", "cancelado"];

export default function PedidosProveedor() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [detallePedido, setDetallePedido] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [prodsProv, setProdsProv] = useState([]);
  const [form, setForm] = useState({
    id_proveedor: "",
    fecha: new Date().toISOString().split("T")[0],
    tiempo_entrega: "",
    detalles: [{ id_producto_proveedor: "", cantidad: 1, precio_unitario: "" }],
  });
  const [error, setError] = useState("");
  const isAdmin = user?.rol === "admin";

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get("/pedidos-proveedor/", {
        params: { page, per_page: 10 },
      });
      setItems(r.data.data);
      setTotalPages(r.data.total_pages);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [page]);
  useEffect(() => {
    api
      .get("/proveedores/", { params: { per_page: 100 } })
      .then((r) => setProveedores(r.data.data))
      .catch(() => {});
    api
      .get("/productos-proveedor/todos")
      .then((r) => setProdsProv(r.data))
      .catch(() => {});
  }, []);

  const addLine = () =>
    setForm({
      ...form,
      detalles: [
        ...form.detalles,
        { id_producto_proveedor: "", cantidad: 1, precio_unitario: "" },
      ],
    });
  const removeLine = (i) =>
    setForm({ ...form, detalles: form.detalles.filter((_, idx) => idx !== i) });
  const updateLine = (i, field, val) => {
    const d = [...form.detalles];
    d[i][field] = val;
    setForm({ ...form, detalles: d });
  };

  const handleSave = async () => {
    setError("");
    if (!form.id_proveedor || form.detalles.length === 0) {
      setError("Selecciona proveedor y al menos un producto");
      return;
    }
    for (const d of form.detalles) {
      if (!d.id_producto_proveedor || !d.cantidad || !d.precio_unitario) {
        setError("Completa todos los campos");
        return;
      }
    }
    try {
      await api.post("/pedidos-proveedor/", {
        id_proveedor: parseInt(form.id_proveedor),
        fecha: form.fecha,
        tiempo_entrega: form.tiempo_entrega,
        detalles: form.detalles.map((d) => ({
          id_producto_proveedor: parseInt(d.id_producto_proveedor),
          cantidad: parseInt(d.cantidad),
          precio_unitario: parseFloat(d.precio_unitario),
        })),
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Error");
    }
  };

  const handleRecibir = async (id) => {
    if (
      !confirm(
        "¿Marcar como recibido? Esto sumará stock al almacén de recepción.",
      )
    )
      return;
    try {
      await api.put("/pedidos-proveedor/" + id + "/recibir");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error");
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    if (nuevoEstado === "recibido") {
      handleRecibir(id);
      return;
    }
    try {
      await api.put("/pedidos-proveedor/" + id + "/estado", {
        estado: nuevoEstado,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Eliminar?")) return;
    try {
      await api.delete("/pedidos-proveedor/" + id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error");
    }
  };

  const openDetalle = async (id) => {
    try {
      const r = await api.get("/pedidos-proveedor/" + id);
      setDetallePedido(r.data);
      setShowDetalle(true);
    } catch (err) {
      alert("Error cargando detalle");
    }
  };

  const estadoColors = {
    pendiente: { bg: "#fff3e0", c: "#e65100" },
    enviado: { bg: "#e3f2fd", c: "#1565c0" },
    recibido: { bg: "#e8f5e9", c: "#2e7d32" },
    cancelado: { bg: "#ffebee", c: "#c62828" },
  };
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };
  const nextEstado = { pendiente: "enviado", enviado: "recibido" };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#333" }}>
          Pedidos a Proveedor
        </h1>
        <button
          onClick={() => {
            setForm({
              id_proveedor: "",
              fecha: new Date().toISOString().split("T")[0],
              tiempo_entrega: "",
              detalles: [
                { id_producto_proveedor: "", cantidad: 1, precio_unitario: "" },
              ],
            });
            setError("");
            setShowModal(true);
          }}
          style={{
            padding: "10px 24px",
            background: "linear-gradient(135deg, #2e7d6f, #3a9d8f)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          + Nuevo Pedido
        </button>
      </div>
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "linear-gradient(135deg, #2e7d6f, #3a9d8f)",
              }}
            >
              {["ID", "Proveedor", "Fecha", "Total", "Estado", "Acciones"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      color: "white",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  No hay pedidos
                </td>
              </tr>
            ) : (
              items.map((p, i) => {
                const ec = estadoColors[p.estado] || { bg: "#eee", c: "#333" };
                const next = nextEstado[p.estado];
                return (
                  <tr
                    key={p.id_pedido_proveedor}
                    style={{ background: i % 2 === 0 ? "#fafafa" : "white" }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      <span
                        onClick={() => openDetalle(p.id_pedido_proveedor)}
                        style={{
                          color: "#2e7d6f",
                          cursor: "pointer",
                          fontWeight: "600",
                          textDecoration: "underline",
                        }}
                      >
                        #{p.id_pedido_proveedor}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {p.proveedor_nombre}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      {p.fecha}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      {p.total} EUR
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <select
                        value={p.estado}
                        onChange={(e) =>
                          cambiarEstado(p.id_pedido_proveedor, e.target.value)
                        }
                        style={{
                          padding: "4px 8px",
                          borderRadius: "8px",
                          border: "2px solid " + ec.c,
                          background: ec.bg,
                          color: ec.c,
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        {ESTADOS_PROV.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => openDetalle(p.id_pedido_proveedor)}
                          style={{
                            padding: "6px 12px",
                            background: "#f3e5f5",
                            color: "#7b1fa2",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        >
                          Detalle
                        </button>
                        {next && (
                          <button
                            onClick={() =>
                              cambiarEstado(p.id_pedido_proveedor, next)
                            }
                            style={{
                              padding: "6px 12px",
                              background:
                                next === "recibido" ? "#e8f5e9" : "#e3f2fd",
                              color:
                                next === "recibido" ? "#2e7d32" : "#1565c0",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          >
                            {next === "recibido" ? "Recibir" : "Avanzar"}
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(p.id_pedido_proveedor)}
                            style={{
                              padding: "6px 12px",
                              background: "#ffebee",
                              color: "#c62828",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "13px",
                            }}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "16px",
            gap: "8px",
          }}
        >
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            style={{
              padding: "6px 14px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "white",
              fontSize: "13px",
            }}
          >
            Anterior
          </button>
          <span style={{ padding: "6px 14px", fontSize: "13px" }}>
            {page}/{totalPages || 1}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              padding: "6px 14px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "white",
              fontSize: "13px",
            }}
          >
            Siguiente
          </button>
        </div>
      </div>

      {showDetalle && detallePedido && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowDetalle(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              width: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "24px 32px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>
                  Pedido #{detallePedido.id_pedido_proveedor}
                </h2>
                <p
                  style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}
                >
                  {detallePedido.fecha}
                </p>
              </div>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background: (estadoColors[detallePedido.estado] || {}).bg,
                  color: (estadoColors[detallePedido.estado] || {}).c,
                }}
              >
                {detallePedido.estado}
              </span>
            </div>
            <div style={{ padding: "24px 32px" }}>
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    textTransform: "uppercase",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  Proveedor
                </div>
                <div
                  style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}
                >
                  {detallePedido.proveedor_nombre}
                </div>
                {detallePedido.tiempo_entrega && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#888",
                      marginTop: "4px",
                    }}
                  >
                    Tiempo entrega: {detallePedido.tiempo_entrega}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  textTransform: "uppercase",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Lineas del pedido
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "20px",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                    <th
                      style={{
                        padding: "8px 0",
                        textAlign: "left",
                        fontSize: "12px",
                        color: "#888",
                      }}
                    >
                      Producto
                    </th>
                    <th
                      style={{
                        padding: "8px 0",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#888",
                      }}
                    >
                      Cant.
                    </th>
                    <th
                      style={{
                        padding: "8px 0",
                        textAlign: "right",
                        fontSize: "12px",
                        color: "#888",
                      }}
                    >
                      Precio
                    </th>
                    <th
                      style={{
                        padding: "8px 0",
                        textAlign: "right",
                        fontSize: "12px",
                        color: "#888",
                      }}
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detallePedido.detalles.map((d, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "10px 0", fontSize: "14px" }}>
                        {d.producto_nombre}
                      </td>
                      <td
                        style={{
                          padding: "10px 0",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                      >
                        {d.cantidad}
                      </td>
                      <td
                        style={{
                          padding: "10px 0",
                          fontSize: "14px",
                          textAlign: "right",
                        }}
                      >
                        {d.precio_unitario.toFixed(2)} EUR
                      </td>
                      <td
                        style={{
                          padding: "10px 0",
                          fontSize: "14px",
                          textAlign: "right",
                          fontWeight: "600",
                        }}
                      >
                        {d.subtotal.toFixed(2)} EUR
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  style={{
                    padding: "16px 20px",
                    background: "#f8faf8",
                    borderRadius: "12px",
                    minWidth: "200px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#2e7d6f",
                    }}
                  >
                    <span>Total</span>
                    <span>{detallePedido.total.toFixed(2)} EUR</span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => setShowDetalle(false)}
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #2e7d6f, #3a9d8f)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "32px",
              width: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "24px",
              }}
            >
              Nuevo Pedido a Proveedor
            </h2>
            {error && (
              <p
                style={{
                  color: "#d32f2f",
                  background: "#ffeaea",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                {error}
              </p>
            )}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Proveedor *
                </label>
                <select
                  style={inputStyle}
                  value={form.id_proveedor}
                  onChange={(e) =>
                    setForm({ ...form, id_proveedor: e.target.value })
                  }
                >
                  <option value="">Seleccionar...</option>
                  {proveedores.map((p) => (
                    <option key={p.id_proveedor} value={p.id_proveedor}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Fecha
                  </label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.fecha}
                    onChange={(e) =>
                      setForm({ ...form, fecha: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Tiempo entrega
                  </label>
                  <input
                    style={inputStyle}
                    value={form.tiempo_entrega}
                    onChange={(e) =>
                      setForm({ ...form, tiempo_entrega: e.target.value })
                    }
                    placeholder="Ej: 5 dias"
                  />
                </div>
              </div>
              <h3
                style={{ fontSize: "16px", color: "#2e7d6f", marginTop: "8px" }}
              >
                Lineas del pedido
              </h3>
              {form.detalles.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr auto",
                    gap: "8px",
                    alignItems: "end",
                  }}
                >
                  <div>
                    <label style={{ fontSize: "12px", color: "#666" }}>
                      Producto
                    </label>
                    <select
                      style={inputStyle}
                      value={d.id_producto_proveedor}
                      onChange={(e) =>
                        updateLine(i, "id_producto_proveedor", e.target.value)
                      }
                    >
                      <option value="">Seleccionar...</option>
                      {prodsProv.map((p) => (
                        <option
                          key={p.id_producto_proveedor}
                          value={p.id_producto_proveedor}
                        >
                          {p.nombre} - {p.talla}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#666" }}>
                      Cant.
                    </label>
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      value={d.cantidad}
                      onChange={(e) =>
                        updateLine(i, "cantidad", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#666" }}>
                      Precio
                    </label>
                    <input
                      style={inputStyle}
                      type="number"
                      step="0.01"
                      value={d.precio_unitario}
                      onChange={(e) =>
                        updateLine(i, "precio_unitario", e.target.value)
                      }
                    />
                  </div>
                  <button
                    onClick={() => removeLine(i)}
                    style={{
                      padding: "10px",
                      background: "#ffebee",
                      color: "#c62828",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                onClick={addLine}
                style={{
                  padding: "8px",
                  background: "#f0f0f0",
                  border: "1px dashed #ccc",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                + Agregar linea
              </button>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "28px",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 24px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #2e7d6f, #3a9d8f)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Crear Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
