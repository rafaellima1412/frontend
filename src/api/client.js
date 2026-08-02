/**
 * Wrapper fino sobre fetch para conversar com a API FastAPI.
 *
 * - Sempre manda `credentials: "include"` porque a sessão é um cookie
 *   httponly (`access_token`), não um token que a gente guarda em JS.
 * - Em dev, os caminhos batem direto com o proxy configurado em
 *   vite.config.js (ex: "/user/login" vira "http://localhost:8000/user/login").
 * - Em produção, aponte VITE_API_URL para a URL real da API se o frontend
 *   não estiver atrás do mesmo proxy/reverse-proxy do backend.
 */

const API_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  let payload = body;

  if (body && !isForm) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: payload,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const detail = data?.detail ?? "Erro inesperado ao falar com o servidor.";
    throw new ApiError(detail, response.status, detail);
  }

  return data;
}

function toFormData(fields) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => form.append(key, item));
    } else {
      form.append(key, value);
    }
  });
  return form;
}

export const api = {
  get: (path) => request(path),
  postJson: (path, body) => request(path, { method: "POST", body }),
  putJson: (path, body) => request(path, { method: "PUT", body }),
  postForm: (path, fields) =>
    request(path, { method: "POST", body: toFormData(fields), isForm: true }),
  putForm: (path, fields) =>
    request(path, { method: "PUT", body: toFormData(fields), isForm: true }),
};
