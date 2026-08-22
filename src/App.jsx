import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RequireCoordenador from "./routes/RequireCoordenador";
import RequireAdmin from "./routes/RequireAdmin";
import RequireGerente from "./routes/RequireGerente";
import RequireGerenteOuCoordenador from "./routes/Requiregerenteoucoordenador";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CoordenadorHome from "./pages/CoordenadorHome";
import CriarLocal from "./pages/CriarLocal";
import CadastrarUsuario from "./pages/CadastrarUsuario";
import GerenteHome from "./pages/GerenteHome";
import CriarCampanha from "./pages/CriarCampanha";
import EditarCampanha from "./pages/EditarCampanha";
import DetalheCampanha from "./pages/DetalheCampanha";
import AssociarCampanha from "./pages/Associarcampanha";
import SimularVenda from "./pages/SimularVenda";
import CarteiraEquipe from "./pages/CarteiraEquipe";
import Desempenho from "./pages/Desempenho";
import CampanhasPorGerente from "./pages/Campanhasporgerente";

/** Ponto de entrada "/" (e qualquer rota desconhecida): manda pra tela
 * certa dependendo de quem está logado — admin só cadastra gente,
 * coordenador cai na tela de escolha, gerente vai pra tela dele, os
 * demais vão pro dashboard. */
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Carregando…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") return <Navigate to="/cadastrar-usuario" replace />;
  if (user.role === "gerente") return <Navigate to="/inicio" replace />;
  if (user.role === "coordenador") return <Navigate to="/gerente" replace />;
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
            <Route path="/campanhas/:id" element={<DetalheCampanha />} />
            <Route path="/campanhas/:id/editar" element={<EditarCampanha />} />

            <Route element={<RequireCoordenador />}>
              <Route path="/inicio" element={<CoordenadorHome />} />
              <Route path="/campanhas-por-gerente" element={<CampanhasPorGerente />} />
              <Route path="/locais/novo" element={<CriarLocal />} />
              <Route path="/campanhas/nova" element={<CriarCampanha />} />
            </Route>

            <Route element={<RequireAdmin />}>
              <Route path="/cadastrar-usuario" element={<CadastrarUsuario />} />
            </Route>

            <Route element={<RequireGerente />}>
              <Route path="/gerente" element={<GerenteHome />} />
              <Route path="/associar-campanha" element={<AssociarCampanha />} />
            </Route>

            <Route element={<RequireGerenteOuCoordenador />}>
              <Route path="/simular-venda" element={<SimularVenda />} />
              <Route path="/carteira-equipe" element={<CarteiraEquipe />} />
              <Route path="/desempenho" element={<Desempenho />} />
            </Route>
          </Route>

          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}