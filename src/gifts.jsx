import { useEffect, useRef, useState } from "react";

import { Icon } from "./effects";
import { api, resolveUploadUrl } from "./api";
import { parseBrlAmount } from "./contact";
import { SectionHead } from "./SectionHead";

const POLL_INTERVAL_MS = 5000;

function pixQrImageSrc(brCodeBase64) {
  if (!brCodeBase64) return undefined;
  return brCodeBase64.startsWith("data:")
    ? brCodeBase64
    : `data:image/png;base64,${brCodeBase64}`;
}

function GiftVisual({ gift, size = 22, className = "gift-emoji-wrap" }) {
  const url = resolveUploadUrl(gift.imagePath);
  if (url) {
    return (
      <span className={className} style={{ padding: 0, overflow: "hidden" }}>
        <img
          src={url}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </span>
    );
  }
  return (
    <span className={className}>
      <Icon name={gift.icon} size={size} />
    </span>
  );
}

function GiftModal({ gift, onClose }) {
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const pollRef = useRef(null);
  const giftRef = useRef(gift);

  giftRef.current = gift;

  const createOrder = async () => {
    const current = giftRef.current;
    setLoading(true);
    setError("");
    setOrder(null);
    setAwaitingPayment(false);
    try {
      const payload = current.custom
        ? { kind: "FREE_CONTRIBUTION", amountCents: Math.round(current.value * 100), donorMessage: current.title }
        : { kind: "FIXED_GIFT", giftId: current.id };

      const created = await api.createPaymentOrder(payload);
      setOrder(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    createOrder();
  }, [gift.id, gift.custom, gift.value]);

  useEffect(() => {
    if (!order || order.status === "PAID") return undefined;

    setAwaitingPayment(true);
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.getPaymentStatus(order.id);
        if (status.status === "PAID") {
          setOrder((current) => ({ ...current, status: "PAID" }));
          setAwaitingPayment(false);
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
          <GiftVisual gift={gift} size={32} />
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
          <p style={{ textAlign: "center", color: "var(--ink-soft)", padding: "2rem 0" }}>
            Gerando seu Pix...
          </p>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <p style={{ color: "var(--rose)", marginBottom: "1.2rem" }}>{error}</p>
            <button type="button" className="btn btn-ghost" onClick={createOrder}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <p className="pix-status" role="status" aria-live="polite">
              {awaitingPayment
                ? "Aguardando confirmação do pagamento Pix..."
                : "Escaneie o QR Code ou copie o código abaixo"}
            </p>

            <div className="qr-box">
              <img
                src={pixQrImageSrc(order.brCodeBase64)}
                alt="QR Code Pix"
                style={{ width: "100%", height: "auto" }}
              />
            </div>

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

export function GiftSection({ standalone = false }) {
  const [gifts, setGifts] = useState([]);
  const [giftsLoading, setGiftsLoading] = useState(true);
  const [giftsError, setGiftsError] = useState(false);
  const [modal, setModal] = useState(null);
  const [customValue, setCustomValue] = useState("");
  const [customError, setCustomError] = useState("");

  const loadGifts = () => {
    setGiftsLoading(true);
    setGiftsError(false);

    api
      .listGifts()
      .then((list) =>
        setGifts(
          list.map((gift) => ({
            id: gift.id,
            icon: gift.iconName,
            imagePath: gift.imagePath ?? null,
            title: gift.title,
            desc: gift.description,
            value: gift.priceCents / 100,
            tag: gift.tag,
          })),
        ),
      )
      .catch(() => {
        setGifts([]);
        setGiftsError(true);
      })
      .finally(() => setGiftsLoading(false));
  };

  useEffect(() => {
    loadGifts();
  }, []);

  const openCustom = () => {
    const value = parseBrlAmount(customValue);
    if (value <= 0) {
      setCustomError("Informe um valor válido (ex.: 150,00)");
      return;
    }
    setCustomError("");
    setModal({
      icon: "Sparkles",
      title: "Contribuição livre",
      value,
      custom: true,
    });
  };

  const sectionClass = `section-band section-band--light${standalone ? " action-page-form" : ""}`;

  return (
    <section className={sectionClass} id={standalone ? undefined : "presentes"}>
      <div className="section-band__inner">
      <SectionHead
        variant="action"
        title="Lista de Presentes"
        description="Mais do que objetos, cada presente é uma lanterna que acende um pedaço do nosso futuro. Sua presença já é o nosso maior presente."
      />

      {giftsLoading && (
        <p className="status-line" aria-live="polite">
          Carregando lista de presentes...
        </p>
      )}

      {giftsError && (
        <div className="status-panel" role="alert">
          <p>Não foi possível carregar os presentes agora.</p>
          <button type="button" className="btn btn-ghost" onClick={loadGifts}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="gift-grid">
        {gifts.map((gift, index) => (
          <div className={`gift-card reveal ${["", "d1", "d2", "d3"][index % 4]}`} key={gift.id}>
            {gift.tag && <span className="gift-tag">{gift.tag}</span>}
            <GiftVisual gift={gift} />
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
              onChange={(event) => {
                setCustomValue(event.target.value.replace(/[^\d.,]/g, ""));
                if (customError) setCustomError("");
              }}
              placeholder="0,00"
              inputMode="decimal"
              aria-label="Valor da contribuição"
              aria-describedby="custom-amount-error"
            />
          </div>
          {customError && (
            <span id="custom-amount-error" className="err-msg" role="alert">
              {customError}
            </span>
          )}
          <div className="gift-foot">
            <span />
            <button className="gift-give" onClick={openCustom}>
              Contribuir <span className="arr">→</span>
            </button>
          </div>
        </div>
      </div>

      {modal && <GiftModal gift={modal} onClose={() => setModal(null)} />}
      </div>
    </section>
  );
}
