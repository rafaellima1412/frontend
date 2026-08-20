import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../api/client";
import EmptyState from "../components/EmptyState";

export default function Desempenho() {
  const { user } = useAuth();
  const escopo = user?.role === "gerente" ? "geral" : "time";
  const voltarPara = user?.role === "gerente" ? "/inicio" : "/gerente";

  const [ranking, setRanking] = useState(null);
  const [pontos, setPontos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/carteira/ranking/${escopo}`)
      .then(setRanking)
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erro ao carregar ranking."));

    api
      .get(`/carteira/mapa-vendas/${escopo}`)
      .then(setPontos)
      .catch(() => setPontos([])); // mapa é complementar — falha aqui não deve travar o ranking
  }, [escopo]);

  const maiorTotal = Math.max(1, ...(pontos ?? []).map((p) => p.total_vendas));
  const centro = pontos?.length
    ? [pontos[0].latitude, pontos[0].longitude]
    : [-14.235, -51.9253]; // centro aproximado do Brasil, usado só se não houver pontos ainda

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to={voltarPara} className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Desempenho</h1>
        <p className="mb-6 text-sm text-slate-500">
          {user?.role === "gerente" ? "Vendas da empresa toda." : "Vendas do seu time."}
        </p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Ranking de vendedores
          </h2>

          {ranking === null && !error && <p className="text-sm text-slate-400">Carregando…</p>}
          {ranking?.length === 0 && <EmptyState message="Nenhum colaborador nesse escopo ainda." />}

          {ranking && ranking.length > 0 && (
            <ol className="divide-y divide-slate-200 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              {ranking.map((r, i) => (
                <li key={r.usuario_id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      i === 0
                        ? "bg-amber-100 text-amber-700"
                        : i === 1
                          ? "bg-slate-200 text-slate-600"
                          : i === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-ink-900">{r.full_name}</span>
                  <span className="text-sm font-semibold text-brand-700">
                    {r.total_vendido} {r.total_vendido === 1 ? "venda" : "vendas"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Mapa de pontos quentes
          </h2>

          {pontos === null && <p className="text-sm text-slate-400">Carregando mapa…</p>}
          {pontos?.length === 0 && (
            <EmptyState message="Nenhuma venda vinculada a um local ainda — vendas aparecem aqui assim que a campanha tiver uma região definida." />
          )}

          {pontos && pontos.length > 0 && (
            <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200" style={{ height: 420 }}>
              <MapContainer center={centro} zoom={pontos.length > 1 ? 5 : 11} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {pontos.map((p) => (
                  <CircleMarker
                    key={p.local_id}
                    center={[p.latitude, p.longitude]}
                    radius={8 + (p.total_vendas / maiorTotal) * 24}
                    pathOptions={{
                      color: "#dc2626",
                      fillColor: "#ef4444",
                      fillOpacity: 0.5 + (p.total_vendas / maiorTotal) * 0.3,
                    }}
                  >
                    <Tooltip>
                      {p.nome}: {p.total_vendas} {p.total_vendas === 1 ? "venda" : "vendas"}
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
