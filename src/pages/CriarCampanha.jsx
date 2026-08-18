import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError, mediaUrl } from "../api/client";

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
  local_id: "",
  folder_image: "",
};

export default function CriarCampanha() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [locais, setLocais] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api
      .get("/locais/")
      .then((lista) => {
        setLocais(lista);
        setForm((prev) => ({ ...prev, local_id: prev.local_id || lista[0]?.id || "" }));
      })
      .catch(() => setLocais([]));
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const { url } = await api.postForm("/campanhas/upload-imagem", { file });
      updateField("folder_image", url);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erro ao enviar a imagem. Tenta de novo.");
      updateField("folder_image", "");
    } finally {
      setUploading(false);
    }
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
        local_id: form.local_id ? Number(form.local_id) : null,
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
        <p className="mb-6 text-sm text-slate-500">Gera o material personalizado pra divulgar a campanha.</p>

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

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Região (local)</label>
            {locais === null && <p className="text-xs text-slate-400">Carregando locais…</p>}
            {locais?.length === 0 && (
              <p className="text-xs text-slate-400">
                Nenhum local cadastrado ainda. Cadastre um local antes de criar a campanha.
              </p>
            )}
            {locais && locais.length > 0 && (
              <select
                value={form.local_id}
                onChange={(e) => updateField("local_id", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {locais.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Field
            label="Link (opcional)"
            required={false}
            value={form.url}
            onChange={(v) => updateField("url", v)}
            placeholder="https://…"
          />

          <div className="border-t border-slate-100 pt-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Imagem base</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
              {uploading && <p className="text-xs text-slate-400">Enviando imagem…</p>}
              {!uploading && form.folder_image && (
                <img
                  src={mediaUrl(form.folder_image)}
                  alt="Prévia da imagem base"
                  className="mt-2 h-32 w-auto rounded-lg border border-slate-200 object-contain"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading || !form.folder_image}
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