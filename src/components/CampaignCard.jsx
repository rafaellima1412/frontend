import { mediaUrl } from "../api/client";
import { formatDate, formatPostType } from "../utils/format";

export default function CampaignCard({ campanha }) {
  const image = mediaUrl(campanha.image);
  const postTypeLabel = formatPostType(campanha.post_type);
  const dateLabel = formatDate(campanha.data_criacao);

  // url/folder_url/qrcode_url às vezes coincidem com a própria imagem (o QR
  // já vem colado nela) — só mostra o link de download quando aponta pra
  // algo que a pessoa ainda não está vendo no card.
  const downloadUrl = campanha.folder_url && campanha.folder_url !== campanha.image ? campanha.folder_url : null;
  const externalUrl = campanha.url && campanha.url !== campanha.image ? campanha.url : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      {image && (
        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img src={image} alt={campanha.title} className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          {postTypeLabel && (
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              {postTypeLabel}
            </span>
          )}
          {campanha.is_active === false && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
              Inativa
            </span>
          )}
        </div>

        <h3 className="font-medium text-ink-900">{campanha.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{campanha.paragraph}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          {dateLabel && <span className="text-xs text-slate-400">{dateLabel}</span>}

          <div className="flex gap-3">
            {downloadUrl && (
              <a
                href={mediaUrl(downloadUrl)}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                Baixar material
              </a>
            )}
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                Abrir link
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
