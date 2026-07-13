import { useEffect, useRef, useState } from "react";

import { Icon, MiniLantern, PhotoFrame, fireConfetti } from "./effects";
import { api } from "./api";
import { ContactHelp } from "./ContactHelp";
import { SectionHead } from "./SectionHead";
import { PARTY, WEDDING } from "./data";

const emptyForm = {
  attending: "",
  partyAttending: "",
  diet: "",
  message: "",
};

function VenueConfirmationCard({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  placeholderLabel,
  facts,
  ctaLabel,
  ctaHref,
}) {
  return (
    <section className="rsvp-venue-card">
      <div className="rsvp-venue-card__media">
        <span className="rsvp-venue-card__tag">{eyebrow}</span>
        <PhotoFrame
          src={imageSrc}
          label={placeholderLabel}
          caption={imageAlt}
          className="rsvp-venue-card__frame"
        />
      </div>

      <div className="rsvp-venue-card__body">
        <span className="rsvp-venue-card__eyebrow">{eyebrow}</span>
        <h3 className="rsvp-venue-card__title">{title}</h3>
        {description ? <p className="rsvp-venue-card__description">{description}</p> : null}

        <div className="rsvp-venue-card__facts">
          {facts.map((fact) => (
            <div className="rsvp-venue-card__fact" key={`${fact.label}-${fact.value}`}>
              <span className="rsvp-venue-card__fact-label">{fact.label}</span>
              <span className="rsvp-venue-card__fact-value">{fact.value}</span>
            </div>
          ))}
        </div>

        {ctaHref ? (
          <a
            className="btn btn-ghost rsvp-venue-card__cta"
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="Navigation" size={16} /> {ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function GuestSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async (event) => {
    event.preventDefault();
    if (query.trim().length < 3) {
      setError("Digite ao menos 3 letras do seu nome");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const results = await api.searchGuests(query.trim());
      setCandidates(results);
      if (results.length === 0) {
        setError("Não encontramos seu convite. Tente o sobrenome da família ou peça ajuda abaixo.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="panel reveal d1"
      style={{ maxWidth: 620, margin: "0 auto", padding: "clamp(1.6rem, 4vw, 2.6rem)" }}
      onSubmit={search}
      noValidate
    >
      <div className="field full">
        <label htmlFor="rsvp-search-name">
          <Icon name="Search" size={14} /> Como devemos te encontrar?
        </label>
        <input
          id="rsvp-search-name"
          name="guestName"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite seu nome ou o nome da sua família"
          maxLength={80}
          autoComplete="name"
          aria-describedby="rsvp-search-hint rsvp-search-error"
        />
        <span id="rsvp-search-hint" className="field-hint">
          Use pelo menos 3 letras. Se não aparecer, tente outro sobrenome da família.
        </span>
        <span id="rsvp-search-error" className="err-msg" role="alert">
          {error}
        </span>
      </div>

      <div style={{ textAlign: "center", marginTop: "1.2rem" }}>
        <button type="submit" className="btn btn-ink" disabled={loading}>
          <Icon name="Search" size={16} /> {loading ? "Buscando..." : "Buscar convite"}
        </button>
      </div>

      {candidates && candidates.length > 0 && (
        <div
          style={{ marginTop: "1.6rem", display: "grid", gap: ".6rem" }}
          aria-live="polite"
          role="status"
        >
          <span className="sr-only">
            {candidates.length === 1
              ? "1 convite encontrado"
              : `${candidates.length} convites encontrados`}
          </span>
          {candidates.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className="btn btn-ghost"
              style={{ justifyContent: "space-between", width: "100%" }}
              onClick={() => onSelect(candidate)}
            >
              <span>{candidate.displayName}</span>
              {candidate.hasResponded && (
                <span style={{ fontSize: ".75rem", color: "var(--ink-soft)" }}>já confirmado</span>
              )}
            </button>
          ))}
        </div>
      )}

      <ContactHelp context="rsvp" compact />
    </form>
  );
}

export function RSVPForm({ standalone = false }) {
  const [group, setGroup] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  // Roda depois que o React já re-renderizou os campos com a classe .error,
  // então o foco encontra o elemento certo mesmo na primeira tentativa de envio.
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    formRef.current
      ?.querySelector(".field.error input, .field.error select, .field.error textarea")
      ?.focus();
  }, [errors]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: null }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.attending) nextErrors.attending = "Escolha uma opção";
    if (group?.invitedToParty && !form.partyAttending) {
      nextErrors.partyAttending = "Confirme também sua presença na festa";
    }
    return nextErrors;
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    setSubmitting(true);
    try {
      await api.confirmRsvp(group.id, {
        attending: form.attending === "yes",
        partyAttending: group.invitedToParty ? form.partyAttending === "yes" : undefined,
        diet: form.diet || undefined,
        message: form.message || undefined,
      });
      setSent(true);
      setTimeout(() => fireConfetti(), 250);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const sectionClass = `section-band section-band--light${standalone ? " action-page-form" : ""}`;

  if (sent) {
    return (
      <section className={sectionClass} id={standalone ? undefined : "rsvp"}>
        <div className="section-band__inner">
        <div className="panel rsvp-success" style={{ maxWidth: 620, margin: "0 auto", padding: "3rem 2rem" }}>
          <div className="rising-lantern">
            <MiniLantern size={70} />
          </div>
          <span className="eyebrow">Recebido com carinho</span>
          <h2 className="section-title" style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", marginTop: ".6rem" }}>
            {form.attending === "yes" ? "Que alegria ter você conosco!" : "Vamos sentir sua falta"}
          </h2>
          <p
            style={{
              color: "var(--ink-soft)",
              fontFamily: "var(--font-script)",
              fontSize: "clamp(1.8rem, 4vw, 2.45rem)",
              lineHeight: 1.02,
              margin: "1rem auto 0",
              maxWidth: "34ch",
            }}
          >
            Sua presença foi registrada.
          </p>
          {form.attending === "yes" && (
            <p style={{ color: "var(--ink-soft)", marginTop: "1rem" }}>Você está confirmado(a).</p>
          )}
          {group?.invitedToParty && form.partyAttending === "yes" && (
            <p style={{ color: "var(--ink-soft)", marginTop: ".6rem" }}>
              Sua presença na festa também foi confirmada.
            </p>
          )}
          {group?.invitedToParty && form.partyAttending === "no" && (
            <p style={{ color: "var(--ink-soft)", marginTop: ".6rem" }}>
              Obrigado por nos avisar sobre a festa.
            </p>
          )}
          <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1.8rem" }}>
            <button className="btn btn-ghost" onClick={() => setSent(false)}>
              <Icon name="PenLine" size={16} /> Corrigir minha resposta
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setSent(false);
                setGroup(null);
                setForm(emptyForm);
              }}
            >
              <Icon name="RotateCcw" size={16} /> Confirmar para outra pessoa
            </button>
          </div>
        </div>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass} id={standalone ? undefined : "rsvp"}>
      <div className="section-band__inner">
      <SectionHead
        variant="action"
        title="Confirme seu lugar nessa história"
        description="Preencha com carinho e faça parte do nosso céu de luzes."
      />

      {!group ? (
        <GuestSearch onSelect={setGroup} />
      ) : (
        <form
          ref={formRef}
          className="panel reveal d1"
          style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(1.6rem, 4vw, 2.6rem)" }}
          onSubmit={submit}
          noValidate
        >
          <p style={{ color: "var(--ink-soft)", marginBottom: "1rem" }}>
            Confirmando para: <strong style={{ color: "var(--ink)" }}>{group.displayName}</strong>{" "}
            <button
              type="button"
              onClick={() => {
                setGroup(null);
                setForm(emptyForm);
                setErrors({});
              }}
              style={{ background: "none", border: "none", color: "var(--sage-600)", cursor: "pointer" }}
            >
              (trocar)
            </button>
          </p>

          {group.hasResponded && (
            <p className="rsvp-notice" role="status">
              Encontramos uma confirmação anterior para {group.displayName}. Ao enviar, sua resposta
              antiga será substituída pela nova.
            </p>
          )}

          <VenueConfirmationCard
            eyebrow="Cerimônia"
            title={WEDDING.venue}
            description="Antes de confirmar sua presença, veja o local da cerimônia e os detalhes principais do grande dia."
            imageSrc={WEDDING.churchPhoto}
            imageAlt={`Foto da ${WEDDING.venue}`}
            placeholderLabel="Foto da igreja"
            facts={[
              { label: "Horário", value: WEDDING.timeLabel },
              { label: "Endereço", value: WEDDING.address },
            ]}
            ctaLabel="Ver rota da cerimônia"
            ctaHref={WEDDING.mapsUrl}
          />

          {group.invitedToParty && (
            <VenueConfirmationCard
              eyebrow="Festa na chácara"
              title={PARTY.venue}
              description={PARTY.description}
              imageSrc={PARTY.photo}
              imageAlt={`Foto do local da festa: ${PARTY.venue}`}
              placeholderLabel="Foto da chácara"
              facts={[
                { label: "Horário", value: PARTY.timeLabel },
                { label: "Local", value: PARTY.venue },
                ...(PARTY.address ? [{ label: "Endereço", value: PARTY.address }] : []),
              ]}
              ctaLabel="Ver rota da festa"
              ctaHref={PARTY.mapsUrl}
            />
          )}

          <div className="form-grid">
            <div className={`field full ${errors.attending ? "error" : ""}`}>
              <label>
                <Icon name="Heart" size={14} /> Você poderá vir na cerimônia na igreja?
              </label>
              <div className="choice-row">
                <label className="choice yes">
                  <input
                    type="radio"
                    name="attending"
                    checked={form.attending === "yes"}
                    onChange={() => updateField("attending", "yes")}
                  />
                  <span className="radio" /> <span>Sim, eu vou! <span aria-hidden="true">✨</span></span>
                </label>
                <label className="choice no">
                  <input
                    type="radio"
                    name="attending"
                    checked={form.attending === "no"}
                    onChange={() => updateField("attending", "no")}
                  />
                  <span className="radio" /> <span>Não poderei ir</span>
                </label>
              </div>
              <span className="err-msg">{errors.attending}</span>
            </div>

            {group.invitedToParty && (
              <div className={`field full ${errors.partyAttending ? "error" : ""}`}>
                <label>
                  <Icon name="PartyPopper" size={14} /> Você irá para a festa?
                </label>
                <div className="choice-row">
                  <label className="choice yes">
                    <input
                      type="radio"
                      name="partyAttending"
                      checked={form.partyAttending === "yes"}
                      onChange={() => updateField("partyAttending", "yes")}
                    />
                    <span className="radio" /> <span>Sim, estarei na festa</span>
                  </label>
                  <label className="choice no">
                    <input
                      type="radio"
                      name="partyAttending"
                      checked={form.partyAttending === "no"}
                      onChange={() => updateField("partyAttending", "no")}
                    />
                    <span className="radio" /> <span>Não irei para a festa</span>
                  </label>
                </div>
                <span className="err-msg">{errors.partyAttending}</span>
              </div>
            )}

            {form.partyAttending === "yes" && (
              <div className="field">
                <label htmlFor="rsvp-diet">
                  <Icon name="Utensils" size={14} /> Restrições alimentares
                </label>
                <input
                  id="rsvp-diet"
                  name="diet"
                  value={form.diet}
                  onChange={(event) => updateField("diet", event.target.value)}
                  placeholder="Vegetariano, alergias..."
                />
              </div>
            )}

            <div className="field full">
              <label htmlFor="rsvp-message">
                <Icon name="MessageCircleHeart" size={14} /> Mensagem para os noivos
              </label>
              <textarea
                id="rsvp-message"
                name="message"
                value={form.message}
                onChange={(event) => updateField("message", event.target.value.slice(0, 500))}
                placeholder="Deixe um recado para os noivos (opcional)"
                maxLength={500}
                aria-describedby="rsvp-message-count"
              />
              <span id="rsvp-message-count" className="field-hint" style={{ textAlign: "right" }}>
                {form.message.length}/500
              </span>
            </div>
          </div>

          {errors.submit && (
            <p className="form-error-banner" role="alert">
              {errors.submit}
            </p>
          )}

          <div style={{ textAlign: "center", marginTop: "1.8rem" }}>
            <button type="submit" className="btn btn-ink" style={{ padding: "1rem 2.6rem" }} disabled={submitting}>
              <Icon name="Send" size={18} /> {submitting ? "Enviando..." : "Enviar!"}
            </button>
          </div>

          <ContactHelp context="rsvp" compact />
        </form>
      )}
      </div>
    </section>
  );
}
