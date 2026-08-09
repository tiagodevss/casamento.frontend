import { useEffect, useMemo, useState } from "react";

import { Icon } from "../effects";
import { api } from "../api";

const PAGE_SIZE = 20;

function normalizeForCompare(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function hasText(value) {
  return Boolean(value && String(value).trim());
}

function getFieldText(group, field) {
  return group?.rsvpResponse?.[field] ?? "";
}

function formatRespondedAt(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function TextNoteForm({
  field,
  labels,
  groups,
  initial,
  onCancel,
  onSaved,
}) {
  const availableGroups = useMemo(() => {
    if (initial) return groups.filter((group) => group.id === initial.id);
    return groups
      .filter((group) => !hasText(getFieldText(group, field)))
      .slice()
      .sort((a, b) => a.displayName.localeCompare(b.displayName, "pt-BR"));
  }, [field, groups, initial]);

  const [guestGroupId, setGuestGroupId] = useState(initial?.id ?? availableGroups[0]?.id ?? "");
  const [text, setText] = useState(initial ? getFieldText(initial, field) : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const trimmed = text.trim();
    if (!guestGroupId) {
      setError("Selecione um convite");
      return;
    }
    if (!trimmed) {
      setError(`Preencha ${labels.fieldLabel.toLowerCase()}`);
      return;
    }
    setSaving(true);
    try {
      const saved = await api.updateGuestGroup(guestGroupId, { [field]: trimmed });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="adm-card adm-card-pad adm-guest-form" onSubmit={submit} noValidate>
      <div className="adm-guest-form-header">
        <h2 className="adm-guest-form-title">
          {initial ? labels.editTitle : labels.createTitle}
        </h2>
        <p className="adm-hint">{labels.formHint}</p>
      </div>

      <div className="adm-form-grid">
        <div className="adm-field adm-field-full">
          <label htmlFor={`note-guest-${field}`}>{labels.guestLabel}</label>
          {initial ? (
            <input
              id={`note-guest-${field}`}
              className="adm-input"
              value={initial.displayName}
              readOnly
            />
          ) : (
            <select
              id={`note-guest-${field}`}
              className="adm-select"
              value={guestGroupId}
              onChange={(event) => setGuestGroupId(event.target.value)}
              autoFocus
            >
              {availableGroups.length === 0 ? (
                <option value="">Nenhum convite disponível</option>
              ) : (
                availableGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.displayName}
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        <div className="adm-field adm-field-full">
          <label htmlFor={`note-text-${field}`}>{labels.fieldLabel}</label>
          <textarea
            id={`note-text-${field}`}
            className="adm-input adm-textarea"
            rows={5}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={labels.placeholder}
            autoFocus={Boolean(initial)}
          />
        </div>
      </div>

      {error ? <p className="adm-error">{error}</p> : null}

      <div className="adm-guest-form-actions">
        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving || !guestGroupId}>
          <Icon name="Check" size={14} />
          {saving ? "Salvando…" : "Salvar"}
        </button>
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/**
 * Shared admin list + CRUD for RSVP text fields (`message` or `diet`).
 */
export function AdminTextNotes({ field, labels }) {
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      setError("");
      const data = await api.listGuestGroups();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const filledGroups = useMemo(() => {
    if (!groups) return null;
    return groups
      .filter((group) => hasText(getFieldText(group, field)))
      .slice()
      .sort((a, b) => {
        const aAt = a.rsvpResponse?.respondedAt ? new Date(a.rsvpResponse.respondedAt).getTime() : 0;
        const bAt = b.rsvpResponse?.respondedAt ? new Date(b.rsvpResponse.respondedAt).getTime() : 0;
        return bAt - aAt;
      });
  }, [groups, field]);

  const filteredGroups = useMemo(() => {
    if (!filledGroups) return null;
    const needle = normalizeForCompare(query);
    if (!needle) return filledGroups;

    return filledGroups.filter((group) => {
      const haystack = [
        group.displayName,
        getFieldText(group, field),
        ...(group.members ?? []).map((member) => member.name),
      ]
        .filter(Boolean)
        .map(normalizeForCompare)
        .join(" ");
      return haystack.includes(needle);
    });
  }, [filledGroups, query, field]);

  const totalPages = Math.max(1, Math.ceil((filteredGroups?.length ?? 0) / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageGroups = useMemo(() => {
    if (!filteredGroups) return [];
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredGroups.slice(start, start + PAGE_SIZE);
  }, [filteredGroups, safePage]);

  const rangeLabel = useMemo(() => {
    const total = filteredGroups?.length ?? 0;
    if (total === 0) return "Nenhum registro";
    const start = (safePage - 1) * PAGE_SIZE + 1;
    const end = Math.min(safePage * PAGE_SIZE, total);
    return `${start}–${end} de ${total}`;
  }, [filteredGroups, safePage]);

  const remove = async (group) => {
    const ok = window.confirm(
      `${labels.deleteConfirm} “${group.displayName}”?`,
    );
    if (!ok) return;
    try {
      setError("");
      await api.updateGuestGroup(group.id, { [field]: null });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!groups) {
    return (
      <div className="adm-card adm-empty" aria-busy="true">
        Carregando {labels.plural.toLowerCase()}…
      </div>
    );
  }

  if (creating || editing) {
    return (
      <TextNoteForm
        field={field}
        labels={labels}
        groups={groups}
        initial={editing}
        onCancel={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={async () => {
          setCreating(false);
          setEditing(null);
          await load();
        }}
      />
    );
  }

  return (
    <div className="adm-guests">
      <div className="adm-dashboard-toolbar">
        <p className="adm-hint" style={{ margin: 0 }}>
          {labels.listHint}
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={load}>
            <Icon name="RotateCcw" size={13} /> Atualizar
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary adm-btn-sm"
            onClick={() => setCreating(true)}
          >
            <Icon name="Plus" size={13} /> {labels.createButton}
          </button>
        </div>
      </div>

      {error ? <p className="adm-error">{error}</p> : null}

      <div className="adm-guests-controls">
        <label className="adm-search-field">
          <Icon name="Search" size={15} />
          <input
            className="adm-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
          />
        </label>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="adm-card adm-empty adm-empty-rich">
          <span className="adm-empty-icon" aria-hidden="true">
            <Icon name={labels.emptyIcon} size={20} />
          </span>
          <h2>{labels.emptyTitle}</h2>
          <p>{query ? "Nenhum resultado para a busca." : labels.emptyBody}</p>
          {!query ? (
            <button
              type="button"
              className="adm-btn adm-btn-secondary adm-btn-sm"
              onClick={() => setCreating(true)}
            >
              <Icon name="Plus" size={13} /> {labels.createButton}
            </button>
          ) : (
            <button
              type="button"
              className="adm-btn adm-btn-secondary adm-btn-sm"
              onClick={() => setQuery("")}
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="adm-table-meta">
            <span>{rangeLabel}</span>
          </div>

          <div className="adm-card adm-table-card">
            <div className="adm-table-wrap">
              <table className="adm-data-table">
                <thead>
                  <tr>
                    <th scope="col">Convite</th>
                    <th scope="col">{labels.fieldLabel}</th>
                    <th scope="col">Data</th>
                    <th scope="col" className="adm-col-actions">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageGroups.map((group) => {
                    const text = getFieldText(group, field).trim();
                    return (
                      <tr key={group.id}>
                        <td>
                          <span className="adm-row-title">{group.displayName}</span>
                          <span className="adm-row-meta">
                            {(group.members?.length ?? 0) === 1
                              ? "1 pessoa"
                              : `${group.members?.length ?? 0} pessoas`}
                          </span>
                        </td>
                        <td>
                          <p className="adm-note-text">{text}</p>
                        </td>
                        <td>
                          <span className="adm-row-meta">
                            {formatRespondedAt(group.rsvpResponse?.respondedAt)}
                          </span>
                        </td>
                        <td className="adm-col-actions">
                          <div className="adm-row-actions">
                            <button
                              type="button"
                              className="adm-btn adm-btn-ghost adm-btn-sm"
                              onClick={() => setEditing(group)}
                            >
                              <Icon name="Pencil" size={13} /> Editar
                            </button>
                            <button
                              type="button"
                              className="adm-btn adm-btn-danger adm-btn-sm"
                              onClick={() => remove(group)}
                            >
                              <Icon name="Trash2" size={13} /> Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 ? (
            <div className="adm-pagination">
              <button
                type="button"
                className="adm-btn adm-btn-ghost adm-btn-sm"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Anterior
              </button>
              <span className="adm-hint">
                Página {safePage} de {totalPages}
              </span>
              <button
                type="button"
                className="adm-btn adm-btn-ghost adm-btn-sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Próxima
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
