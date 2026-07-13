import { useEffect, useState } from "react";

import { Link, useLocation } from "react-router-dom";

import { WEDDING } from "./data";
import { FloatingLanterns, Icon, MiniLantern, fireConfetti } from "./effects";
import { api } from "./api";
import { ContactHelp } from "./ContactHelp";
import { SectionHead } from "./SectionHead";
import { NAV_ITEMS, goToSection, homeSectionPath } from "./navigation";

const NAME_MAX = 60;
const TEXT_MAX = 400;
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

// Purely decorative tilt, derived from the message id so it stays stable across
// re-renders instead of reshuffling every time React repaints the wall.
function rotFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return ((hash % 400) / 100) - 2;
}

// Short wishes read as bigger lanterns, long ones as smaller ones — the sky's
// silhouette comes from what guests actually wrote, not from a fixed grid.
function sizeFor(text) {
  if (text.length <= 70) return "lg";
  if (text.length <= 190) return "md";
  return "sm";
}

const NOTE_COLORS = ["amber", "blush", "mint", "sky", "peach"];

// Cycle post-it colors from the message id so each note keeps its color
// across re-renders instead of reshuffling every repaint.
function colorFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 17 + id.charCodeAt(i)) | 0;
  return NOTE_COLORS[Math.abs(hash) % NOTE_COLORS.length];
}

function formatMessageDate(value) {
  if (!value) return "Mensagem enviada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Mensagem enviada";
  return dateFormatter.format(date);
}

