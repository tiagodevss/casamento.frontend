export const DEFAULT_INVITE_MESSAGE_TEMPLATE = `Querido(a) convidado,🤍
{{nome}}

Nosso grande dia está cada vez mais próximo, e estamos muito felizes por poder compartilhar esse momento tão especial com vocês.

Nosso site do casamento já está disponível! Nele, vocês encontrarão todas as informações sobre a cerimônia e a recepção, além de poderem confirmar sua presença.

Pedimos, com carinho, que realizem a confirmação para nos ajudar na organização desse dia tão sonhado até 01/10/2026✨

✨ Acesse nosso site:
{{link}}

Será uma alegria imensa celebrar esse momento ao lado de pessoas tão especiais. Esperamos por vocês! 🤍`;

export const DEFAULT_INVITE_MESSAGE_TEMPLATE_SINGLE = `Querido(a) convidado,🤍
{{nome}}

Nosso grande dia está cada vez mais próximo, e estamos muito felizes por poder compartilhar esse momento tão especial com você.

Nosso site do casamento já está disponível! Nele, você encontrará todas as informações sobre a cerimônia e a recepção, além de poder confirmar sua presença.

Pedimos, com carinho, que realize a confirmação para nos ajudar na organização desse dia tão sonhado até 01/10/2026✨

✨ Acesse nosso site:
{{link}}

Será uma alegria imensa celebrar esse momento ao lado de pessoas tão especiais. Esperamos por você! 🤍`;

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

export function giftListLink(groupId, origin = window.location.origin) {
  return `${origin}/presentes?convite=${groupId}`;
}
