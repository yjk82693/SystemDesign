import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import MainLayout from "./layouts/MainLayout";
import UserTable from "./pages/admin/UserTable";
import ProjectTable from "./pages/admin/ProjectTable";
import type { User } from "./types";

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5001/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Invalid token");
      })
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, []);

  async function handleLogin(token: string) {
    localStorage.setItem("token", token);
    try {
      const res = await fetch("http://localhost:5001/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch {
      localStorage.removeItem("token");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  const isAdmin = user?.position === "ADMIN" || user?.position === "FOUNDER";

  return (
    <BrowserRouter>
      <Routes>
        {!user && (
          <>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {user && (
          <Route element={<MainLayout onLogout={logout} user={user} />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Home />} />

            {/* Feature pages (placeholders) */}
            <Route path="/feedback" element={<div style={{ padding: 24 }}>Feedback — coming soon</div>} />
            <Route path="/chat" element={<div style={{ padding: 24 }}>Group Chat — coming soon</div>} />
            <Route path="/resources" element={<div style={{ padding: 24 }}>Resources — coming soon</div>} />
            <Route path="/guides" element={<div style={{ padding: 24 }}>Guide Videos — coming soon</div>} />
            <Route path="/profile" element={<div style={{ padding: 24 }}>User Profile — coming soon</div>} />

            {/* Settings */}
            <Route path="/settings" element={<div style={{ padding: 24 }}>Settings — coming soon</div>} />

            {/* Admin Routes */}
            <Route
              path="/admin/users"
              element={isAdmin ? <UserTable /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/admin/projects"
              element={isAdmin ? <ProjectTable /> : <Navigate to="/dashboard" />}
            />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;