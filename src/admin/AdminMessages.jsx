import { AdminTextNotes } from "./AdminTextNotes";

const LABELS = {
  plural: "Recados",
  fieldLabel: "Recado",
  guestLabel: "Convite",
  createTitle: "Novo recado",
  editTitle: "Editar recado",
  createButton: "Novo recado",
  formHint: "Mensagem deixada pelo convidado na confirmação de presença.",
  listHint: "Recados deixados pelos convidados na confirmação",
  searchPlaceholder: "Buscar por convite ou recado…",
  placeholder: "Escreva o recado…",
  emptyIcon: "MessageCircleHeart",
  emptyTitle: "Nenhum recado ainda",
  emptyBody: "Quando os convidados deixarem um recado na confirmação, eles aparecem aqui.",
  deleteConfirm: "Remover o recado de",
};

export function AdminMessages() {
  return <AdminTextNotes field="message" labels={LABELS} />;
}
