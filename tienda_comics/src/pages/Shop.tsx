import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { GENRES, PUBLISHERS } from "../data/comics";

export default function Shop() {
  const { comics, addToCart } = useStore();
  const [genre, setGenre] = useState("Todos");
  const [publisher, setPublisher] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "year" | "title">("title");
  const [added, setAdded] = useState<number | null>(null);

  const filtered = comics
    .filter((c) => {
      const matchGenre = genre === "Todos" || c.genre === genre;
      const matchPub = publisher === "Todos" || c.publisher === publisher;
      const matchSearch =
        search === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.author.toLowerCase().includes(search.toLowerCase());
      return matchGenre && matchPub && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "year") return b.year - a.year;
      return a.title.localeCompare(b.title);
    });

  const handleAddToCart = (e: React.MouseEvent, comic: (typeof comics)[number]) => {
    e.preventDefault();
    addToCart(comic);
    setAdded(comic.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <p
          className="text-[#e8001c] text-sm uppercase tracking-widest font-black mb-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Catálogo completo
        </p>
        <h1
          className="text-[#0d0b0e] leading-none"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 7vw, 5.5rem)",
            letterSpacing: "0.04em",
          }}
        >
          TIENDA
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-[#0d0b0e] p-4 mb-8 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Buscar cómic o autor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white text-[#0d0b0e] px-4 py-2 font-semibold placeholder:text-[#6b6672] outline-none focus:ring-2 focus:ring-[#ffd600]"
          style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-body)" }}
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="bg-white text-[#0d0b0e] px-4 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#ffd600]"
          style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-mono)" }}
        >
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
          className="bg-white text-[#0d0b0e] px-4 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#ffd600]"
          style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-mono)" }}
        >
          {PUBLISHERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-white text-[#0d0b0e] px-4 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#ffd600]"
          style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-mono)" }}
        >
          <option value="title">Ordenar: A–Z</option>
          <option value="price-asc">Precio: menor</option>
          <option value="price-desc">Precio: mayor</option>
          <option value="year">Más reciente</option>
        </select>
      </div>

      <p
        className="text-[#6b6672] text-xs uppercase tracking-widest font-black mb-6"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p
            className="text-5xl text-[#0d0b0e]/20 mb-4"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
          >
            SIN RESULTADOS
          </p>
          <p className="text-[#6b6672] font-semibold">Probá con otros filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((comic) => (
            <Link
              key={comic.id}
              to={`/comic/${comic.id}`}
              className="block bg-white hover-lift comic-border group relative"
            >
              <div className="relative overflow-hidden h-64 bg-[#0d0b0e]">
                <img
                  src={comic.cover || undefined}
                  alt={comic.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {comic.stock <= 3 && comic.stock > 0 && (
                  <div className="absolute top-2 left-2">
                    <span
                      className="bg-[#ffd600] text-[#0d0b0e] text-xs px-2 py-0.5 font-black"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      ¡Últimos!
                    </span>
                  </div>
                )}
                {comic.stock === 0 && (
                  <div className="absolute top-2 left-2">
                    <span
                      className="bg-[#6b6672] text-white text-xs px-2 py-0.5 font-black"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Agotado
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p
                  className="text-xs text-[#6b6672] uppercase tracking-widest font-black mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {comic.publisher} · {comic.genre} · {comic.year}
                </p>
                <h3
                  className="text-[#0d0b0e] leading-tight mb-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  {comic.title}
                </h3>
                <p className="text-xs text-[#6b6672] font-semibold mb-3">{comic.author}</p>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#e8001c] font-black text-xl">
                    ${comic.price.toLocaleString("es-AR")}
                  </span>
                  <button
                    onClick={(e) => handleAddToCart(e, comic)}
                    disabled={comic.stock === 0}
                    className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
                      added === comic.id
                        ? "bg-[#0057d9] text-white"
                        : comic.stock === 0
                        ? "bg-[#6b6672]/20 text-[#6b6672] cursor-not-allowed"
                        : "bg-[#0d0b0e] text-[#ffd600] hover:bg-[#e8001c]"
                    }`}
                    style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-mono)" }}
                  >
                    {added === comic.id ? "¡Listo!" : comic.stock === 0 ? "Agotado" : "+ Carrito"}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
