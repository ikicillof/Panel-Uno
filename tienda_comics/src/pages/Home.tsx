import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Home() {
  const { comics } = useStore();
  const featured = comics.filter((c) => c.featured);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0d0b0e] min-h-[90vh] flex items-center">
        {/* Halftone bg */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, #ffd600 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
        />

        {/* Big diagonal stripe */}
        <div
          className="absolute top-0 right-0 w-[55%] h-full bg-[#e8001c]"
          style={{ clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)" }}
        />
        <div
          className="absolute top-0 right-0 w-[55%] h-full"
          style={{
            clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)",
            backgroundImage: "radial-gradient(circle, #0d0b0e33 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center py-20">
          {/* Left text */}
          <div>
            <div
              className="inline-block bg-[#ffd600] px-4 py-2 mb-6 rotate-[-1deg]"
              style={{ border: "3px solid #ffd600", boxShadow: "4px 4px 0 #ffd600" }}
            >
              <span
                className="text-[#0d0b0e] text-lg tracking-widest font-black uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Desde 1986
              </span>
            </div>

            <h1
              className="text-[#f5f0e8] leading-none mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(4rem, 10vw, 8rem)",
                letterSpacing: "0.04em",
                textShadow: "5px 5px 0 #e8001c",
              }}
            >
              PANEL
              <br />
              <span className="text-[#ffd600]" style={{ textShadow: "5px 5px 0 #0057d9" }}>
                UNO
              </span>
            </h1>

            <p className="text-[#f5f0e8]/80 text-xl font-semibold mb-10 max-w-md leading-relaxed">
              La tienda de cómics que necesitabas. Clásicos, rarezas y ediciones
              especiales. Todos los universos en un solo lugar.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/tienda"
                className="bg-[#ffd600] text-[#0d0b0e] font-black px-8 py-4 text-lg uppercase tracking-widest hover:bg-white transition-colors"
                style={{ border: "3px solid #ffd600", boxShadow: "5px 5px 0 #ffd600", fontFamily: "var(--font-mono)" }}
              >
                Ver Tienda →
              </Link>
              <button
                onClick={() => document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" })}
                className="text-[#ffd600] font-black px-8 py-4 text-lg uppercase tracking-widest hover:bg-[#ffd600] hover:text-[#0d0b0e] transition-colors"
                style={{ border: "3px solid #ffd600", fontFamily: "var(--font-mono)" }}
              >
                Destacados
              </button>
            </div>
          </div>

          {/* Right — stacked comic covers */}
          <div className="relative h-96 hidden md:block">
            {featured.slice(0, 3).map((comic, i) => (
              <div
                key={comic.id}
                className="absolute w-48 h-72 overflow-hidden"
                style={{
                  border: "4px solid #f5f0e8",
                  boxShadow: "6px 6px 0 #0d0b0e",
                  top: `${i * 28}px`,
                  left: `${i * 60}px`,
                  transform: `rotate(${[-4, 2, -1][i]}deg)`,
                  zIndex: 3 - i,
                }}
              >
                <img
                  src={comic.cover}
                  alt={comic.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-[#0d0b0e]/80 p-2">
                  <p
                    className="text-[#ffd600] text-xs"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
                  >
                    {comic.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-[#ffd600] border-y-4 border-[#0d0b0e] py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-around gap-4">
          {[
            { n: comics.length, label: "Títulos" },
            { n: comics.reduce((s, c) => s + c.stock, 0), label: "En Stock" },
            { n: new Set(comics.map((c) => c.publisher)).size, label: "Editoriales" },
            { n: "40+", label: "Años en el rubro" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span
                className="block text-[#0d0b0e] text-4xl"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
              >
                {stat.n}
              </span>
              <span
                className="text-[#0d0b0e]/70 text-xs uppercase tracking-widest font-black"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured */}
      <section id="featured" className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p
              className="text-[#e8001c] text-sm uppercase tracking-widest font-black mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Selección especial
            </p>
            <h2
              className="text-[#0d0b0e] leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                letterSpacing: "0.04em",
              }}
            >
              DESTACADOS
            </h2>
          </div>
          <Link
            to="/tienda"
            className="hidden md:inline-block text-sm font-black uppercase tracking-widest text-[#0057d9] hover:text-[#e8001c] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Ver todo →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((comic) => (
            <Link
              key={comic.id}
              to={`/comic/${comic.id}`}
              className="block bg-white hover-lift comic-border group"
            >
              <div className="relative overflow-hidden h-72 bg-[#0d0b0e]">
                <img
                  src={comic.cover}
                  alt={comic.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span
                    className="bg-[#e8001c] text-white text-xs px-2 py-1 font-black"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {comic.condition}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p
                  className="text-xs text-[#6b6672] uppercase tracking-widest font-black mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {comic.publisher} · #{comic.issue}
                </p>
                <h3
                  className="text-[#0d0b0e] leading-tight mb-3"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.3rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  {comic.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-[#e8001c] font-black text-xl">
                    ${comic.price.toFixed(2)}
                  </span>
                  <span
                    className="text-xs text-[#6b6672] font-black"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Stock: {comic.stock}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Genre callout */}
      <section className="bg-[#0057d9] py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              letterSpacing: "0.04em",
            }}
          >
            TODOS LOS{" "}
            <span className="text-[#ffd600]">GÉNEROS</span>
          </h2>
          <p className="text-white/80 text-lg font-semibold mb-10 max-w-xl mx-auto">
            Superhéroes, horror, novela gráfica, sci-fi, noir. Si existe en papel impreso,
            lo tenemos.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {["Superhero", "Horror", "Noir", "Fantasy", "Sci-Fi", "Drama", "Historia"].map(
              (g) => (
                <span
                  key={g}
                  className="bg-white/10 text-white px-5 py-2 font-black text-sm uppercase tracking-widest"
                  style={{ border: "2px solid white/30", fontFamily: "var(--font-mono)" }}
                >
                  {g}
                </span>
              )
            )}
          </div>
          <Link
            to="/tienda"
            className="inline-block bg-[#ffd600] text-[#0d0b0e] font-black px-10 py-4 text-lg uppercase tracking-widest hover:bg-white transition-colors"
            style={{ border: "3px solid #ffd600", fontFamily: "var(--font-mono)" }}
          >
            Explorar Catálogo →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d0b0e] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span
              className="text-[#ffd600] text-3xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}
            >
              PANEL UNO
            </span>
            <p className="text-white/40 text-sm mt-1 font-semibold">
              Tu tienda de cómics de confianza
            </p>
          </div>
          <p
            className="text-white/30 text-xs"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            © 2026 Panel Uno. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
