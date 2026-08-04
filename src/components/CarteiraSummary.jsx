import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";

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

export default function CarteiraSummary() {
  const [carteira, setCarteira] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/carteira/me")
      .then(setCarteira)
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erro ao carregar sua carteira."));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!carteira) return <p className="text-sm text-slate-400">Carregando sua carteira…</p>;

  const saldoFormatado = carteira.saldo_estimado.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const conversaoFormatada = `${Math.round(carteira.taxa_conversao * 100)}%`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saldo estimado" value={saldoFormatado} hint="Comissão sobre vendas fechadas" />
        <StatCard label="Taxa de conversão" value={conversaoFormatada} hint="Vendido ÷ registradas" />
        <StatCard label="Campanhas recebidas" value={carteira.total_campanhas} />
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
    </div>
  );
}