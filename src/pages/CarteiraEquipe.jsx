import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLE = {
  vendido: "bg-green-50 text-green-700",
  pendente: "bg-amber-50 text-amber-700",
  cancelado: "bg-red-50 text-red-700",
};

const STATUS_LABEL = {
  vendido: "Vendido",
  pendente: "Pendente",
  cancelado: "Cancelado",
};

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default function CarteiraEquipe() {
  const { user } = useAuth();
  const ehCoordenador = user?.role === "gerente";

  const endpoint = ehCoordenador ? "/carteira/geral" : "/carteira/time";
  const titulo = ehCoordenador ? "Carteira geral" : "Carteira do time";
  const subtitulo = ehCoordenador
    ? "Resultado e esforço somados de todos os colaboradores da empresa."
    : "Resultado e esforço somados dos colaboradores do seu time.";
  const homeHref = ehCoordenador ? "/inicio" : "/gerente";

  const [carteira, setCarteira] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(endpoint)
      .then(setCarteira)
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erro ao carregar a carteira."));
  }, [endpoint]);

  const saldoFormatado = carteira?.saldo_estimado?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const conversaoFormatada = carteira ? `${Math.round(carteira.taxa_conversao * 100)}%` : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to={homeHref} className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">{titulo}</h1>
        <p className="mb-6 text-sm text-slate-500">{subtitulo}</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {!carteira && !error && <p className="text-sm text-slate-400">Carregando…</p>}

        {carteira && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Colaboradores" value={carteira.total_colaboradores} />
              <StatCard label="Saldo estimado" value={saldoFormatado} hint="Comissão sobre vendas fechadas" />
              <StatCard label="Taxa de conversão" value={conversaoFormatada} hint="Vendido ÷ registradas" />
              <StatCard label="Campanhas" value={carteira.total_campanhas} />
              <StatCard label="Vendas registradas" value={carteira.total_vendas_registradas} />
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="mb-4 font-medium text-ink-900">Vendas por status</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(carteira.vendas_por_status).map(([status, quantidade]) => (
                  <span
                    key={status}
                    className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLE[status] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {STATUS_LABEL[status] ?? status}: {quantidade}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="mb-4 font-medium text-ink-900">Vendas fechadas por plano</h3>
              {Object.keys(carteira.vendas_por_plano).length === 0 ? (
                <p className="text-sm text-slate-400">Nenhuma venda fechada ainda.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {Object.entries(carteira.vendas_por_plano).map(([plano, quantidade]) => (
                    <li key={plano} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{plano}</span>
                      <span className="font-medium text-ink-900">{quantidade}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}