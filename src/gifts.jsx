import { useEffect, useState } from "react";

import { GIFTS, WEDDING } from "./data";
import { Icon } from "./effects";

function QRPlaceholder() {
  const size = 21;
  const cells = [];
  const rnd = (i, j) => ((i * 928371 + j * 1237 + i * j * 13) % 7) < 3;

  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j < size; j += 1) {
      const inFinder = (x, y) => x < 7 && y < 7;
      const tl = inFinder(i, j);
      const tr = inFinder(i, size - 1 - j);
      const bl = inFinder(size - 1 - i, j);
      let on = false;

      if (tl || tr || bl) {
        const fi = tl ? i : tr ? i : size - 1 - i;
        const fj = tl ? j : tr ? size - 1 - j : j;
        on =
          fi === 0 ||
          fi === 6 ||
          fj === 0 ||
          fj === 6 ||
          (fi >= 2 && fi <= 4 && fj >= 2 && fj <= 4);
      } else {
        on = rnd(i, j);
      }

      if (on) cells.push(<rect key={`${i}-${j}`} x={j} y={i} width="1" height="1" fill="#0b0f2b" />);
    }
  }

  return <svg viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">{cells}</svg>;
}

function GiftModal({ gift, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(WEDDING.pixKey);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = WEDDING.pixKey;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
      } catch {}
      textArea.remove();
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="X" size={20} />
        </button>
        <div className="modal-emoji">
          <Icon name={gift.icon} size={32} />
        </div>
        <h3>{gift.title}</h3>
        <div className="modal-value">
          {gift.value ? `R$ ${Number(gift.value).toLocaleString("pt-BR")}` : "Valor livre"}
        </div>

        <div className="qr-box">
          <QRPlaceholder />
        </div>
        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: ".82rem", marginTop: "-.6rem", marginBottom: "1.2rem" }}>
          Aponte a câmera do seu banco ou copie a chave Pix abaixo
        </p>

        <div className="pix-row">
          <div className="pix-key">{WEDDING.pixKey}</div>
          <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copy}>
            <Icon name={copied ? "Check" : "Copy"} size={16} />
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <p className="thanks">
          Obrigado por iluminar a nossa nova jornada. Cada gesto de carinho vira luz no nosso
          caminho. 💛
        </p>
      </div>
    </div>
  );
}

export function GiftSection() {
  const [modal, setModal] = useState(null);
  const [customValue, setCustomValue] = useState("");

  const openCustom = () => {
    const value = parseFloat(String(customValue).replace(",", "."));
    setModal({
      icon: "Sparkles",
      title: "Contribuição livre",
      value: value > 0 ? value : 0,
      custom: true,
    });
  };

  return (
    <section className="section" id="presentes">
      <div className="section-head">
        <span className="eyebrow reveal">Escolha um presente para iluminar nossa jornada</span>
        <h2 className="section-title reveal d1">Lista de Presentes</h2>
        <p
          className="reveal d2"
          style={{ color: "var(--text-dim)", maxWidth: "48ch", margin: "1rem auto 0", lineHeight: 1.7 }}
        >
          Mais do que objetos, cada presente é uma lanterna que acende um pedaço do nosso futuro.
          Sua presença já é o nosso maior presente.
        </p>
        <div className="divider-flourish reveal d2">
          <span className="line" />
          <span className="dot" />
          <span className="line right" />
        </div>
      </div>

      <div className="gift-grid">
        {GIFTS.map((gift, index) => (
          <div className={`gift-card reveal ${["", "d1", "d2", "d3"][index % 4]}`} key={gift.id}>
            {gift.tag && <span className="gift-tag">{gift.tag}</span>}
            <span className="gift-emoji-wrap">
              <Icon name={gift.icon} size={22} />
            </span>
            <h3>{gift.title}</h3>
            <p className="gift-desc">{gift.desc}</p>
            <div className="gift-foot">
              <span className="gift-value">R$ {gift.value.toLocaleString("pt-BR")}</span>
              <button className="gift-give" onClick={() => setModal(gift)}>
                Presentear <span className="arr">→</span>
              </button>
            </div>
          </div>
        ))}

        <div className="gift-card free reveal">
          <span className="gift-emoji-wrap">
            <Icon name="HandHeart" size={22} />
          </span>
          <h3>Contribuição livre</h3>
          <p className="gift-desc">
            Quer nos presentear com um valor especial do seu coração? Escolha a quantia que
            desejar.
          </p>
          <div className="free-amount">
            <span className="cur">R$</span>
            <input
              value={customValue}
              onChange={(event) =>
                setCustomValue(event.target.value.replace(/[^\d.,]/g, ""))
              }
              placeholder="0,00"
              inputMode="decimal"
              aria-label="Valor da contribuição"
            />
          </div>
          <div className="gift-foot">
            <span />
            <button className="gift-give" onClick={openCustom}>
              Contribuir <span className="arr">→</span>
            </button>
          </div>
        </div>
      </div>

      {modal && <GiftModal gift={modal} onClose={() => setModal(null)} />}
    </section>
  );
}
