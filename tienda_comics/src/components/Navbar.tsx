import { Link, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useState } from "react";

export default function Navbar() {
  const { cart, cartCount, cartTotal, removeFromCart, checkout } = useStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const handleCheckout = async () => {
    setPurchasing(true);
    try {
      await checkout();
      setPurchased(true);
      setTimeout(() => {
        setPurchased(false);
        setCartOpen(false);
      }, 2000);
    } catch {
      alert("Error al procesar la compra. Revisá el stock disponible.");
    } finally {
      setPurchasing(false);
    }
  };
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/tienda", label: "Tienda" },
    { to: "/admin", label: "Admin" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0d0b0e] border-b-4 border-[#ffd600]">
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="flex items-center shrink-0 group">
            <div
              className="bg-[#e8001c] px-2 py-0.5 rotate-[-2deg] group-hover:rotate-0 transition-transform"
              style={{ border: "2px solid #ffd600" }}
            >
              <span
                className="text-[#ffd600] text-xl tracking-wider"
                style={{ fontFamily: "var(--font-display)" }}
              >
                PANEL UNO
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 font-bold text-sm tracking-widest transition-colors uppercase ${
                  location.pathname === link.to
                    ? "bg-[#ffd600] text-[#0d0b0e]"
                    : "text-[#f5f0e8] hover:text-[#ffd600]"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: cart + hamburger */}
          <div className="flex items-center gap-2">
            {/* Cart — always visible */}
            <button
              onClick={() => setCartOpen(true)}
              className="bg-[#ffd600] px-3 py-2 font-bold text-[#0d0b0e] flex items-center gap-1.5 hover:bg-[#e8001c] hover:text-white transition-colors"
              style={{ border: "2px solid #ffd600" }}
              aria-label="Abrir carrito"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" fill="none" />
              </svg>
              <span className="text-sm font-black" style={{ fontFamily: "var(--font-mono)" }}>
                {cartCount}
              </span>
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 hover:bg-white/10 transition-colors"
              aria-label="Menú"
            >
              <span
                className={`block w-6 h-0.5 bg-[#f5f0e8] transition-all origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block w-6 h-0.5 bg-[#f5f0e8] transition-all ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
              />
              <span
                className={`block w-6 h-0.5 bg-[#f5f0e8] transition-all origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t-2 border-[#ffd600]/30">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={`flex items-center px-6 py-4 font-black text-sm tracking-widest uppercase border-b border-white/10 transition-colors ${
                  location.pathname === link.to
                    ? "bg-[#ffd600] text-[#0d0b0e]"
                    : "text-[#f5f0e8] hover:bg-white/10"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />
          <div
            className="relative w-full max-w-md bg-[#f5f0e8] h-full flex flex-col"
            style={{ borderLeft: "4px solid #0d0b0e" }}
          >
            <div className="bg-[#0d0b0e] px-6 py-4 flex items-center justify-between">
              <h2
                className="text-[#ffd600] text-3xl"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}
              >
                TU CARRITO
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-white hover:text-[#ffd600] text-2xl font-black"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <p
                    className="text-6xl mb-4"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
                  >
                    VACÍO
                  </p>
                  <p className="text-[#6b6672] font-semibold">Aún no agregaste ningún cómic</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.comic.id} className="bg-white flex gap-3 p-3 comic-border">
                    <img
                      src={item.comic.cover || undefined}
                      alt={item.comic.title}
                      className="w-16 h-24 object-cover bg-[#0d0b0e]"
                      style={{ border: "2px solid #0d0b0e" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-black leading-tight"
                        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em", fontSize: "1rem" }}
                      >
                        {item.comic.title}
                      </p>
                      <p className="text-xs text-[#6b6672] font-semibold mt-0.5">{item.comic.author}</p>
                      <p className="text-sm font-black text-[#e8001c] mt-1">
                        x{item.quantity} — ${(item.comic.price * item.quantity).toLocaleString("es-AR")}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.comic.id)}
                      className="text-[#6b6672] hover:text-[#e8001c] font-black text-lg self-start"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t-4 border-[#0d0b0e]">
                <div className="flex justify-between items-center mb-4">
                  <span
                    className="text-xl font-black"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
                  >
                    TOTAL
                  </span>
                  <span className="text-2xl font-black text-[#e8001c]">
                    ${cartTotal.toLocaleString("es-AR")}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={purchasing || purchased}
                  className={`w-full font-black py-3 text-lg uppercase tracking-widest transition-colors comic-border ${
                    purchased
                      ? "bg-[#0057d9] text-white cursor-default"
                      : purchasing
                      ? "bg-[#6b6672] text-white cursor-wait"
                      : "bg-[#e8001c] text-white hover:bg-[#0d0b0e]"
                  }`}
                >
                  {purchased ? "¡Compra realizada! ✓" : purchasing ? "Procesando..." : "Finalizar Compra"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
