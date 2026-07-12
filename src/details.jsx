import { useEffect, useRef, useState } from "react";

import { WEDDING } from "./data";
import { Icon } from "./effects";
import { SectionHead } from "./SectionHead";

export function EventDetails() {
  const primaryFacts = [
    { icon: "Calendar", label: "Data", value: WEDDING.dateLabel },
    { icon: "Clock", label: "Horário", value: WEDDING.timeLabel },
    { icon: "MapPin", label: "Local", value: WEDDING.venue },
  ];

  const secondaryFacts = [
    { icon: "Shirt", label: "Traje", value: WEDDING.dressCode },
    { icon: "Map", label: "Endereço", value: WEDDING.address },
  ];

  return (
    <section className="section-band section-band--light" id="detalhes">
      <div className="section-band__inner">
        <SectionHead variant="logistics" title="O Grande Dia" />
        <div className="parchment reveal d1" style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="day-highlight">
            <div className="day-highlight__intro">
              <span className="day-highlight__eyebrow">Informações da cerimônia</span>
              <h2 className="day-highlight__title">Esperamos você nesse dia tão importante para nós</h2>
              <p className="day-highlight__lead">
                Reunimos aqui o que você precisa para se programar e celebrar conosco com
                tranquilidade.
              </p>
            </div>

            <div className="day-highlight__layout">
              <div className="day-highlight__panel">
                <div className="day-highlight__header">
                  <span className="day-highlight__badge">Cerimônia religiosa</span>
                  <h3 className="invite-intro__names">{WEDDING.namesDisplay}</h3>
                  <p className="invite-intro__quote">
                    Sua presença vai deixar esse momento ainda mais especial.
                  </p>
                </div>

                <ul className="invite-facts">
                  {primaryFacts.map((item) => (
                    <li className="invite-fact" key={item.label}>
                      <Icon name={item.icon} size={16} className="invite-fact__icon" />
                      <span className="invite-fact__label">{item.label}</span>
                      <span className="invite-fact__value">{item.value}</span>
                    </li>
                  ))}
                </ul>

                <div className="invite-secondary">
                  {secondaryFacts.map((item) => (
                    <div className="invite-secondary__item" key={item.label}>
                      <Icon name={item.icon} size={15} className="invite-secondary__icon" />
                      <span className="invite-secondary__label">{item.label}</span>
                      <span className="invite-secondary__value">{item.value}</span>
                    </div>
                  ))}
                </div>

                <a
                  className="btn btn-ink invite-stub__cta"
                  href={WEDDING.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="Navigation" size={18} /> Como chegar
                </a>
              </div>

              <div className="church-photo-card">
                <div className="church-photo-card__frame">
                  <span className="church-photo-card__tag">Local da cerimônia</span>
                  {WEDDING.churchPhoto ? (
                    <img
                      className="church-photo-card__image"
                      src={WEDDING.churchPhoto}
                      alt={`Fachada da ${WEDDING.venue}`}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        const placeholder = event.currentTarget.nextElementSibling;
                        if (placeholder) placeholder.hidden = false;
                      }}
                    />
                  ) : null}
                  <div
                    className="church-photo-card__placeholder"
                    hidden={Boolean(WEDDING.churchPhoto)}
                  >
                    <Icon name="Image" size={24} />
                    <span>Foto do local da cerimônia</span>
                  </div>
                </div>

                <div className="church-photo-card__caption">
                  <span className="church-photo-card__label">Cerimônia</span>
                  <strong>{WEDDING.venue}</strong>
                  <p>{WEDDING.address}</p>
                </div>
              </div>
            </div>
          </div>

          <p className="invite-note">
            Se puder, confirme sua presença com antecedência para nos ajudar na organização.
          </p>
        </div>
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