export function GuestMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [website, setWebsite] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    api
      .listMessages()
      .then((data) => {
        if (cancelled) return;
        setMessages(
          data.map((message) => ({ ...message, rot: rotFor(message.id), color: colorFor(message.id) }))
        );
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
  }, [reloadKey]);

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
      setMessages((current) => [
        { ...created, rot: rotFor(created.id), color: colorFor(created.id), isNew: true },
        ...current,
      ]);
      setName("");
      setText("");
      setTimeout(() => fireConfetti(), 200);
    } catch (error) {
      setErr(error.message ?? "Algo deu errado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const textRemaining = TEXT_MAX - text.length;

  return (
    <section className="section-band section-band--light" id="mural">
      <div className="section-band__inner">
        <SectionHead
          variant="action"
          title="Mural dos Convidados"
          description="Deixe uma mensagem para os noivos. Pode ser um desejo, uma lembrança ou um carinho."
        />

        <div className="mural-stage reveal d1">
          <form className="panel mural-compose" onSubmit={add}>
            <div className="mural-compose__intro">
              <span className="mural-badge">
                <Icon name="MessageCircleHeart" size={14} /> Espaço de carinho
              </span>
              <h3>Escreva um bilhete para guardar esse dia com a gente.</h3>
              <p>
                Vale recado curto, lembrança especial ou um desejo bonito para a nova fase.
              </p>
            </div>
            <div className="mural-compose__grid">
              <div className="field">
                <label htmlFor="mural-name">
                  <Icon name="User" size={14} /> Seu nome
                </label>
                <input
                  id="mural-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Quem está escrevendo"
                  maxLength={NAME_MAX}
                  disabled={submitting}
                  autoComplete="name"
                />
              </div>
              <div className="field mural-compose__message">
                <label htmlFor="mural-text">
                  <Icon name="Feather" size={14} /> Mensagem
                </label>
                <textarea
                  id="mural-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Escreva sua mensagem para o casal"
                  maxLength={TEXT_MAX}
                  rows={5}
                  disabled={submitting}
                  aria-describedby="mural-text-hint"
                />
                <span id="mural-text-hint" className="field-hint mural-compose__hint">
                  {textRemaining} {textRemaining === 1 ? "caractere restante" : "caracteres restantes"}
                </span>
              </div>
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
            <div className="mural-compose__actions">
              <button type="submit" className="btn btn-gold" disabled={submitting}>
                <Icon name="Send" size={16} /> {submitting ? "Enviando..." : "Publicar mensagem"}
              </button>
              <p className="mural-compose__note">Seu recado aparece aqui no mural assim que for enviado.</p>
            </div>
            {err && (
              <p className="form-error-banner" role="alert">
                {err}
              </p>
            )}
          </form>

          <aside className="mural-spotlight">
            <div className="mural-spotlight__card">
              <span className="mural-badge mural-badge--soft">
                <Icon name="Sparkles" size={14} /> Clima do mural
              </span>
              <p className="mural-spotlight__quote">
                “Cada mensagem vira uma pequena memória desse capítulo que estamos começando.”
              </p>
              <div className="mural-spotlight__stats" aria-label="Resumo do mural">
                <div>
                  <strong>{messages.length}</strong>
                  <span>{messages.length === 1 ? "recado publicado" : "recados publicados"}</span>
                </div>
                <div>
                  <strong>{TEXT_MAX}</strong>
                  <span>caracteres por mensagem</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {loading && (
          <p className="status-line" aria-live="polite">
            Carregando mensagens...
          </p>
        )}

        {loadError && (
          <div className="status-panel" role="alert">
            <p>Não foi possível carregar as mensagens agora.</p>
            <button type="button" className="btn btn-ghost" onClick={() => setReloadKey((key) => key + 1)}>
              Tentar novamente
            </button>
            <p className="status-line">Você ainda pode enviar a sua mensagem acima.</p>
          </div>
        )}

        {!loading && (
          <div className="mural-sky reveal d2" aria-live="polite">
            <FloatingLanterns scoped count={5} interactive={false} />

            {!loadError && messages.length === 0 && (
              <div className="mural-empty">
                <MiniLantern size={52} />
                <p className="mural-empty__title">Ainda não há mensagens por aqui</p>
                <p className="mural-empty__lead">
                  Seja a primeira pessoa a deixar um recado para os noivos.
                </p>
              </div>
            )}

            {!loadError && messages.length > 0 && (
              <>
                <div className="mural-sky__top">
                  <p className="mural-sky__count">
                    {messages.length} {messages.length === 1 ? "mensagem publicada" : "mensagens publicadas"}
                  </p>
                  <p className="mural-sky__lead">Palavras que já chegaram com carinho para esse dia.</p>
                </div>
                <div className="mural">
                  {messages.map((message, index) => (
                    <article
                      className={`mural-lantern mural-lantern--${sizeFor(message.text)} mural-lantern--${message.color}${
                        message.isNew ? " mural-lantern--new" : ""
                      }`}
                      key={message.id}
                      style={{
                        "--rot": `${message.rot}deg`,
                        "--delay": `${Math.min(index * 0.06, 0.48)}s`,
                      }}
                    >
                      <div className="mural-lantern__pin" aria-hidden="true" />
                      <div className="mural-lantern__meta">
                        <span className="mural-lantern__tag">
                          <Icon name="Heart" size={12} /> Mensagem
                        </span>
                        <span className="mural-lantern__date">{formatMessageDate(message.createdAt)}</span>
                      </div>
                      <blockquote className="mural-lantern__text">“{message.text}”</blockquote>
                      <footer className="mural-lantern__author">
                        <span className="mural-lantern__author-mark" aria-hidden="true">
                          <Icon name="Sparkle" size={13} />
                        </span>
                        <span>{message.name}</span>
                      </footer>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <ContactHelp context="mural" compact />
      </div>
    </section>
  );
}

function FooterLink({ item }) {
  const location = useLocation();
  const onHome = location.pathname === "/";

  if (item.type === "route") {
    return <Link to={item.to}>{item.label}</Link>;
  }

  if (onHome) {
    return (
      <a href={item.href} onClick={(event) => goToSection(event, item.href)}>
        {item.label}
      </a>
    );
  }

  return <Link to={homeSectionPath(item.href)}>{item.label}</Link>;
}

export function Footer() {
  return (
    <footer className="footer lantern-zone">
      <FloatingLanterns scoped count={4} interactive={false} />
      <div className="reveal">
        <MiniLantern size={56} />
      </div>
      <div className="f-names reveal d1" style={{ marginTop: "1.4rem" }}>
        {WEDDING.groom} <span className="amp">&amp;</span> {WEDDING.bride}
      </div>
      <p className="f-quote reveal d2">Obrigado por fazer parte desse momento com a gente.</p>
      <div className="f-links reveal d2">
        {NAV_ITEMS.map((item) => (
          <FooterLink key={item.href ?? item.to} item={item} />
        ))}
      </div>
      <div className="f-date reveal d2">{WEDDING.dateLabel} · Paulínia / SP</div>
      <ContactHelp context="geral" compact />
      <div className="f-credit reveal d3">
        {WEDDING.namesDisplay} · {new Date().getFullYear()}
      </div>
    </footer>
  );
}
