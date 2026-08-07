export const DEFAULT_INVITE_MESSAGE_TEMPLATE = `Olá, {{nome}}! 💛
Vocês estão convidados para o nosso casamento.
Confirmem a presença por aqui: {{link}}`;

export function fillInviteMessage(template, { displayName, members, link }) {
  return (template || DEFAULT_INVITE_MESSAGE_TEMPLATE)
    .replaceAll("{{nome}}", displayName ?? "")
    .replaceAll("{{link}}", link ?? "")
    .replaceAll(
      "{{pessoas}}",
      (members ?? []).map((member) => member.name).filter(Boolean).join(", "),
    );
}

export function inviteConfirmLink(groupId, origin = window.location.origin) {
  return `${origin}/confirmar?convite=${groupId}`;
}
