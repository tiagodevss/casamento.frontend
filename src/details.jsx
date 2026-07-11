import { useEffect, useRef, useState } from "react";

import { WEDDING } from "./data";
import { Icon } from "./effects";
import { SectionHead } from "./SectionHead";

export function EventDetails() {
  const items = [
    { icon: "Calendar", label: "Data", value: WEDDING.dateLabel },
    { icon: "Clock", label: "Horário", value: WEDDING.timeLabel },
    { icon: "MapPin", label: "Local", value: WEDDING.venue },
    { icon: "Shirt", label: "Traje", value: WEDDING.dressCode, sm: true },
  ];

  return (
    <section className="section-band section-band--light" id="detalhes">
      <div className="section-band__inner">
      <SectionHead variant="logistics" title="O Grande Dia" />

      <div className="parchment reveal d1" style={{ maxWidth: 880, margin: "0 auto" }}>
        <span className="deco-seal">
          <Icon name="Heart" size={22} />
        </span>
        <span className="eyebrow" style={{ display: "block", textAlign: "center", marginBottom: ".6rem" }}>
          Com a bênção de Deus e de nossas famílias
        </span>
        <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>{WEDDING.namesDisplay}</h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--ink-soft)",
            fontFamily: "var(--font-script)",
            fontStyle: "italic",
            fontSize: "clamp(1.7rem, 3.8vw, 2.4rem)",
            lineHeight: 1,
            margin: ".6rem 0 0",
          }}
        >
          convidam você para celebrar o início da nossa eternidade.
        </p>

        <div className="details-grid">
          {items.map((item) => (
            <div className="detail-item" key={item.label}>
              <span className="di-icon">
                <Icon name={item.icon} size={22} />
              </span>
              <div>
                <div className="di-label">{item.label}</div>
                <div className={`di-value ${item.sm ? "sm" : ""}`}>{item.value}</div>
              </div>
            </div>
          ))}
          <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
            <span className="di-icon">
              <Icon name="Map" size={22} />
            </span>
            <div>
              <div className="di-label">Endereço</div>
              <div className="di-value sm">{WEDDING.address}</div>
            </div>
          </div>
        </div>

        <div className="map-btn">
          <a className="btn btn-ink" href={WEDDING.mapsUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="Navigation" size={18} /> Como chegar
          </a>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "var(--ink-soft)",
            fontSize: ".92rem",
            marginTop: "1.6rem",
            lineHeight: 1.6,
          }}
        >
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
            : "Faltam poucos dias para o nosso felizes para sempre"
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
