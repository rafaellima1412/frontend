const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "2026-08-01T20:46:35.388000" -> "1 ago 2026" */
export function formatDate(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;

  const parts = Object.fromEntries(dateFormatter.formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.day} ${parts.month.replace(".", "")} ${parts.year}`;
}

const POST_TYPE_LABELS = {
  promocao: "Promoção",
  institucional: "Institucional",
  lancamento: "Lançamento",
};

/** "promocao" -> "Promoção" (com fallback pra qualquer tipo novo que o back mandar) */
export function formatPostType(postType) {
  if (!postType) return null;
  return POST_TYPE_LABELS[postType] ?? postType.charAt(0).toUpperCase() + postType.slice(1);
}

const ROLE_LABELS = {
  colaborador: "Colaborador",
  gerente: "Gerente",
  coordenador: "Coordenador",
  admin: "Admin",
};

export function formatRole(role) {
  return ROLE_LABELS[role] ?? role;
}