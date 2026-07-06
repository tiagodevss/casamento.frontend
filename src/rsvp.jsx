import { useState } from "react";

import { Icon, MiniLantern, fireConfetti } from "./effects";
import { api } from "./api";
import { ContactHelp } from "./ContactHelp";
import { SectionHead } from "./SectionHead";

const emptyForm = {
  attending: "",
  companions: 0,
  companionNames: "",
  diet: "",
  message: "",
};

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
        <label>
          <Icon name="Search" size={14} /> Como devemos te encontrar?
        </label>
        <input
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
        <div style={{ marginTop: "1.6rem", display: "grid", gap: ".6rem" }}>
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

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: null }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.attending) nextErrors.attending = "Escolha uma opção";
    if (form.attending === "yes" && form.companions > 0 && !form.companionNames.trim()) {
      nextErrors.companionNames = "Informe os nomes dos acompanhantes";
    }
    return nextErrors;
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.querySelector(".field.error input, .field.error select, .field.error textarea")?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await api.confirmRsvp(group.id, {
        attending: form.attending === "yes",
        companionsCount: form.companions,
        companionNames: form.companionNames || undefined,
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
              fontSize: "1.4rem",
              margin: "1rem auto 0",
              maxWidth: "34ch",
            }}
          >
            Sua presença foi enviada para o nosso céu de lanternas.
          </p>
          {form.attending === "yes" && (
            <p style={{ color: "var(--ink-soft)", marginTop: "1rem" }}>
              {form.companions > 0
                ? `Você e mais ${form.companions} ${
                    form.companions === 1 ? "acompanhante" : "acompanhantes"
                  } estão confirmados.`
                : "Você está confirmado(a)."}
            </p>
          )}
          <button
            className="btn btn-ghost"
            style={{ marginTop: "1.8rem" }}
            onClick={() => {
              setSent(false);
              setGroup(null);
              setForm(emptyForm);
            }}
          >
            <Icon name="RotateCcw" size={16} /> Enviar outra confirmação
          </button>
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
          className="panel reveal d1"
          style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(1.6rem, 4vw, 2.6rem)" }}
          onSubmit={submit}
          noValidate
        >
          <p style={{ color: "var(--ink-soft)", marginBottom: "1rem" }}>
            Confirmando para: <strong style={{ color: "var(--ink)" }}>{group.displayName}</strong>{" "}
            <button
              type="button"
              onClick={() => setGroup(null)}
              style={{ background: "none", border: "none", color: "var(--sage-600)", cursor: "pointer" }}
            >
              (trocar)
            </button>
          </p>

          <div className="form-grid">
            <div className={`field full ${errors.attending ? "error" : ""}`}>
              <label>
                <Icon name="Heart" size={14} /> Você poderá vir?
              </label>
              <div className="choice-row">
                <label className="choice yes">
                  <input
                    type="radio"
                    name="attending"
                    checked={form.attending === "yes"}
                    onChange={() => updateField("attending", "yes")}
                  />
                  <span className="radio" /> <span>Sim, eu vou! ✨</span>
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

            {form.attending === "yes" && (
              <>
                <div className="field">
                  <label>
                    <Icon name="Users" size={14} /> Acompanhantes
                  </label>
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => updateField("companions", Math.max(0, form.companions - 1))}
                      aria-label="Menos"
                    >
                      −
                    </button>
                    <span className="count">{form.companions}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateField("companions", Math.min(group.maxCompanions, form.companions + 1))
                      }
                      aria-label="Mais"
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: ".75rem", color: "var(--ink-soft)" }}>
                    Máximo de {group.maxCompanions} acompanhante(s) neste convite
                  </span>
                </div>
                <div className="field">
                  <label>
                    <Icon name="Utensils" size={14} /> Restrições alimentares
                  </label>
                  <input
                    value={form.diet}
                    onChange={(event) => updateField("diet", event.target.value)}
                    placeholder="Vegetariano, alergias..."
                  />
                </div>
                {form.companions > 0 && (
                  <div className={`field full ${errors.companionNames ? "error" : ""}`}>
                    <label>
                      <Icon name="PenLine" size={14} /> Nomes dos acompanhantes
                    </label>
                    <input
                      value={form.companionNames}
                      onChange={(event) => updateField("companionNames", event.target.value)}
                      placeholder="Separe os nomes por vírgula"
                      maxLength={300}
                      required
                    />
                    <span className="err-msg" role="alert">
                      {errors.companionNames}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="field full">
              <label>
                <Icon name="MessageCircleHeart" size={14} /> Mensagem para os noivos
              </label>
              <textarea
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                placeholder="Deixe um recado cheio de luz (opcional)"
              />
            </div>
          </div>

          {errors.submit && (
            <p className="form-error-banner" role="alert">
              {errors.submit}
            </p>
          )}

          <div style={{ textAlign: "center", marginTop: "1.8rem" }}>
            <button type="submit" className="btn btn-ink" style={{ padding: "1rem 2.6rem" }} disabled={submitting}>
              <Icon name="Send" size={18} /> {submitting ? "Enviando..." : "Enviar para o céu de lanternas"}
            </button>
          </div>

          <ContactHelp context="rsvp" compact />
        </form>
      )}
      </div>
    </section>
  );
}
