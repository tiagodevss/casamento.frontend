import { useEffect, useRef, useState } from "react";

import { WEDDING } from "./data";
import { Icon } from "./effects";
import { SectionHead } from "./SectionHead";

export function EventDetails() {
  const facts = [
    { icon: "Calendar", label: "Data", value: WEDDING.dateLabel },
    { icon: "Clock", label: "Horário", value: WEDDING.timeLabel },
    { icon: "MapPin", label: "Local", value: WEDDING.venue },
    { icon: "Shirt", label: "Traje", value: WEDDING.dressCode },
    { icon: "Map", label: "Endereço", value: WEDDING.address },
  ];

  return (
    <section className="section-band section-band--light" id="detalhes">
      <div className="section-band__inner">
        <SectionHead variant="logistics" title="O Grande Dia" />

        <div className="day-details reveal d1">
          <div className="day-details__info">
            <header className="day-details__intro">
              <p className="day-details__eyebrow">Cerimônia religiosa</p>
              <h3 className="day-details__names">{WEDDING.namesDisplay}</h3>
              <p className="day-details__lead">
                Esperamos você nesse dia tão importante para nós. Reunimos aqui o
                que você precisa para se programar e celebrar conosco com
                tranquilidade.
              </p>
              <p className="day-details__quote">
                Sua presença vai deixar esse momento ainda mais especial.
              </p>
            </header>

            <ul className="day-facts">
              {facts.map((item) => (
                <li className="day-fact" key={item.label}>
                  <Icon name={item.icon} size={16} className="day-fact__icon" />
                  <span className="day-fact__label">{item.label}</span>
                  <span className="day-fact__value">{item.value}</span>
                </li>
              ))}
            </ul>

            <a
              className="btn btn-ink day-details__cta"
              href={WEDDING.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="Navigation" size={18} /> Como chegar
            </a>

            <p className="day-details__note">
              Se puder, confirme sua presença com antecedência para nos ajudar na
              organização.
            </p>
          </div>

          <figure className="day-photo">
            {WEDDING.churchPhoto ? (
              <img
                className="day-photo__image"
                src={WEDDING.churchPhoto}
                alt={`Fachada da ${WEDDING.venue}`}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  const placeholder = event.currentTarget.nextElementSibling;
                  if (placeholder) placeholder.hidden = false;
                }}
              />
            ) : null}

            <figcaption className="day-photo__caption">
              <span className="day-photo__label">Local da cerimônia</span>
              <strong>{WEDDING.venue}</strong>
              <span>{WEDDING.address}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function LodgingSection() {
  return (
    <section className="section-band section-band--light lodging" id="hospedagem">
      <div className="section-band__inner lodging__inner">
        <SectionHead
          variant="logistics"
          title="Hospedagem"
          description="Se você vem de outra cidade e precisa de indicação de hotel ou pousada por perto, é só falar com a gente."
        />
        <p className="lodging__note reveal d2">
          Mande uma mensagem para o <strong>{WEDDING.groom}</strong> ou para a{" "}
          <strong>{WEDDING.bride}</strong> — temos algumas recomendações e
          ajudamos a encontrar a melhor opção para você.
        </p>
      </div>
    </section>
  );
}

export function Countdown() {
  const target = useRef(new Date(WEDDING.dateISO).getTime());
  const calc = () => {
    const diff = Math.max(0, target.current - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      done: diff === 0,
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const cells = [
    { n: time.d, l: "Dias" },
    { n: time.h, l: "Horas" },
    { n: time.m, l: "Minutos" },
    { n: time.s, l: "Segundos" },
  ];

  return (
    <section className="section countdown" id="contagem" style={{ paddingTop: "2rem" }}>
      <SectionHead
        variant="logistics"
        title={time.done ? "Foi um dia inesquecível" : "Falta pouco"}
        titleStyle={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)" }}
        headStyle={{ marginBottom: "1.5rem" }}
      />
      {!time.done && (
        <div className="count-grid reveal d2">
          {cells.map((cell) => (
            <div className="count-cell" key={cell.l}>
              <span className="corner tl" />
              <span className="corner br" />
              <div className="num">{String(cell.n).padStart(2, "0")}</div>
              <div className="lbl">{cell.l}</div>
            </div>
          ))}
        </div>
      )}
      <p className="countdown-note reveal d3">
        {time.done
          ? "Obrigado por fazer parte desse dia. Vamos guardar tudo com muito carinho."
          : "Cada dia que passa nos aproxima do nosso sim."}
      </p>
    </section>
  );
}
