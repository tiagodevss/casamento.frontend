import { useEffect, useState } from "react";

import { api } from "../api";
import { Icon } from "../effects";

function draftFromGroup(group) {
  const members = {};
  for (const member of group.members ?? []) {
    members[member.id] =
      member.attending === true ? "yes" : member.attending === false ? "no" : "";
  }

  const partyAttending = group.rsvpResponse?.partyAttending;

  return {
    members,
    partyAttending:
      partyAttending === true ? "yes" : partyAttending === false ? "no" : "",
  };
}

function ChoiceButton({ active, danger = false, children, onClick }) {
  const tone = active ? (danger ? "danger" : "primary") : "ghost";

  return (
    <button
      type="button"
      className={`adm-btn adm-btn-${tone} adm-btn-sm`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function GuestRsvpEditor({ group, onSaved }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => draftFromGroup(group));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, saving]);

  const openEditor = () => {
    setDraft(draftFromGroup(group));
    setError("");
    setOpen(true);
  };

  const updateMember = (memberId, value) => {
    setDraft((current) => ({
      ...current,
      members: { ...current.members, [memberId]: value },
    }));
    setError("");
  };

  const updateParty = (value) => {
    setDraft((current) => ({ ...current, partyAttending: value }));
    setError("");
  };

  const setAll = (value) => {
    const members = {};
    for (const member of group.members ?? []) members[member.id] = value;

    setDraft({
      members,
      partyAttending: group.invitedToParty ? value : "",
    });
    setError("");
  };

  const save = async () => {
    const members = group.members ?? [];
    if (members.length === 0) {
      setError("Este convite não possui pessoas cadastradas.");
      return;
    }

    const pendingMember = members.find((member) => !draft.members[member.id]);
    if (pendingMember) {
      setError(`Informe se ${pendingMember.name} vai ou não ao casamento.`);
      return;
    }

    if (group.invitedToParty && !draft.partyAttending) {
      setError("Informe também se o grupo vai à festa.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const saved = await api.updateGuestRsvp(group.id, {
        members: members.map((member) => ({
          id: member.id,
          attending: draft.members[member.id] === "yes",
        })),
        ...(group.invitedToParty
          ? { partyAttending: draft.partyAttending === "yes" }
          : {}),
      });

      onSaved(saved);
      setDraft(draftFromGroup(saved));
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="adm-btn adm-btn-ghost adm-btn-sm"
        onClick={openEditor}
      >
        <Icon name="CheckCircle2" size={13} />
        {group.rsvpResponse ? "Editar" : "Confirmar"}
      </button>

      {open && (
        <div
          role="presentation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            padding: "1rem",
            background: "rgba(16, 24, 40, 0.55)",
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setOpen(false);
          }}
        >
          <section
            className="adm-card adm-card-pad"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`guest-rsvp-title-${group.id}`}
            style={{
              width: "min(560px, 100%)",
              maxHeight: "calc(100vh - 2rem)",
              overflowY: "auto",
            }}
          >
            <div
              className="adm-guest-form-header"
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div>
                <h2
                  id={`guest-rsvp-title-${group.id}`}
                  className="adm-guest-form-title"
                  style={{ marginBottom: "0.25rem" }}
                >
                  Confirmar presença
                </h2>
                <p className="adm-hint" style={{ margin: 0 }}>
                  {group.displayName}. Marque cada pessoa sem precisar abrir o link do convite.
                </p>
              </div>

              <button
                type="button"
                className="adm-btn adm-btn-ghost adm-btn-sm"
                onClick={() => setOpen(false)}
                disabled={saving}
                aria-label="Fechar confirmação de presença"
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <ul className="adm-member-rsvp-list">
                {(group.members ?? []).map((member) => (
                  <li key={member.id} className="adm-member-rsvp-item">
                    <span>
                      {member.name}
                      {member.isChild ? (
                        <span className="adm-row-meta"> (criança)</span>
                      ) : null}
                    </span>

                    <div className="adm-quick-actions" role="group" aria-label={`Presença de ${member.name}`}>
                      <ChoiceButton
                        active={draft.members[member.id] === "yes"}
                        onClick={() => updateMember(member.id, "yes")}
                      >
                        Vai
                      </ChoiceButton>
                      <ChoiceButton
                        active={draft.members[member.id] === "no"}
                        danger
                        onClick={() => updateMember(member.id, "no")}
                      >
                        Não vai
                      </ChoiceButton>
                    </div>
                  </li>
                ))}

                {group.invitedToParty && (
                  <li className="adm-member-rsvp-item">
                    <span>
                      Festa
                      <span className="adm-row-meta"> (grupo)</span>
                    </span>

                    <div className="adm-quick-actions" role="group" aria-label="Presença na festa">
                      <ChoiceButton
                        active={draft.partyAttending === "yes"}
                        onClick={() => updateParty("yes")}
                      >
                        Vai
                      </ChoiceButton>
                      <ChoiceButton
                        active={draft.partyAttending === "no"}
                        danger
                        onClick={() => updateParty("no")}
                      >
                        Não vai
                      </ChoiceButton>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {error && (
              <p className="adm-error" role="alert" style={{ marginTop: "0.9rem" }}>
                {error}
              </p>
            )}

            <div
              className="adm-guest-form-actions"
              style={{ marginTop: "1rem", flexWrap: "wrap" }}
            >
              <button
                type="button"
                className="adm-btn adm-btn-secondary adm-btn-sm"
                onClick={() => setAll("yes")}
                disabled={saving}
              >
                Todos vão
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-ghost adm-btn-sm"
                onClick={() => setAll("no")}
                disabled={saving}
              >
                Todos não vão
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={save}
                disabled={saving}
              >
                <Icon name="Check" size={16} />
                {saving ? "Salvando..." : "Salvar presença"}
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-ghost"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
