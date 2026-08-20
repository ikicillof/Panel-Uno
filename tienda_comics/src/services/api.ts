import type { Comic } from "../data/comics";

const BASE = "http://localhost:3001/api";

export type SelectOption = { id: number; name: string };

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  getComics: ()                        => get<Comic[]>("/comics"),
  getComic:  (id: number)              => get<Comic>(`/comics/${id}`),
  createComic: (data: ComicPayload)    => send<Comic>("POST", "/comics", data),
  updateComic: (id: number, data: ComicPayload) => send<Comic>("PUT", `/comics/${id}`, data),
  deleteComic: (id: number)            => send<{ ok: boolean }>("DELETE", `/comics/${id}`),

  checkout: (items: { id: number; quantity: number }[]) =>
    send<{ ok: boolean }>("POST", "/checkout", items),

  getGeneros:      () => get<SelectOption[]>("/generos"),
  getEditoriales:  () => get<SelectOption[]>("/editoriales"),
  getFranquicias:  () => get<SelectOption[]>("/franquicias"),
  getAutores:      () => get<SelectOption[]>("/autores"),
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
