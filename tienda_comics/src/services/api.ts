import type { Comic } from "../data/comics";

const BASE = "/api";

export type SelectOption = { id: number; name: string };

function authHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(BASE + path, { headers: authHeader(token) });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function send<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(data?.error || `${method} ${path} → ${res.status}`);
  }
  return res.json();
}

export const api = {
  getComics: ()                        => get<Comic[]>("/comics"),
  getComic:  (id: number)              => get<Comic>(`/comics/${id}`),
  createComic: (data: ComicPayload, token: string)              => send<Comic>("POST", "/comics", data, token),
  updateComic: (id: number, data: ComicPayload, token: string)  => send<Comic>("PUT", `/comics/${id}`, data, token),
  deleteComic: (id: number, token: string)                      => send<{ ok: boolean }>("DELETE", `/comics/${id}`, undefined, token),

  getMpPublicKey: () => get<{ publicKey: string }>("/mp-public-key"),

  processPayment: (formData: Record<string, unknown>, items: { id: number; quantity: number }[]) =>
    send<{ status: string; status_detail: string; id: number }>("POST", "/process-payment", { formData, items }),

  getGeneros:      () => get<SelectOption[]>("/generos"),
  getEditoriales:  () => get<SelectOption[]>("/editoriales"),
  getFranquicias:  () => get<SelectOption[]>("/franquicias"),
  getAutores:      () => get<SelectOption[]>("/autores"),

  register: (email: string, password: string) =>
    send<{ ok: boolean }>("POST", "/auth/register", { email, password }),
  login: (email: string, password: string) =>
    send<{ ok: boolean }>("POST", "/auth/login", { email, password }),
  verifyLoginCode: (email: string, code: string) =>
    send<{ token: string; email: string; isAdmin: boolean; expiresAt: number }>("POST", "/auth/verify", { email, code }),
  getSession: (token: string) =>
    get<{ email: string; isAdmin: boolean }>("/auth/session", token),
  forgotPassword: (email: string) =>
    send<{ ok: boolean }>("POST", "/auth/forgot-password", { email }),
  resetPassword: (email: string, code: string, newPassword: string) =>
    send<{ ok: boolean }>("POST", "/auth/reset-password", { email, code, newPassword }),

  getCart: (token: string) =>
    get<{ comicId: number; quantity: number }[]>("/cart", token),
  setCartItem: (comicId: number, quantity: number, token: string) =>
    send<{ ok: boolean }>("PUT", "/cart/item", { comicId, quantity }, token),
  removeCartItem: (comicId: number, token: string) =>
    send<{ ok: boolean }>("DELETE", `/cart/item/${comicId}`, undefined, token),
  clearServerCart: (token: string) =>
    send<{ ok: boolean }>("DELETE", "/cart", undefined, token),
};

export type ComicPayload = {
  title: string;
  synopsis: string;
  year: number;
  featured: boolean;
  price: number;
  stock: number;
  cover: string;
  publisherId: number;
  franchiseId: number;
  authorId: number;
  genreId: number;
};
