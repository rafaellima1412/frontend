import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";

const EMPTY_FORM = { nome: "", latitude: "", longitude: "" };

export default function CriarLocal() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [locais, setLocais] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function carregarLocais() {
    api
      .get("/locais/")
      .then(setLocais)
      .catch(() => setLocais([]));
  }

  useEffect(() => {
    carregarLocais();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await api.postJson("/locais/", {
        nome: form.nome,
        coordenadas: {
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        },
      });
      setSuccess(`Local "${form.nome}" cadastrado.`);
      setForm(EMPTY_FORM);
      carregarLocais();
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erro ao cadastrar. Tenta de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/inicio" className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Cadastrar local</h1>
        <p className="mb-6 text-sm text-slate-500">
          Nome da região e as coordenadas (latitude/longitude) — usadas pra vincular campanhas a uma região e
          montar o mapa de vendas depois.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <Field label="Nome do local" value={form.nome} onChange={(v) => updateField("nome", v)} />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Latitude"
              type="number"
              step="any"
              value={form.latitude}
              onChange={(v) => updateField("latitude", v)}
              placeholder="-23.55"
            />
            <Field
              label="Longitude"
              type="number"
              step="any"
              value={form.longitude}
              onChange={(v) => updateField("longitude", v)}
              placeholder="-46.63"
            />
          </div>

          <p className="text-xs text-slate-400">
            Dica: abra o Google Maps, clique com o botão direito no ponto desejado e copie as coordenadas que
            aparecem no menu.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Cadastrando…" : "Cadastrar local"}
          </button>
        </form>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">Locais cadastrados</h2>

          {locais === null && <p className="text-sm text-slate-400">Carregando…</p>}
          {locais?.length === 0 && <p className="text-sm text-slate-400">Nenhum local cadastrado ainda.</p>}

          {locais && locais.length > 0 && (
            <ul className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              {locais.map((l) => (
                <li key={l.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-medium text-ink-900">{l.nome}</span>
                  <span className="text-xs text-slate-400">
                    {l.coordenadas.latitude.toFixed(4)}, {l.coordenadas.longitude.toFixed(4)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, step }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        step={step}
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
