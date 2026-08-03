import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RequireCoordenador from "./routes/RequireCoordenador";
import RequireAdmin from "./routes/RequireAdmin";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CoordenadorHome from "./pages/CoordenadorHome";
import DelegarTimes from "./pages/DelegarTimes";
import CadastrarUsuario from "./pages/CadastrarUsuario";

/** Ponto de entrada "/" (e qualquer rota desconhecida): manda pra tela
 * certa dependendo de quem está logado — admin só cadastra gente,
 * coordenador cai na tela de escolha, os demais vão pro dashboard. */
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Carregando…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") return <Navigate to="/cadastrar-usuario" replace />;
  if (user.role === "coordenador") return <Navigate to="/inicio" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<RequireCoordenador />}>
              <Route path="/inicio" element={<CoordenadorHome />} />
              <Route path="/delegar-times" element={<DelegarTimes />} />
            </Route>

            <Route element={<RequireAdmin />}>
              <Route path="/cadastrar-usuario" element={<CadastrarUsuario />} />
            </Route>
          </Route>

          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}