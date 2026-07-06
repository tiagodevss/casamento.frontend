import { useEffect, useState } from "react";

import { WEDDING } from "./data";
import { Icon, MiniLantern, fireConfetti } from "./effects";
import { api } from "./api";

const NAME_MAX = 60;
const TEXT_MAX = 400;

function goToSection(event, href) {
  event.preventDefault();
  const element = document.querySelector(href);
  if (element) {
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - 70,
      behavior: "smooth",
    });
  }
}

// Purely decorative tilt, derived from the message id so it stays stable across
// re-renders instead of reshuffling every time React repaints the wall.
function rotFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return ((hash % 400) / 100) - 2;
}

export function GuestMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [website, setWebsite] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .listMessages()
      .then((data) => {
        if (cancelled) return;
        setMessages(data.map((message) => ({ ...message, rot: rotFor(message.id) })));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const add = async (event) => {
    event.preventDefault();
    if (!name.trim() || !text.trim()) {
      setErr("Preencha seu nome e a mensagem.");
      return;
    }

    setErr("");
    setSubmitting(true);
    try {
      const created = await api.postMessage({
        name: name.trim().slice(0, NAME_MAX),
        text: text.trim().slice(0, TEXT_MAX),
        website,
      });
      setMessages((current) => [{ ...created, rot: rotFor(created.id), isNew: true }, ...current]);
      setName("");
      setText("");
      setTimeout(() => fireConfetti(), 200);
    } catch (error) {
      setErr(error.message ?? "Algo deu errado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section" id="mural">
      <div className="section-head">
        <span className="eyebrow reveal">Deixe uma mensagem no nosso céu</span>
        <h2 className="section-title reveal d1">Mural dos Convidados</h2>
        <p
          className="reveal d2"
          style={{ color: "var(--text-dim)", maxWidth: "46ch", margin: "1rem auto 0", lineHeight: 1.7 }}
        >
          Escreva um desejo, uma lembrança ou um carinho. Cada mensagem vira uma lanterna no nosso
          céu.
        </p>
        <div className="divider-flourish reveal d2">
          <span className="line" />
          <span className="dot" />
          <span className="line right" />
        </div>
      </div>

      <form
        className="glass reveal d1"
        style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(1.4rem, 3.5vw, 2.2rem)" }}
        onSubmit={add}
      >
        <div className="mural-form">
          <div className="field">
            <label>
              <Icon name="User" size={14} /> Seu nome
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Quem está escrevendo"
              maxLength={NAME_MAX}
              disabled={submitting}
            />
          </div>
          <div className="field">
            <label>
              <Icon name="Feather" size={14} /> Mensagem
            </label>
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Um desejo de luz para os noivos"
              maxLength={TEXT_MAX}
              disabled={submitting}
            />
          </div>
          {/* Honeypot: hidden from real guests, only a bot filling every field finds this one. */}
          <input
            className="hp-field"
            type="text"
            name="website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <button type="submit" className="btn btn-gold" style={{ height: 48 }} disabled={submitting}>
            <Icon name="Send" size={16} /> {submitting ? "Enviando..." : "Acender"}
          </button>
        </div>
        {err && <p style={{ color: "var(--rose-soft)", fontSize: ".82rem", marginTop: ".7rem", marginBottom: 0 }}>{err}</p>}
      </form>

      {loadError && (
        <p style={{ color: "var(--text-dim)", textAlign: "center", marginTop: "2rem" }}>
          Não foi possível carregar as mensagens agora. Sua mensagem ainda pode ser enviada.
        </p>
      )}

      {!loading && !loadError && messages.length === 0 && (
        <p style={{ color: "var(--text-dim)", textAlign: "center", marginTop: "2rem" }}>
          Seja o primeiro a acender uma lanterna de carinho para os noivos.
        </p>
      )}

      <div className="mural">
        {messages.map((message) => (
          <div className="mural-note" key={message.id} style={{ "--rot": `${message.rot}deg` }}>
            <span className="glow-dot" />
            <p className="mn-text">“{message.text}”</p>
            <div className="mn-name">
              <Icon name="Sparkle" size={13} /> {message.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="reveal">
        <MiniLantern size={56} />
      </div>
      <div className="f-names reveal d1" style={{ marginTop: "1.4rem" }}>
        {WEDDING.groom} <span className="amp">&amp;</span> {WEDDING.bride}
      </div>
      <p className="f-quote reveal d2">
        “E assim, entre lanternas e estrelas, a nossa história ganha o seu para sempre.”
      </p>
      <div className="f-links reveal d2">
        <a href="#inicio" onClick={(event) => goToSection(event, "#inicio")}>Início</a>
        <a href="#historia" onClick={(event) => goToSection(event, "#historia")}>Nossa História</a>
        <a href="#galeria" onClick={(event) => goToSection(event, "#galeria")}>Fotos</a>
        <a href="#detalhes" onClick={(event) => goToSection(event, "#detalhes")}>O Grande Dia</a>
        <a href="#rsvp" onClick={(event) => goToSection(event, "#rsvp")}>Confirmar Presença</a>
        <a href="#presentes" onClick={(event) => goToSection(event, "#presentes")}>Presentes</a>
        <a href="#mural" onClick={(event) => goToSection(event, "#mural")}>Mensagens</a>
      </div>
      <div className="f-date reveal d2">{WEDDING.dateLabel} · Paulínia / SP</div>
      <div className="f-credit reveal d3">
        Feito com muito amor e luz de lanternas · {WEDDING.namesDisplay} {new Date().getFullYear()}
      </div>
    </footer>
  );
}
