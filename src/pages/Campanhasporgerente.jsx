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

  const [campanhasSemCoordenador, setCampanhasSemCoordenador] = useState(null);
  const [campanhaParaVincularId, setCampanhaParaVincularId] = useState("");
  const [vinculando, setVinculando] = useState(false);
  const [erroVinculo, setErroVinculo] = useState(null);
  const [sucessoVinculo, setSucessoVinculo] = useState(null);

  useEffect(() => {
    api
      .get("/user/gerentes")
      .then((lista) => {
        setGerentes(lista);
        setGerenteId(lista[0]?.id ?? "");
      })
      .catch((err) => setErro(err instanceof ApiError ? err.detail : "Erro ao buscar coordenadores."));
  }, []);

  useEffect(() => {
    if (!gerenteId) return;
    setCampanhas(null);
    api
      .get(`/campanhas/de-gerente/${gerenteId}`)
      .then(setCampanhas)
      .catch((err) => setErro(err instanceof ApiError ? err.detail : "Erro ao buscar campanhas do coordenador."));
  }, [gerenteId]);

  function carregarCampanhasSemCoordenador() {
    api
      .get("/campanhas/sem-coordenador")
      .then((lista) => {
        setCampanhasSemCoordenador(lista);
        setCampanhaParaVincularId((prev) => prev || lista[0]?.id || "");
      })
      .catch((err) =>
        setErroVinculo(err instanceof ApiError ? err.detail : "Erro ao buscar campanhas sem coordenador.")
      );
  }

  useEffect(() => {
    carregarCampanhasSemCoordenador();
  }, []);

  async function handleVincular(e) {
    e.preventDefault();
    if (!gerenteId || !campanhaParaVincularId) return;

    setErroVinculo(null);
    setSucessoVinculo(null);
    setVinculando(true);
    try {
      await api.postJson(`/campanhas/${campanhaParaVincularId}/coordenador`, {
        coordenador_id: Number(gerenteId),
      });
      setSucessoVinculo("Campanha vinculada ao coordenador com sucesso.");
      setCampanhaParaVincularId("");
      carregarCampanhasSemCoordenador();
      // se essa é a campanha do coordenador que já está selecionado na
      // visão acima, recarrega a lista dele também
      api.get(`/campanhas/de-gerente/${gerenteId}`).then(setCampanhas).catch(() => {});
    } catch (err) {
      setErroVinculo(err instanceof ApiError ? err.detail : "Erro ao vincular. Tenta de novo.");
    } finally {
      setVinculando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/inicio" className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Campanhas por coordenador</h1>
        <p className="mb-6 text-sm text-slate-500">Escolha um coordenador pra ver as campanhas do time dele.</p>

        {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

        {gerentes === null && !erro && <p className="text-sm text-slate-400">Carregando coordenadores…</p>}

        {gerentes?.length === 0 && <EmptyState message="Nenhum coordenador cadastrado ainda." />}

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

        {gerentes && gerentes.length > 0 && (
          <form
            onSubmit={handleVincular}
            className="mb-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex sm:items-end sm:gap-3"
          >
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-slate-700">Vincular campanha a esse coordenador</label>
              {campanhasSemCoordenador === null && !erroVinculo && (
                <p className="text-xs text-slate-400">Carregando campanhas sem coordenador…</p>
              )}
              {campanhasSemCoordenador?.length === 0 && (
                <p className="text-xs text-slate-400">Não há campanhas sem coordenador no momento.</p>
              )}
              {campanhasSemCoordenador && campanhasSemCoordenador.length > 0 && (
                <select
                  value={campanhaParaVincularId}
                  onChange={(e) => setCampanhaParaVincularId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  {campanhasSemCoordenador.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={vinculando || !campanhaParaVincularId}
              className="mt-3 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60 sm:mt-0 sm:w-auto"
            >
              {vinculando ? "Vinculando…" : "Vincular"}
            </button>
          </form>
        )}

        {erroVinculo && <p className="mb-4 text-sm text-red-600">{erroVinculo}</p>}
        {sucessoVinculo && <p className="mb-4 text-sm text-green-600">{sucessoVinculo}</p>}

        {campanhas === null && gerenteId && <p className="text-sm text-slate-400">Carregando campanhas…</p>}

        {campanhas?.length === 0 && (
          <EmptyState message="Esse coordenador ainda não tem nenhuma campanha no time." />
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