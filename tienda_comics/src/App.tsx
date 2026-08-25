import { BrowserRouter, Routes, Route } from "react-router-dom";
import { type ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ComicDetail from "./pages/ComicDetail";
import Admin from "./pages/Admin";

function AuthGate({ children }: { children: ReactNode }) {
  const { auth, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-4xl text-[#0d0b0e]/30 animate-pulse" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
          CARGANDO...
        </p>
      </div>
    );
  }

  if (!auth) return <Login />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <StoreProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tienda" element={<Shop />} />
                  <Route path="/comic/:id" element={<ComicDetail />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </StoreProvider>
      </AuthGate>
    </AuthProvider>
  );
}
