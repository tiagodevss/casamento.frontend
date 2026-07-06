import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App";
import ConfirmarPage from "./ConfirmarPage";
import PresentesPage from "./PresentesPage";
import { AdminShell } from "./admin/AdminShell";
import { AdminLogin } from "./admin/AdminLogin";
import { AuthProvider, RequireAuth } from "./admin/AuthContext";
import "../app.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/confirmar" element={<ConfirmarPage />} />
          <Route path="/presentes" element={<PresentesPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminShell />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
