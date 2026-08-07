export const DEFAULT_INVITE_MESSAGE_TEMPLATE = `Olá, {{nome}}! 😊
Com muito carinho, viemos convidar vocês para celebrar o nosso casamento!
Confirmem a presença por aqui: {{link}}
Se quiserem nos presentear, preparamos uma listinha especial: {{presentes}}
Estamos ansiosos para celebrar esse dia inesquecível junto com vocês!`;

export const DEFAULT_INVITE_MESSAGE_TEMPLATE_SINGLE = `Olá, {{nome}}! 💛
Com muito carinho, viemos te convidar para celebrar o nosso casamento!
Confirme a presença por aqui: {{link}}
Se quiser nos presentear, preparamos uma listinha especial: {{presentes}}
Estamos ansiosos para celebrar esse dia inesquecível junto com você!`;

function resolveTemplate(template, memberCount) {
  const trimmed = (template ?? "").trim();
  const isSingle = memberCount === 1;
  const isDefault =
    trimmed === DEFAULT_INVITE_MESSAGE_TEMPLATE.trim() ||
    trimmed === DEFAULT_INVITE_MESSAGE_TEMPLATE_SINGLE.trim();
  if (!trimmed || isDefault) {
    return isSingle ? DEFAULT_INVITE_MESSAGE_TEMPLATE_SINGLE : DEFAULT_INVITE_MESSAGE_TEMPLATE;
  }
  return template;
}

export function fillInviteMessage(template, { displayName, members, link, giftLink }) {
  const memberList = members ?? [];
  const resolved = resolveTemplate(template, memberList.length);

  return resolved
    .replaceAll("{{nome}}", displayName ?? "")
    .replaceAll("{{link}}", link ?? "")
    .replaceAll("{{presentes}}", giftLink ?? "")
    .replaceAll(
      "{{pessoas}}",
      memberList.map((member) => member.name).filter(Boolean).join(", "),
    );
}

export function inviteConfirmLink(groupId, origin = window.location.origin) {
  return `${origin}/?convite=${groupId}`;
}

export function giftListLink(origin = window.location.origin) {
  return `${origin}/presentes`;
}
