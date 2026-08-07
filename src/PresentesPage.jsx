import { useEffect } from "react";

import { ActionPageLead } from "./ActionPageLead";
import { EXTERNAL_GIFT_LIST_URL } from "./data";
import { Icon } from "./effects";
import { SiteShell } from "./SiteShell";

export default function PresentesPage() {
  useEffect(() => {
    window.location.replace(EXTERNAL_GIFT_LIST_URL);
  }, []);

  return (
    <SiteShell>
      <ActionPageLead backLabel="Voltar ao convite" />
      <section className="section-band section-band--light gift-redirect">
        <div className="section-band__inner gift-redirect__inner">
          <h1 className="gift-redirect__title">Lista de presentes</h1>
          <p className="gift-redirect__text">
            Estamos te levando para a lista no Casar.com. Se isso não acontecer
            automaticamente, use o botão abaixo.
          </p>
          <a
            className="btn btn-gold"
            href={EXTERNAL_GIFT_LIST_URL}
            rel="noopener noreferrer"
          >
            <Icon name="Gift" size={18} /> Abrir lista de presentes
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
