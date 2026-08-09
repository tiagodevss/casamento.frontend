import { AdminTextNotes } from "./AdminTextNotes";

const LABELS = {
  plural: "Restrições",
  fieldLabel: "Restrição alimentar",
  guestLabel: "Convite",
  createTitle: "Nova restrição",
  editTitle: "Editar restrição",
  createButton: "Nova restrição",
  formHint: "Restrição alimentar informada na confirmação da festa.",
  listHint: "Restrições alimentares reportadas pelos convidados",
  searchPlaceholder: "Buscar por convite ou restrição…",
  placeholder: "Ex.: sem glúten, vegetariano…",
  emptyIcon: "UtensilsCrossed",
  emptyTitle: "Nenhuma restrição registrada",
  emptyBody: "Quando os convidados informarem restrições alimentares, elas aparecem aqui.",
  deleteConfirm: "Remover a restrição de",
};

export function AdminDiets() {
  return <AdminTextNotes field="diet" labels={LABELS} />;
}
