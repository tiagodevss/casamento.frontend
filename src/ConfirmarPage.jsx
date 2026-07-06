import { ActionPageLead } from "./ActionPageLead";
import { RSVPForm } from "./rsvp";
import { SiteShell } from "./SiteShell";

export default function ConfirmarPage() {
  return (
    <SiteShell>
      <ActionPageLead />
      <RSVPForm standalone />
    </SiteShell>
  );
}
