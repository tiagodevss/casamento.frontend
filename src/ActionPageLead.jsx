import { Link } from "react-router-dom";

import { Icon, MiniLantern } from "./effects";

export function ActionPageLead({ backTo = "/", backLabel = "Voltar ao convite" }) {
  return (
    <div className="action-page-lead section-band section-band--light">
      <div className="section-band__inner action-page-lead__inner">
        <Link to={backTo} className="action-back">
          <Icon name="ChevronLeft" size={18} aria-hidden="true" />
          {backLabel}
        </Link>
        <div className="action-page-lead__lantern" aria-hidden="true">
          <MiniLantern size={48} />
        </div>
      </div>
    </div>
  );
}
