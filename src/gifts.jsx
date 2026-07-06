import { useEffect, useRef, useState } from "react";

import { Icon } from "./effects";
import { api } from "./api";

const POLL_INTERVAL_MS = 5000;

function GiftModal({ gift, onClose }) {
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    async function createOrder() {
      setLoading(true);
      setError("");
      try {
        const payload = gift.custom
          ? { kind: "FREE_CONTRIBUTION", amountCents: Math.round(gift.value * 100), donorMessage: gift.title }
          : { kind: "FIXED_GIFT", giftId: gift.id };

        const created = await api.createPaymentOrder(payload);
        if (!cancelled) setOrder(created);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    createOrder();
    return () => {
      cancelled = true;
    };
  }, [gift]);

  useEffect(() => {
    if (!order || order.status === "PAID") return undefined;

    pollRef.current = setInterval(async () => {
      try {
        const status = await api.getPaymentStatus(order.id);
        if (status.status === "PAID") {
          setOrder((current) => ({ ...current, status: "PAID" }));
          clearInterval(pollRef.current);
        }
      } catch {
        // Silently retry on the next tick — a transient network hiccup shouldn't
        // interrupt the guest's checkout experience.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
  }, [order]);

  const copy = async () => {
    if (!order?.brCode) return;
    try {
      await navigator.clipboard.writeText(order.brCode);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = order.brCode;
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

        {order?.status === "PAID" ? (
          <div style={{ textAlign: "center", padding: "1.4rem 0" }}>
            <Icon name="CheckCircle2" size={40} />
            <p className="thanks" style={{ marginTop: "1rem" }}>
              Pagamento confirmado! Obrigado por iluminar a nossa nova jornada. 💛
            </p>
          </div>
        ) : loading ? (
          <p style={{ textAlign: "center", color: "var(--text-dim)", padding: "2rem 0" }}>
            Gerando seu Pix...
          </p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "var(--rose)", padding: "1rem 0" }}>{error}</p>
        ) : (
          <>
            <div className="qr-box">
              <img
                src={`data:image/png;base64,${order.brCodeBase64}`}
                alt="QR Code Pix"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
            <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: ".82rem", marginTop: "-.6rem", marginBottom: "1.2rem" }}>
              Aponte a câmera do seu banco ou copie o código Pix abaixo
            </p>

            <div className="pix-row">
              <div className="pix-key">{order.brCode}</div>
              <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copy}>
                <Icon name={copied ? "Check" : "Copy"} size={16} />
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <p className="thanks">
              Obrigado por iluminar a nossa nova jornada. Cada gesto de carinho vira luz no nosso
              caminho. 💛
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function GiftSection() {
  const [gifts, setGifts] = useState([]);
  const [modal, setModal] = useState(null);
  const [customValue, setCustomValue] = useState("");

  useEffect(() => {
    api
      .listGifts()
      .then((list) =>
        setGifts(
          list.map((gift) => ({
            id: gift.id,
            icon: gift.iconName,
            title: gift.title,
            desc: gift.description,
            value: gift.priceCents / 100,
            tag: gift.tag,
          })),
        ),
      )
      .catch(() => setGifts([]));
  }, []);

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
        {gifts.map((gift, index) => (
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
