const digitsOnly = (value) => value.replace(/\D/g, "");

const whatsappRaw = import.meta.env.VITE_CONTACT_WHATSAPP?.trim() ?? "";
const phoneDisplay = import.meta.env.VITE_CONTACT_PHONE?.trim() ?? "";

export const CONTACT = {
  whatsapp: digitsOnly(whatsappRaw),
  phoneDisplay,
  hasWhatsApp: digitsOnly(whatsappRaw).length >= 10,
  hasPhone: phoneDisplay.length > 0,
  hasContact: digitsOnly(whatsappRaw).length >= 10 || phoneDisplay.length > 0,
};

export function contactWhatsAppUrl(context = "geral") {
  if (!CONTACT.hasWhatsApp) return null;

  const message =
    context === "rsvp"
      ? "Olá! Não encontrei meu convite no site do casamento. Pode me ajudar?"
      : context === "mural"
        ? "Olá! Tive dificuldade com o mural de mensagens no site do casamento."
        : "Olá! Tenho uma dúvida sobre o casamento.";

  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function parseBrlAmount(raw) {
  const cleaned = String(raw ?? "").replace(/[^\d.,]/g, "");
  if (!cleaned) return 0;

  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/,/g, "");

  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : 0;
}
