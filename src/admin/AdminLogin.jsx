import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Icon } from "../effects";
import { useAuth } from "./AuthContext";
import "./admin.css";

export function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from?.pathname ?? "/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm">
      <div className="adm-auth">
        <form className="adm-auth-card" onSubmit={submit} noValidate>
          <div className="adm-auth-header">
            <div className="adm-auth-mark">
              <Icon name="LayoutGrid" size={20} />
            </div>
            <h1 className="adm-auth-title">Painel administrativo</h1>
            <p className="adm-auth-sub">Entre com suas credenciais para continuar</p>
          </div>

          <div className="adm-field adm-field-full" style={{ marginBottom: "1rem" }}>
            <label htmlFor="adm-email">E-mail</label>
            <input
              id="adm-email"
              className="adm-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="adm-field adm-field-full" style={{ marginBottom: "1.4rem" }}>
            <label htmlFor="adm-password">Senha</label>
            <input
              id="adm-password"
              className="adm-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            {error && <span className="adm-error">{error}</span>}
          </div>

          <button type="submit" className="adm-btn adm-btn-primary adm-btn-block" disabled={submitting}>
            <Icon name="LogIn" size={16} /> {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
