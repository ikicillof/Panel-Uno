import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";
type Screen = "credentials" | "verifyCode" | "forgotRequest" | "forgotReset";

export default function Login() {
  const { register, login, verifyCode, forgotPassword, resetPassword } = useAuth();
  const [screen, setScreen] = useState<Screen>("credentials");
  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const inputClass =
    "bg-white text-[#0d0b0e] px-3 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#ffd600]";
  const inputStyle = { border: "2px solid #0d0b0e", fontFamily: "var(--font-body)" };
  const labelClass = "text-xs font-black uppercase tracking-widest text-[#6b6672]";
  const labelStyle = { fontFamily: "var(--font-mono)" };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  const goToForgot = () => {
    setScreen("forgotRequest");
    setError(null);
    setNotice(null);
    setPassword("");
  };

  const backToCredentials = () => {
    setScreen("credentials");
    setMode("login");
    setError(null);
    setCode("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleSubmitCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "register" && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSending(true);
    try {
      if (mode === "register") {
        await register(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      setScreen("verifyCode");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      await verifyCode(email.trim(), code.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código incorrecto o vencido.");
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  const handleForgotRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await forgotPassword(email.trim());
      setScreen("forgotReset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el código. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setVerifying(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      setNotice("Contraseña actualizada. Iniciá sesión con tu contraseña nueva.");
      backToCredentials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código incorrecto o vencido.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f5f0e8]">
      <div
        className="bg-white p-8 max-w-sm w-full flex flex-col gap-4"
        style={{ border: "4px solid #0d0b0e", boxShadow: "8px 8px 0 #ffd600" }}
      >
        <div>
          <p className="text-[#e8001c] text-xs uppercase tracking-widest font-black mb-1" style={{ fontFamily: "var(--font-mono)" }}>
            Acceso restringido
          </p>
          <h1 className="text-[#0d0b0e] leading-none" style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", letterSpacing: "0.04em" }}>
            PANEL UNO
          </h1>
        </div>

        {notice && screen === "credentials" && (
          <p className="text-sm font-bold text-[#0057d9] bg-[#0057d9]/10 px-3 py-2" style={{ border: "2px solid #0057d9" }}>
            {notice}
          </p>
        )}

        {screen === "credentials" && (
          <>
            <div className="flex" style={{ border: "2px solid #0d0b0e" }}>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                  mode === "login" ? "bg-[#0d0b0e] text-white" : "bg-white text-[#6b6672]"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                  mode === "register" ? "bg-[#0d0b0e] text-white" : "bg-white text-[#6b6672]"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Registrarme
              </button>
            </div>

            <form onSubmit={handleSubmitCredentials} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelClass} style={labelStyle}>Gmail</label>
                <input
                  type="email"
                  autoFocus
                  required
                  placeholder="tu@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelClass} style={labelStyle}>Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {mode === "register" && (
                <div className="flex flex-col gap-1">
                  <label className={labelClass} style={labelStyle}>Repetir contraseña</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              )}

              {error && <p className="text-sm font-bold text-[#e8001c]">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="bg-[#e8001c] text-white font-black py-3 uppercase tracking-widest hover:bg-[#0d0b0e] transition-colors comic-border disabled:opacity-60"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {sending ? "Enviando..." : mode === "register" ? "Registrarme" : "Continuar"}
              </button>

              {mode === "login" && (
                <button
                  type="button"
                  onClick={goToForgot}
                  className="text-xs font-black uppercase tracking-widest text-[#6b6672] hover:text-[#e8001c] transition-colors self-center"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </form>
          </>
        )}

        {screen === "verifyCode" && (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-[#6b6672]">
              Te enviamos un código de 6 dígitos a <span className="text-[#0d0b0e]">{email}</span> para confirmar que sos vos. Revisá tu bandeja de entrada (y spam).
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              required
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="bg-white text-[#0d0b0e] px-3 py-2 font-black text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-[#ffd600]"
              style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-mono)" }}
            />
            {error && <p className="text-sm font-bold text-[#e8001c]">{error}</p>}
            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="bg-[#e8001c] text-white font-black py-3 uppercase tracking-widest hover:bg-[#0d0b0e] transition-colors comic-border disabled:opacity-60"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {verifying ? "Verificando..." : "Confirmar código"}
            </button>
            <button
              type="button"
              onClick={backToCredentials}
              className="text-xs font-black uppercase tracking-widest text-[#6b6672] hover:text-[#e8001c] transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ← Volver
            </button>
          </form>
        )}

        {screen === "forgotRequest" && (
          <form onSubmit={handleForgotRequest} className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-[#6b6672]">
              Ingresá tu gmail y te mandamos un código para elegir una contraseña nueva.
            </p>
            <div className="flex flex-col gap-1">
              <label className={labelClass} style={labelStyle}>Gmail</label>
              <input
                type="email"
                autoFocus
                required
                placeholder="tu@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            {error && <p className="text-sm font-bold text-[#e8001c]">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="bg-[#e8001c] text-white font-black py-3 uppercase tracking-widest hover:bg-[#0d0b0e] transition-colors comic-border disabled:opacity-60"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {sending ? "Enviando..." : "Enviar código"}
            </button>
            <button
              type="button"
              onClick={backToCredentials}
              className="text-xs font-black uppercase tracking-widest text-[#6b6672] hover:text-[#e8001c] transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ← Volver
            </button>
          </form>
        )}

        {screen === "forgotReset" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-[#6b6672]">
              Te enviamos un código a <span className="text-[#0d0b0e]">{email}</span>. Cargalo junto con tu nueva contraseña.
            </p>
            <div className="flex flex-col gap-1">
              <label className={labelClass} style={labelStyle}>Código</label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                required
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="bg-white text-[#0d0b0e] px-3 py-2 font-black text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-[#ffd600]"
                style={{ border: "2px solid #0d0b0e", fontFamily: "var(--font-mono)" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass} style={labelStyle}>Contraseña nueva</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass} style={labelStyle}>Repetir contraseña nueva</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            {error && <p className="text-sm font-bold text-[#e8001c]">{error}</p>}
            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="bg-[#e8001c] text-white font-black py-3 uppercase tracking-widest hover:bg-[#0d0b0e] transition-colors comic-border disabled:opacity-60"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {verifying ? "Guardando..." : "Cambiar contraseña"}
            </button>
            <button
              type="button"
              onClick={backToCredentials}
              className="text-xs font-black uppercase tracking-widest text-[#6b6672] hover:text-[#e8001c] transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ← Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
