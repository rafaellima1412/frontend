import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api/client";

const POST_TYPES = [
  { value: "promocao", label: "Promoção" },
  { value: "institucional", label: "Institucional" },
  { value: "lancamento", label: "Lançamento" },
];

const EMPTY_FORM = {
  title: "",
  paragraph: "",
  post_type: "promocao",
  url: "",
  cpf_usuario: "",
  matricula: "",
  folder_image: "",
};

export default function CriarCampanha() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.postJson("/campanhas/", {
        title: form.title,
        paragraph: form.paragraph,
        post_type: form.post_type,
        url: form.url || null,
        cpf_usuario: form.cpf_usuario,
        matricula: form.matricula,
        folder_image: form.folder_image,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erro ao criar campanha. Tenta de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/gerente" className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Criar campanha</h1>
        <p className="mb-6 text-sm text-slate-500">
          Gera o material personalizado (com QR code) pro colaborador informado.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <Field label="Título" value={form.title} onChange={(v) => updateField("title", v)} />
          <TextArea label="Texto" value={form.paragraph} onChange={(v) => updateField("paragraph", v)} />

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Tipo</label>
            <select
              value={form.post_type}
              onChange={(e) => updateField("post_type", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {POST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Link (opcional)"
            required={false}
            value={form.url}
            onChange={(v) => updateField("url", v)}
            placeholder="https://…"
          />

          <div className="border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-medium tracking-wide text-slate-400 uppercase">Colaborador</p>
            <div className="space-y-4">
              <Field label="CPF do colaborador" value={form.cpf_usuario} onChange={(v) => updateField("cpf_usuario", v)} />
              <Field label="Matrícula" value={form.matricula} onChange={(v) => updateField("matricula", v)} />
              <Field
                label="Imagem base (URL)"
                value={form.folder_image}
                onChange={(v) => updateField("folder_image", v)}
                placeholder="https://…/arte.png"
              />
              <p className="-mt-2 text-xs text-slate-400">
                O QR code (com CPF e matrícula) é colado automaticamente sobre essa imagem.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Gerando…" : "Criar campanha"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required = true }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        required
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
