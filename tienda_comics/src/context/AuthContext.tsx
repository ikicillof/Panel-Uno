import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../services/api";

type AuthState = {
  token: string;
  email: string;
  isAdmin: boolean;
  expiresAt: number;
};

type AuthContextType = {
  auth: AuthState | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "pu_auth";

const AuthContext = createContext<AuthContextType | null>(null);

function readStored(): AuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed.token || parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readStored();
    if (!stored) {
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return;
    }
    api
      .getSession(stored.token)
      .then(() => setAuth(stored))
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setLoading(false));
  }, []);

  const register = async (email: string, password: string) => {
    await api.register(email, password);
  };

  const login = async (email: string, password: string) => {
    await api.login(email, password);
  };

  const verifyCode = async (email: string, code: string) => {
    const result = await api.verifyLoginCode(email, code);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    setAuth(result);
  };

  const forgotPassword = async (email: string) => {
    await api.forgotPassword(email);
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    await api.resetPassword(email, code, newPassword);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, loading, register, login, verifyCode, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
