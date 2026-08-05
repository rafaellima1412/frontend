import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import CampaignCard from "../components/CampaignCard";
import EmptyState from "../components/EmptyState";

export default function CampanhasPorGerente() {
  const [gerentes, setGerentes] = useState(null);
  const [gerenteId, setGerenteId] = useState("");
  const [campanhas, setCampanhas] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api
      .get("/user/gerentes")
      .then((lista) => {
        setGerentes(lista);
        setGerenteId(lista[0]?.id ?? "");
      })
      .catch((err) => setErro(err instanceof ApiError ? err.detail : "Erro ao buscar gerentes."));
  }, []);

  useEffect(() => {
    if (!gerenteId) return;
    setCampanhas(null);
    api
      .get(`/campanhas/de-gerente/${gerenteId}`)
      .then(setCampanhas)
      .catch((err) => setErro(err instanceof ApiError ? err.detail : "Erro ao buscar campanhas do gerente."));
  }, [gerenteId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/inicio" className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Campanhas por gerente</h1>
        <p className="mb-6 text-sm text-slate-500">Escolha um gerente pra ver as campanhas do time dele.</p>

        {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

        {gerentes === null && !erro && <p className="text-sm text-slate-400">Carregando gerentes…</p>}

        {gerentes?.length === 0 && <EmptyState message="Nenhum gerente cadastrado ainda." />}

        {gerentes && gerentes.length > 0 && (
          <select
            value={gerenteId}
            onChange={(e) => setGerenteId(e.target.value)}
            className="mb-6 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {gerentes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.full_name}
              </option>
            ))}
          </select>
        )}

        {campanhas === null && gerenteId && <p className="text-sm text-slate-400">Carregando campanhas…</p>}

        {campanhas?.length === 0 && (
          <EmptyState message="Esse gerente ainda não tem nenhuma campanha no time." />
        )}

        {campanhas && campanhas.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campanhas.map((campanha) => (
              <CampaignCard key={campanha.id} campanha={campanha} showPostar={false} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}