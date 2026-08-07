import { Link } from "react-router-dom";

import { Icon } from "./effects";
import { SectionHead } from "./SectionHead";

export function GiftListSection() {
  return (
    <section className="section-band section-band--light gifts-home" id="presentes">
      <div className="section-band__inner gifts-home__inner">
        <SectionHead
          variant="logistics"
          title="Lista de Presentes"
          description="A sua presença já é o nosso maior presente. Se quiser nos presentear, reunimos algumas sugestões que vão ajudar a montar a nossa casa."
        />
        <p className="gifts-home__note reveal d2">
          A lista está no Casar.com — escolha o que fizer sentido para você, com
          carinho e sem compromisso.
        </p>
        <div className="gifts-home__cta reveal d3">
          <Link to="/presentes" className="btn btn-ink">
            <Icon name="Gift" size={18} /> Ver lista de presentes
          </Link>
        </div>
      </div>
    </section>
  );
}
