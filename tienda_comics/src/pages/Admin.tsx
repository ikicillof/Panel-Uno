import { useState } from "react";
import { useStore } from "../context/StoreContext";
import type { ComicPayload } from "../services/api";
import type { Comic } from "../data/comics";

const BLANK: ComicPayload = {
  title: "",
  synopsis: "",
  year: new Date().getFullYear(),
  featured: false,
  price: 0,
  stock: 0,
  cover: "",
  publisherId: 0,
  franchiseId: 0,
  authorId: 0,
  genreId: 0,
};

export default function Admin() {
  const { comics, loading, apiOnline, addComic, updateComic, deleteComic, generos, editoriales, franquicias, autores } = useStore();
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ComicPayload>(BLANK);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const filtered = comics.filter(
    (c) =>
      search === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.publisher.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(BLANK);
    setEditId(null);
    setMode("add");
  };

  const openEdit = (comic: Comic) => {
    setForm({
      title: comic.title,
      synopsis: comic.synopsis,
      year: comic.year,
      featured: comic.featured,
      price: comic.price,
      stock: comic.stock,
      cover: comic.cover,
      publisherId: comic.publisherId ?? 0,
      franchiseId: comic.franchiseId ?? 0,
      authorId: comic.authorId ?? 0,
      genreId: comic.genreId ?? 0,
    });
    setEditId(comic.id);
    setMode("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === "edit" && editId !== null) {
        await updateComic(editId, form);
      } else {
        await addComic(form);
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); setMode("list"); }, 1200);
    } catch {
      alert("Error al guardar. Revisá la consola.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteComic(id);
    setConfirmDelete(null);
  };

  const set = (key: keyof ComicPayload, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const textInput = (label: string, key: keyof ComicPayload, type = "text") => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-black uppercase tracking-widest text-[#6b6672]" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </label>
      <input
        type={type}
        value={String(form[key])}
        onChange={(e) => set(key, type === "number" ? Number(e.target.value) : e.target.value)}
        className="bg-white text-[#0d0b0e] px-3 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#ffd600]"
        style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-body)" }}
      />
    </div>
  );

  const selectInput = (label: string, key: keyof ComicPayload, options: { id: number; name: string }[]) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-black uppercase tracking-widest text-[#6b6672]" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
        {!apiOnline && <span className="ml-2 text-[#e8001c] normal-case">(sin API — se guardará localmente)</span>}
      </label>
      <select
        value={Number(form[key])}
        onChange={(e) => set(key, Number(e.target.value))}
        className="bg-white text-[#0d0b0e] px-3 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#ffd600]"
        style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-body)" }}
      >
        <option value={0}>— Seleccioná —</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-4xl text-[#0d0b0e]/30 animate-pulse" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
          CARGANDO...
        </p>
      </div>
    );
  }

  if (mode === "add" || mode === "edit") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[#e8001c] text-xs uppercase tracking-widest font-black mb-1" style={{ fontFamily: "var(--font-mono)" }}>
              Panel de administración
            </p>
            <h1 className="text-[#0d0b0e] leading-none" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "0.04em" }}>
              {mode === "edit" ? "EDITAR CÓMIC" : "NUEVO CÓMIC"}
            </h1>
          </div>
          <button onClick={() => setMode("list")} className="text-sm font-black uppercase tracking-widest text-[#6b6672] hover:text-[#e8001c] transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
            ← Cancelar
          </button>
        </div>

        {/* Status badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-black uppercase tracking-widest ${apiOnline ? "bg-green-100 text-green-800" : "bg-[#ffd600]/40 text-[#0d0b0e]"}`} style={{ border: "2px solid currentColor", fontFamily: "var(--font-mono)" }}>
          <span className={`w-2 h-2 rounded-full ${apiOnline ? "bg-green-600" : "bg-[#e8001c]"}`} />
          {apiOnline ? "Conectado a MySQL" : "Modo offline — datos locales"}
        </div>

        <div className="bg-white p-6 comic-border-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
          {textInput("Título", "title")}
          {textInput("Año de lanzamiento", "year", "number")}
          {textInput("Precio (ARS)", "price", "number")}
          {textInput("Stock", "stock", "number")}
          {selectInput("Editorial", "publisherId", editoriales)}
          {selectInput("Franquicia", "franchiseId", franquicias)}
          {selectInput("Autor", "authorId", autores)}
          {selectInput("Género", "genreId", generos)}
          {textInput("URL de portada", "cover")}

          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-black uppercase tracking-widest text-[#6b6672]" style={{ fontFamily: "var(--font-mono)" }}>
              Sinopsis
            </label>
            <textarea
              value={form.synopsis}
              onChange={(e) => set("synopsis", e.target.value)}
              rows={3}
              className="bg-white text-[#0d0b0e] px-3 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#ffd600] resize-none"
              style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-body)" }}
            />
          </div>

          {/* Featured toggle */}
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              onClick={() => set("featured", !form.featured)}
              className={`w-12 h-6 relative transition-colors ${form.featured ? "bg-[#0057d9]" : "bg-[#0d0b0e]/20"}`}
              style={{ border: "2px solid #0d0b0e" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 bg-white transition-all"
                style={{ border: "1.5px solid #0d0b0e", left: form.featured ? "calc(100% - 18px)" : "2px" }}
              />
            </button>
            <span className="text-xs font-black uppercase tracking-widest text-[#0d0b0e]" style={{ fontFamily: "var(--font-mono)" }}>
              Destacado en portada
            </span>
          </div>
        </div>

        {form.cover && form.cover.trim() !== "" && (
          <div className="mt-4 flex items-center gap-4">
            <img src={form.cover || undefined} alt="preview" className="w-20 h-28 object-cover" style={{ border: "2px solid #0d0b0e" }} />
            <p className="text-xs text-[#6b6672] font-semibold">Vista previa de portada</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={!form.title || saving}
            className={`px-8 py-3 font-black uppercase tracking-widest text-lg transition-colors comic-border ${
              saved ? "bg-[#0057d9] text-white"
              : !form.title || saving ? "bg-[#6b6672]/20 text-[#6b6672] cursor-not-allowed"
              : "bg-[#ffd600] text-[#0d0b0e] hover:bg-[#e8001c] hover:text-white"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {saved ? "¡Guardado!" : saving ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Crear cómic"}
          </button>
          <button onClick={() => setMode("list")} className="px-6 py-3 font-black uppercase tracking-widest text-sm text-[#6b6672] hover:text-[#e8001c] transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // ── Vista lista ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-[#e8001c] text-xs uppercase tracking-widest font-black mb-1" style={{ fontFamily: "var(--font-mono)" }}>
            Panel de administración
          </p>
          <h1 className="text-[#0d0b0e] leading-none" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "0.04em" }}>
            INVENTARIO
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest ${apiOnline ? "bg-green-100 text-green-800" : "bg-[#ffd600]/40 text-[#0d0b0e]"}`} style={{ border: "2px solid currentColor", fontFamily: "var(--font-mono)" }}>
            <span className={`w-2 h-2 rounded-full ${apiOnline ? "bg-green-600" : "bg-[#e8001c]"}`} />
            {apiOnline ? "MySQL conectado" : "Offline"}
          </div>
          <button onClick={openAdd} className="bg-[#e8001c] text-white font-black px-6 py-3 uppercase tracking-widest hover:bg-[#0d0b0e] transition-colors comic-border" style={{ fontFamily: "var(--font-mono)" }}>
            + Nuevo cómic
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar por título o editorial..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md bg-white text-[#0d0b0e] px-4 py-2 font-semibold placeholder:text-[#6b6672] outline-none focus:ring-2 focus:ring-[#ffd600] mb-6"
        style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-body)" }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total títulos", value: comics.length },
          { label: "En stock", value: comics.reduce((s, c) => s + c.stock, 0) },
          { label: "Destacados", value: comics.filter((c) => c.featured).length },
          { label: "Valor total", value: `$${comics.reduce((s, c) => s + c.price * c.stock, 0).toLocaleString("es-AR")}` },
        ].map((s) => (
          <div key={s.label} className="bg-[#0d0b0e] text-center p-4" style={{ border: "3px solid #0d0b0e" }}>
            <p className="text-[#ffd600] text-3xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}>{s.value}</p>
            <p className="text-white/50 text-xs uppercase tracking-widest font-black mt-1" style={{ fontFamily: "var(--font-mono)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ border: "3px solid #0d0b0e" }}>
        <table className="w-full">
          <thead>
            <tr className="bg-[#0d0b0e] text-white">
              {["Portada", "Título", "Franquicia", "Autor", "Editorial", "Género", "Año", "Precio ARS", "Stock", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((comic, i) => (
              <tr key={comic.id} className={`${i % 2 === 0 ? "bg-white" : "bg-[#f5f0e8]"} border-b-2 border-[#0d0b0e]/10 hover:bg-[#ffd600]/20 transition-colors`}>
                <td className="px-4 py-3">
                  <div className="w-10 h-14 overflow-hidden bg-[#0d0b0e]" style={{ border: "2px solid #0d0b0e" }}>
                    {comic.cover && <img src={comic.cover || undefined} alt={comic.title} className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-black text-[#0d0b0e] leading-tight" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em", fontSize: "1rem" }}>{comic.title}</p>
                  {comic.featured && <span className="bg-[#0057d9] text-white px-1.5 py-0.5 text-xs font-black" style={{ fontFamily: "var(--font-mono)" }}>★ Destacado</span>}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-[#6b6672]">{comic.franchise}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#6b6672]">{comic.author}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#6b6672]">{comic.publisher}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#6b6672]">{comic.genre}</td>
                <td className="px-4 py-3 text-sm font-black" style={{ fontFamily: "var(--font-mono)" }}>{comic.year}</td>
                <td className="px-4 py-3 font-black text-[#e8001c]">${comic.price.toLocaleString("es-AR")}</td>
                <td className="px-4 py-3">
                  <span className={`font-black text-sm px-2 py-0.5 ${comic.stock === 0 ? "bg-[#e8001c]/20 text-[#e8001c]" : comic.stock <= 3 ? "bg-[#ffd600]/40 text-[#0d0b0e]" : "bg-[#0057d9]/10 text-[#0057d9]"}`} style={{ fontFamily: "var(--font-mono)" }}>
                    {comic.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(comic)} className="bg-[#0057d9] text-white text-xs font-black px-3 py-1.5 uppercase tracking-widest hover:bg-[#0d0b0e] transition-colors" style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-mono)" }}>Editar</button>
                    <button onClick={() => setConfirmDelete(comic.id)} className="bg-white text-[#e8001c] text-xs font-black px-3 py-1.5 uppercase tracking-widest hover:bg-[#e8001c] hover:text-white transition-colors" style={{ border: "2px solid #e8001c", fontFamily: "var(--font-mono)" }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete modal */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white p-8 max-w-sm w-full" style={{ border: "4px solid #0d0b0e", boxShadow: "8px 8px 0 #e8001c" }}>
            <h2 className="text-[#0d0b0e] text-3xl mb-3" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}>¿ELIMINAR?</h2>
            <p className="text-[#6b6672] font-semibold mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-[#e8001c] text-white font-black py-3 uppercase tracking-widest hover:bg-[#0d0b0e] transition-colors" style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-mono)" }}>Sí, eliminar</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-white text-[#0d0b0e] font-black py-3 uppercase tracking-widest hover:bg-[#f5f0e8] transition-colors" style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-mono)" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
