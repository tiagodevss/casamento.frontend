export const DEFAULT_INVITE_MESSAGE_TEMPLATE = `Olá, {{nome}}! 💛
Vocês estão convidados para o nosso casamento.
Confirmem a presença por aqui: {{link}}`;

export const DEFAULT_INVITE_MESSAGE_TEMPLATE_SINGLE = `Olá, {{nome}}! 💛
Você está convidado para o nosso casamento.
Confirme a presença por aqui: {{link}}`;

function resolveTemplate(template, memberCount) {
  const trimmed = (template ?? "").trim();
  const isSingle = memberCount === 1;
  if (!trimmed || trimmed === DEFAULT_INVITE_MESSAGE_TEMPLATE.trim()) {
    return isSingle ? DEFAULT_INVITE_MESSAGE_TEMPLATE_SINGLE : DEFAULT_INVITE_MESSAGE_TEMPLATE;
  }
  return template;
}

export function fillInviteMessage(template, { displayName, members, link }) {
  const memberList = members ?? [];
  const resolved = resolveTemplate(template, memberList.length);

  return resolved
    .replaceAll("{{nome}}", displayName ?? "")
    .replaceAll("{{link}}", link ?? "")
    .replaceAll(
      "{{pessoas}}",
      memberList.map((member) => member.name).filter(Boolean).join(", "),
    );
}

export function inviteConfirmLink(groupId, origin = window.location.origin) {
  return `${origin}/?convite=${groupId}`;
}
