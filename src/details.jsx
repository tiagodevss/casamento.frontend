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
        <div className="parchment reveal d1" style={{ maxWidth: 880, margin: "0 auto" }}>
          <span className="deco-seal">
            <Icon name="Heart" size={22} />
          </span>

          <div className="invite-card">
            <div className="invite-intro">
              <span className="eyebrow invite-intro__eyebrow">
                Com a bênção de Deus e de nossas famílias
              </span>
              <h2 className="invite-intro__names">{WEDDING.namesDisplay}</h2>
              <p className="invite-intro__quote">
                convidam você para celebrar o início da nossa eternidade.
              </p>
            </div>

            <div className="invite-divider" aria-hidden="true" />

            <div className="invite-stub">
              <ul className="invite-facts">
                {facts.map((item) => (
                  <li className="invite-fact" key={item.label}>
                    <Icon name={item.icon} size={16} className="invite-fact__icon" />
                    <span className="invite-fact__label">{item.label}</span>
                    <span className="invite-fact__value">{item.value}</span>
                  </li>
                ))}
              </ul>

              <a
                className="btn btn-ink invite-stub__cta"
                href={WEDDING.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="Navigation" size={18} /> Como chegar
              </a>
            </div>
          </div>

          <p className="invite-note">
            Cada presença acende uma luz nesse dia. Será uma alegria imensa ter você conosco.
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
        title={
          time.done
            ? "Foi um dia inesquecível"
            : "Contagem regressiva para o nosso felizes para sempre"
        }
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
      <p
        className="reveal d3"
        style={{
          color: "var(--text-dim)",
          marginTop: time.done ? "0.5rem" : "2rem",
          fontFamily: "var(--font-script)",
          fontStyle: "italic",
          fontSize: "clamp(1.65rem, 3.6vw, 2.2rem)",
          maxWidth: "42ch",
          marginInline: "auto",
          textAlign: "center",
          lineHeight: 1.08,
        }}
      >
        {time.done
          ? "Obrigado por ter feito parte do nosso céu de luzes. Guardamos cada momento com carinho."
          : "Cada segundo nos aproxima do momento em que diremos “sim”."}
      </p>
    </section>
  );
}
