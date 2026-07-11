import { useEffect, useState } from "react";

import { Icon } from "../effects";
import { api, resolveUploadUrl } from "../api";
import { parseBrlAmount } from "../contact";

const GIFT_ICONS = [
  "Flame",
  "UtensilsCrossed",
  "Compass",
  "Coffee",
  "Sparkles",
  "Castle",
  "Gift",
  "HandHeart",
  "Heart",
  "Calendar",
  "MapPin",
  "Feather",
];

const emptyForm = {
  title: "",
  description: "",
  iconName: "Gift",
  price: "",
  tag: "",
  active: true,
};

function toForm(gift) {
  return {
    title: gift.title,
    description: gift.description,
    iconName: gift.iconName,
    price: (gift.priceCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
    tag: gift.tag ?? "",
    active: gift.active,
  };
}

function toPayload(form) {
  const priceCents = Math.round(parseBrlAmount(form.price) * 100);
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    iconName: form.iconName,
    priceCents,
    tag: form.tag.trim() || undefined,
    active: form.active,
  };
}

function GiftThumb({ gift, size = 46 }) {
  const url = resolveUploadUrl(gift.imagePath);
  if (url) {
    return (
      <img
        src={url}
        alt=""
        style={{
          width: size,
          height: size,
          objectFit: "cover",
          borderRadius: 6,
          border: "1px solid var(--adm-border)",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: "var(--adm-primary-tint)",
        color: "var(--adm-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon name={gift.iconName} size={Math.round(size * 0.48)} />
    </span>
  );
}

function GiftForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(initial ? toForm(initial) : emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    initial?.imagePath ? resolveUploadUrl(initial.imagePath) : null,
  );
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!imageFile) return undefined;
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    setRemoveImage(false);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Preencha título e descrição");
      return;
    }

    const payload = toPayload(form);
    if (payload.priceCents < 500) {
      setError("O valor mínimo é R$ 5,00");
      return;
    }

    setSaving(true);
    try {
      let saved = initial
        ? await api.updateGift(initial.id, payload)
        : await api.createGift(payload);

      if (removeImage && initial?.imagePath) {
        saved = await api.deleteGiftImage(saved.id);
      } else if (imageFile) {
        saved = await api.uploadGiftImage(saved.id, imageFile);
      }

      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="adm-card adm-card-pad" style={{ marginBottom: "1rem" }} onSubmit={submit} noValidate>
      <div className="adm-form-grid">
        <div className="adm-field adm-field-full">
          <label>Título</label>
          <input
            className="adm-input"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Nome do presente"
          />
        </div>
        <div className="adm-field adm-field-full">
          <label>Descrição</label>
          <textarea
            className="adm-textarea"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Texto exibido no site"
            rows={3}
          />
        </div>
        <div className="adm-field">
          <label>Valor (R$)</label>
          <input
            className="adm-input"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="150,00"
            inputMode="decimal"
          />
        </div>
        <div className="adm-field">
          <label>Etiqueta (opcional)</label>
          <input
            className="adm-input"
            value={form.tag}
            onChange={(event) => updateField("tag", event.target.value)}
            placeholder="Ex.: Mágico"
          />
        </div>
        <div className="adm-field">
          <label>Ícone (se não houver foto)</label>
          <select className="adm-select" value={form.iconName} onChange={(event) => updateField("iconName", event.target.value)}>
            {GIFT_ICONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="adm-field">
          <label>Status</label>
          <select
            className="adm-select"
            value={form.active ? "active" : "inactive"}
            onChange={(event) => updateField("active", event.target.value === "active")}
          >
            <option value="active">Ativo no site</option>
            <option value="inactive">Oculto</option>
          </select>
        </div>
        <div className="adm-field adm-field-full">
          <label>Foto do presente (JPEG, PNG ou WebP — máx. 5 MB)</label>
          <input
            className="adm-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
          />
          {previewUrl && !removeImage && (
            <div style={{ marginTop: "0.8rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <img
                src={previewUrl}
                alt="Prévia"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid var(--adm-border)",
                }}
              />
              <button
                type="button"
                className="adm-btn adm-btn-ghost adm-btn-sm"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(null);
                  setRemoveImage(true);
                }}
              >
                Remover foto
              </button>
            </div>
          )}
        </div>
      </div>
      {error && (
        <span className="adm-error" style={{ display: "block", marginTop: "0.75rem" }} role="alert">
          {error}
        </span>
      )}
      <div style={{ display: "flex", gap: ".6rem", marginTop: "1.1rem" }}>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
          <Icon name="Check" size={16} /> {saving ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function AdminGifts() {
  const [gifts, setGifts] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      setError("");
      const data = await api.listAdminGifts();
      setGifts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (gift) => {
    try {
      const updated = await api.setGiftActive(gift.id, !gift.active);
      setGifts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaved = (saved) => {
    setGifts((current) => {
      if (!current) return [saved];
      const exists = current.some((item) => item.id === saved.id);
      return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [...current, saved];
    });
    setEditing(null);
    setCreating(false);
  };

  return (
    <>
      {!creating && !editing && (
        <button className="adm-btn adm-btn-primary" style={{ marginBottom: "1.1rem" }} onClick={() => setCreating(true)}>
          <Icon name="Plus" size={16} /> Novo presente
        </button>
      )}

      {creating && <GiftForm onCancel={() => setCreating(false)} onSaved={handleSaved} />}

      {error && <p className="adm-error">{error}</p>}

      {gifts === null && !error && <p className="adm-hint">Carregando...</p>}

      {gifts && gifts.length === 0 && <div className="adm-card adm-empty">Nenhum presente cadastrado ainda.</div>}

      {gifts && gifts.length > 0 && (
        <div className="adm-card">
          <div className="adm-list">
            {gifts.map((gift, index) =>
              editing?.id === gift.id ? (
                <div key={gift.id} style={{ padding: "0 0.5rem" }}>
                  <GiftForm initial={gift} onCancel={() => setEditing(null)} onSaved={handleSaved} />
                </div>
              ) : (
                <div
                  key={gift.id}
                  className="adm-row"
                  style={{
                    opacity: gift.active ? 1 : 0.6,
                    ...(index > 0 ? { borderTop: "1px solid var(--adm-border)" } : {}),
                  }}
                >
                  <div className="adm-row-main">
                    <GiftThumb gift={gift} size={44} />
                    <div>
                      <div className="adm-row-title">{gift.title}</div>
                      <p className="adm-row-meta" style={{ maxWidth: "48ch" }}>
                        {gift.description}
                      </p>
                      <p className="adm-row-meta" style={{ color: "var(--adm-text)", fontWeight: 600 }}>
                        R$ {(gift.priceCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        {gift.tag ? ` · ${gift.tag}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="adm-row-side">
                    <span className={`adm-badge ${gift.active ? "adm-badge-success" : "adm-badge-neutral"}`}>
                      {gift.active ? "Ativo" : "Oculto"}
                    </span>
                    <div className="adm-row-actions">
                      <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setEditing(gift)}>
                        <Icon name="Pencil" size={13} /> Editar
                      </button>
                      <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => toggleActive(gift)}>
                        <Icon name={gift.active ? "X" : "Check"} size={13} />
                        {gift.active ? "Ocultar" : "Ativar"}
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </>
  );
}
