import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useStore } from "../context/StoreContext";

export default function ComicDetail() {
  const { id } = useParams<{ id: string }>();
  const { comics, addToCart } = useStore();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const comic = comics.find((c) => c.id === Number(id));

  if (!comic) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <p
          className="text-6xl text-[#0d0b0e]/20"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
        >
          404
        </p>
        <p className="font-semibold text-[#6b6672]">Cómic no encontrado</p>
        <Link
          to="/tienda"
          className="bg-[#e8001c] text-white font-black px-6 py-3 uppercase tracking-widest hover:bg-[#0d0b0e] transition-colors comic-border"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← Volver a la tienda
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(comic);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = comics
    .filter((c) => c.id !== comic.id && c.genre === comic.genre)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 text-xs text-[#6b6672] font-black uppercase tracking-widest mb-8"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <button onClick={() => navigate(-1)} className="hover:text-[#e8001c] transition-colors">
          ← Volver
        </button>
        <span>/</span>
        <Link to="/tienda" className="hover:text-[#e8001c] transition-colors">
          Tienda
        </Link>
        <span>/</span>
        <span className="text-[#0d0b0e]">{comic.title}</span>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 mb-16">
        {/* Cover */}
        <div className="flex flex-col gap-4">
          <div
            className="relative overflow-hidden bg-[#0d0b0e] aspect-[2/3]"
            style={{ border: "4px solid #0d0b0e", boxShadow: "8px 8px 0 #0d0b0e" }}
          >
            <img
              src={comic.cover || undefined}
              alt={comic.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Price + CTA */}
          <div className="bg-[#0d0b0e] p-5" style={{ border: "3px solid #0d0b0e" }}>
            <div className="flex items-baseline gap-2 mb-4">
              <span
                className="text-[#ffd600] text-4xl"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
              >
                ${comic.price.toLocaleString("es-AR")}
              </span>
              <span
                className="text-white/40 text-xs font-black uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ARS
              </span>
            </div>
            <p
              className="text-white/60 text-xs font-black uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Stock disponible:{" "}
              <span className={comic.stock <= 3 ? "text-[#ffd600]" : "text-white"}>
                {comic.stock}
              </span>
            </p>
            <button
              onClick={handleAddToCart}
              disabled={comic.stock === 0}
              className={`w-full py-3 font-black text-lg uppercase tracking-widest transition-colors ${
                added
                  ? "bg-[#0057d9] text-white"
                  : comic.stock === 0
                  ? "bg-[#6b6672]/40 text-[#6b6672] cursor-not-allowed"
                  : "bg-[#ffd600] text-[#0d0b0e] hover:bg-[#e8001c] hover:text-white"
              }`}
              style={{ border: "3px solid #ffd600", fontFamily: "var(--font-mono)" }}
            >
              {added ? "¡Agregado al carrito!" : comic.stock === 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
          </div>
        </div>

        {/* Details */}
        <div>
          {/* Publisher */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="bg-[#e8001c] text-white px-3 py-1 text-sm font-black uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {comic.publisher}
            </span>
            <span
              className="text-[#6b6672] text-sm font-black uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {comic.year}
            </span>
          </div>

          <h1
            className="text-[#0d0b0e] leading-none mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              letterSpacing: "0.04em",
            }}
          >
            {comic.title}
          </h1>

          {/* Genre */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span
              className="bg-[#0d0b0e]/10 text-[#0d0b0e] text-xs px-3 py-1 font-black uppercase tracking-widest"
              style={{ border: "1.5px solid #0d0b0e44", fontFamily: "var(--font-mono)" }}
            >
              {comic.genre}
            </span>
          </div>

          {/* Synopsis */}
          <div
            className="bg-[#ffd600] p-5 mb-6"
            style={{ border: "3px solid #0d0b0e", boxShadow: "4px 4px 0 #0d0b0e" }}
          >
            <p
              className="text-xs font-black uppercase tracking-widest text-[#0d0b0e] mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Sinopsis
            </p>
            <p className="text-[#0d0b0e] font-semibold leading-relaxed text-base">
              {comic.synopsis}
            </p>
          </div>

          {/* Specs table */}
          <table className="w-full" style={{ border: "3px solid #0d0b0e" }}>
            <tbody>
              {[
                ["Franquicia", comic.franchise],
                ["Autor", comic.author],
                ["Editorial", comic.publisher],
                ["Año de lanzamiento", comic.year],
                ["Género", comic.genre],
              ].map(([label, value], i) => (
                <tr
                  key={String(label)}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#f5f0e8]"}
                >
                  <td
                    className="px-4 py-3 text-xs font-black uppercase tracking-widest text-[#6b6672] w-44"
                    style={{ fontFamily: "var(--font-mono)", borderRight: "2px solid #0d0b0e22" }}
                  >
                    {label}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#0d0b0e]">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2
            className="text-[#0d0b0e] mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.5rem",
              letterSpacing: "0.04em",
            }}
          >
            TAMBIÉN TE PUEDE INTERESAR
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((c) => (
              <Link
                key={c.id}
                to={`/comic/${c.id}`}
                className="block bg-white hover-lift comic-border group"
              >
                <div className="overflow-hidden h-48 bg-[#0d0b0e]">
                  <img
                    src={c.cover || undefined}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p
                    className="text-xs text-[#6b6672] font-black uppercase tracking-widest mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {c.year}
                  </p>
                  <p
                    className="leading-tight text-[#0d0b0e]"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em", fontSize: "1.1rem" }}
                  >
                    {c.title}
                  </p>
                  <p className="text-[#e8001c] font-black mt-1">
                    ${c.price.toLocaleString("es-AR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
