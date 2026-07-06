import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Icon } from "../effects";
import { useAuth } from "./AuthContext";

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="sky-backdrop" />
      <form
        className="glass"
        style={{ maxWidth: 420, width: "90%", padding: "clamp(1.8rem, 4vw, 2.6rem)" }}
        onSubmit={submit}
        noValidate
      >
        <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
          <span className="eyebrow">Área reservada</span>
          <h1
            className="section-title"
            style={{ fontSize: "clamp(1.4rem, 4vw, 1.9rem)", marginTop: ".4rem" }}
          >
            Entrar
          </h1>
        </div>

        <div className="field full">
          <label>
            <Icon name="Mail" size={14} /> E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            autoComplete="username"
            required
          />
        </div>

        <div className="field full">
          <label>
            <Icon name="Lock" size={14} /> Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <span className="err-msg">{error}</span>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.4rem" }}>
          <button type="submit" className="btn btn-gold" style={{ width: "100%" }} disabled={submitting}>
            <Icon name="LogIn" size={16} /> {submitting ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
