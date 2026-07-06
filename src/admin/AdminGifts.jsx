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
          borderRadius: 8,
          border: "1px solid var(--line-light)",
        }}
      />
    );
  }
  return (
    <span
      className="gift-emoji-wrap"
      style={{ width: size, height: size, marginBottom: 0, flexShrink: 0 }}
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
    <form className="panel" style={{ padding: "1.6rem", marginBottom: "1.6rem" }} onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field full">
          <label>Título</label>
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Nome do presente"
          />
        </div>
        <div className="field full">
          <label>Descrição</label>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Texto exibido no site"
            rows={3}
          />
        </div>
        <div className="field">
          <label>Valor (R$)</label>
          <input
            value={form.price}
            onChange={(event) => updateField("price", event.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="150,00"
            inputMode="decimal"
          />
        </div>
        <div className="field">
          <label>Etiqueta (opcional)</label>
          <input
            value={form.tag}
            onChange={(event) => updateField("tag", event.target.value)}
            placeholder="Ex.: Mágico"
          />
        </div>
        <div className="field">
          <label>Ícone (se não houver foto)</label>
          <select value={form.iconName} onChange={(event) => updateField("iconName", event.target.value)}>
            {GIFT_ICONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select
            value={form.active ? "active" : "inactive"}
            onChange={(event) => updateField("active", event.target.value === "active")}
          >
            <option value="active">Ativo no site</option>
            <option value="inactive">Oculto</option>
          </select>
        </div>
        <div className="field full">
          <label>Foto do presente (JPEG, PNG ou WebP — máx. 5 MB)</label>
          <input
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
                  borderRadius: 8,
                  border: "1px solid var(--line-light)",
                }}
              />
              <button
                type="button"
                className="btn btn-ghost"
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
      <span className="err-msg" role="alert">
        {error}
      </span>
      <div style={{ display: "flex", gap: ".8rem", marginTop: "1.2rem" }}>
        <button type="submit" className="btn btn-ink" disabled={saving}>
          <Icon name="Check" size={16} /> {saving ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
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
        <button className="btn btn-ink" style={{ marginBottom: "1.6rem" }} onClick={() => setCreating(true)}>
          <Icon name="Plus" size={16} /> Novo presente
        </button>
      )}

      {creating && <GiftForm onCancel={() => setCreating(false)} onSaved={handleSaved} />}

      {error && <p className="err-msg">{error}</p>}

      {gifts === null && !error && <p style={{ color: "var(--text-dim)" }}>Carregando...</p>}

      {gifts && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {gifts.map((gift) =>
            editing?.id === gift.id ? (
              <GiftForm key={gift.id} initial={gift} onCancel={() => setEditing(null)} onSaved={handleSaved} />
            ) : (
              <div
                key={gift.id}
                className="panel"
                style={{
                  padding: "1.2rem 1.6rem",
                  opacity: gift.active ? 1 : 0.72,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: ".8rem" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <GiftThumb gift={gift} size={56} />
                    <div>
                      <strong style={{ color: "var(--ink)", fontSize: "1.05rem" }}>{gift.title}</strong>
                      <p style={{ color: "var(--ink-soft)", margin: ".3rem 0 0", fontSize: ".85rem", maxWidth: "48ch" }}>
                        {gift.description}
                      </p>
                      <p style={{ color: "var(--sage-700)", margin: ".4rem 0 0", fontFamily: "var(--font-display)" }}>
                        R$ {(gift.priceCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        {gift.tag ? ` · ${gift.tag}` : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ".5rem" }}>
                    <span
                      style={{
                        fontSize: ".75rem",
                        color: gift.active ? "var(--sage-600)" : "var(--ink-soft)",
                      }}
                    >
                      {gift.active ? "Ativo" : "Oculto"}
                    </span>
                    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost" onClick={() => setEditing(gift)}>
                        <Icon name="Pencil" size={14} /> Editar
                      </button>
                      <button className="btn btn-ghost" onClick={() => toggleActive(gift)}>
                        <Icon name={gift.active ? "X" : "Check"} size={14} />
                        {gift.active ? "Ocultar" : "Ativar"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </>
  );
}
