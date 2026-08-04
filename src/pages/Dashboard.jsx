import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../api/client";
import CampaignCard from "../components/CampaignCard";
import PlanBreakdownChart from "../components/PlanBreakdownChart";
import MonthlySalesChart from "../components/MonthlySalesChart";
import EmptyState from "../components/EmptyState";
import { formatRole } from "../utils/format";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/campanhas/by-usuario")
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erro ao carregar dashboard."));
  }, []);

  const campanhas = data?.campanhas ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          {user?.role === "coordenador" && (
            <Link to="/inicio" className="mb-1 block text-sm text-slate-500 hover:text-brand-700">
              ← Voltar
            </Link>
          )}
          <p className="text-sm text-slate-500">Olá,</p>
          <div className="flex items-center gap-2">
            <p className="font-medium text-ink-900">{user?.username}</p>
            {user?.role && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                {formatRole(user.role)}
              </span>
            )}
          </div>
        </div>
        <button onClick={logout} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
          Sair
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!data && !error && <p className="text-sm text-slate-400">Carregando painel…</p>}

        {data && (
          <div className="flex flex-col gap-10">
            <section>
              <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">Minhas campanhas</h2>

              {campanhas.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {campanhas.map((campanha) => (
                    <CampaignCard
                      key={campanha.id}
                      campanha={campanha}
                      editHref={
                        user?.role === "gerente" || user?.role === "coordenador"
                          ? `/campanhas/${campanha.id}/editar`
                          : null
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="Nenhuma campanha ainda. Assim que uma for criada pro seu time, ela aparece aqui." />
              )}
            </section>

            <section>
              <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">Desempenho</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <h3 className="mb-4 font-medium text-ink-900">Vendas por plano</h3>
                  <PlanBreakdownChart area={data.dashboard_data?.area} />
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <h3 className="mb-4 font-medium text-ink-900">Vendas por mês</h3>
                  <MonthlySalesChart finance={data.dashboard_data?.finance} />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}