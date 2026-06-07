import { useState } from "react";

import { INITIAL_MESSAGES, WEDDING } from "./data";
import { Icon, MiniLantern, fireConfetti } from "./effects";

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

export function GuestMessages() {
  const [messages, setMessages] = useState(() =>
    INITIAL_MESSAGES.map((message, index) => ({ ...message, id: `init-${index}` })),
  );
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const add = (event) => {
    event.preventDefault();
    if (!name.trim() || !text.trim()) {
      setErr("Preencha seu nome e a mensagem.");
      return;
    }

    setErr("");
    setMessages((current) => [
      {
        id: `u-${Date.now()}`,
        name: name.trim(),
        text: text.trim(),
        rot: Math.random() * 4 - 2,
        isNew: true,
      },
      ...current,
    ]);
    setName("");
    setText("");
    setTimeout(() => fireConfetti(), 200);
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
            />
          </div>
          <button type="submit" className="btn btn-gold" style={{ height: 48 }}>
            <Icon name="Send" size={16} /> Acender
          </button>
        </div>
        {err && <p style={{ color: "var(--rose-soft)", fontSize: ".82rem", marginTop: ".7rem", marginBottom: 0 }}>{err}</p>}
      </form>

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
