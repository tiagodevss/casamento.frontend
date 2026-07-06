import { ActionPageLead } from "./ActionPageLead";
import { GiftSection } from "./gifts";
import { SiteShell } from "./SiteShell";

export default function PresentesPage() {
  return (
    <SiteShell>
      <ActionPageLead backLabel="Voltar ao convite" />
      <GiftSection standalone />
    </SiteShell>
  );
}
