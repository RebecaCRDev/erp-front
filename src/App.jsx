import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Proveedores from "./pages/Proveedores";
import ProductosProveedor from "./pages/ProductosProveedor";
import Productos from "./pages/Productos";
import Almacenes from "./pages/Almacenes";
import Inventario from "./pages/Inventario";
import Transformaciones from "./pages/Transformaciones";
import PedidosProveedor from "./pages/PedidosProveedor";
import PedidosCliente from "./pages/PedidosCliente";
import Envios from "./pages/Envios";
import Pagos from "./pages/Pagos";
import Usuarios from "./pages/Usuarios";
import FacturasCompra from "./pages/FacturasCompra";
import FacturasVenta from "./pages/FacturasVenta";
import Layout from "./components/Layout";
import Escandallos from "./pages/Escandallos";
import Fabricaciones from "./pages/Fabricaciones";
import ConfigCostes from "./pages/ConfigCostes";

function PrivateRoute({ children, modulo }) {
  const { user, loading, canView } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#2e7d6f",
          fontSize: "18px",
        }}
      >
        Cargando...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (modulo && !canView(modulo))
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔒</div>
          <h1 style={{ fontSize: "24px", color: "#333", marginBottom: "8px" }}>
            Acceso denegado
          </h1>
          <p style={{ color: "#666" }}>
            No tienes permisos para ver esta seccion.
          </p>
        </div>
      </Layout>
    );
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#2e7d6f",
          fontSize: "18px",
        }}
      >
        Cargando...
      </div>
    );
  return user ? <Navigate to="/" /> : children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#2e7d6f",
          fontSize: "18px",
        }}
      >
        Cargando...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (user.rol !== "admin")
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔒</div>
          <h1 style={{ fontSize: "24px", color: "#333", marginBottom: "8px" }}>
            Solo administradores
          </h1>
        </div>
      </Layout>
    );
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute modulo="dashboard">
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <PrivateRoute modulo="clientes">
            <Clientes />
          </PrivateRoute>
        }
      />
      <Route
        path="/proveedores"
        element={
          <PrivateRoute modulo="proveedores">
            <Proveedores />
          </PrivateRoute>
        }
      />
      <Route
        path="/productos-proveedor"
        element={
          <PrivateRoute modulo="productos_proveedor">
            <ProductosProveedor />
          </PrivateRoute>
        }
      />
      <Route
        path="/productos"
        element={
          <PrivateRoute modulo="productos">
            <Productos />
          </PrivateRoute>
        }
      />
      <Route
        path="/almacenes"
        element={
          <PrivateRoute modulo="almacenes">
            <Almacenes />
          </PrivateRoute>
        }
      />
      <Route
        path="/inventario"
        element={
          <PrivateRoute modulo="inventario">
            <Inventario />
          </PrivateRoute>
        }
      />
      <Route
        path="/transformaciones"
        element={
          <PrivateRoute modulo="inventario">
            <Transformaciones />
          </PrivateRoute>
        }
      />
      <Route
        path="/pedidos-proveedor"
        element={
          <PrivateRoute modulo="pedidos_proveedor">
            <PedidosProveedor />
          </PrivateRoute>
        }
      />
      <Route
        path="/pedidos-cliente"
        element={
          <PrivateRoute modulo="pedidos_cliente">
            <PedidosCliente />
          </PrivateRoute>
        }
      />
      <Route
        path="/facturas-compra"
        element={
          <PrivateRoute modulo="pedidos_proveedor">
            <FacturasCompra />
          </PrivateRoute>
        }
      />
      <Route
        path="/facturas-venta"
        element={
          <PrivateRoute modulo="pedidos_cliente">
            <FacturasVenta />
          </PrivateRoute>
        }
      />
      <Route
        path="/envios"
        element={
          <PrivateRoute modulo="envios">
            <Envios />
          </PrivateRoute>
        }
      />
      <Route
        path="/pagos"
        element={
          <PrivateRoute modulo="pagos">
            <Pagos />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <AdminRoute>
            <Usuarios />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
      <Route
        path="/escandallos"
        element={
          <PrivateRoute modulo="inventario">
            <Escandallos />
          </PrivateRoute>
        }
      />
      <Route
        path="/fabricaciones"
        element={
          <PrivateRoute modulo="inventario">
            <Fabricaciones />
          </PrivateRoute>
        }
      />
      <Route
        path="/config-costes"
        element={
          <PrivateRoute modulo="inventario">
            <ConfigCostes />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
