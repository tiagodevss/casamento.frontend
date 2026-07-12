import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";

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
  const [loading, setLoading] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const pollRef = useRef(null);
  const giftRef = useRef(gift);

  giftRef.current = gift;

  const createOrder = async (method = paymentMethod) => {
    const current = giftRef.current;
    setLoading(true);
    setError("");
    setOrder(null);
    setAwaitingPayment(false);
    try {
      const payload = current.custom
        ? {
            kind: "FREE_CONTRIBUTION",
            method,
            amountCents: Math.round(current.value * 100),
            donorMessage: current.title,
          }
        : { kind: "FIXED_GIFT", method, giftId: current.id };

      const created = await api.createPaymentOrder(payload);
      if (method === "CARD") {
        if (!created.checkoutUrl) {
          throw new Error("O checkout do cartão não foi retornado. Tente novamente.");
        }
        window.location.href = created.checkoutUrl;
        return;
      }

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
    setPaymentMethod("PIX");
    setOrder(null);
    setError("");
    setLoading(false);
    setAwaitingPayment(false);
  }, [gift.id, gift.custom, gift.value]);

  useEffect(() => {
    if (paymentMethod !== "PIX" || order || loading || error) return;
    createOrder("PIX");
  }, [paymentMethod, order, loading, error]);

  useEffect(() => {
    if (!order || order.status === "PAID" || paymentMethod !== "PIX") return undefined;

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

  // Portal para o body: escapa dos stacking contexts das seções (lantern-zone)
  // para o overlay realmente cobrir a navbar.
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--payment" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <Icon name="X" size={20} />
        </button>
        <div className="modal-payment-layout">
          <aside className="modal-payment-visual">
            <div className="modal-emoji">
              <GiftVisual gift={gift} size={32} className="gift-emoji-wrap gift-emoji-wrap--modal" />
            </div>
            <div className="modal-visual-copy">
              <h3>{gift.title}</h3>
              <div className="modal-value">
                {gift.value ? `R$ ${Number(gift.value).toLocaleString("pt-BR")}` : "Valor livre"}
              </div>
              <p className="modal-visual-note">Escolha como prefere presentear e siga com o pagamento.</p>
            </div>
          </aside>

          <div className="modal-payment-main">
            <div className="payment-methods" aria-label="Método de pagamento">
              <button
                type="button"
                className={`payment-method ${paymentMethod === "PIX" ? "is-active" : ""}`}
                onClick={() => {
                  setPaymentMethod("PIX");
                  setError("");
                }}
                aria-pressed={paymentMethod === "PIX"}
              >
                <span className="payment-method__label">Pix</span>
                <span className="payment-method__meta">QR Code e copia e cola</span>
              </button>
              <button
                type="button"
                className={`payment-method ${paymentMethod === "CARD" ? "is-active" : ""}`}
                onClick={() => {
                  setPaymentMethod("CARD");
                  setError("");
                  setOrder(null);
                  setAwaitingPayment(false);
                }}
                aria-pressed={paymentMethod === "CARD"}
              >
                <span className="payment-method__label">Cartão de crédito</span>
                <span className="payment-method__meta">Checkout seguro da AbacatePay</span>
              </button>
            </div>

            <div className="payment-panel">
              {order?.status === "PAID" ? (
                <div className="payment-state payment-state--success">
                  <Icon name="CheckCircle2" size={40} />
                  <p className="thanks" style={{ marginTop: "1rem" }}>
                    Pagamento confirmado. Obrigado pelo presente e pelo carinho com a nossa nova fase.
                  </p>
                </div>
              ) : paymentMethod === "CARD" ? (
                <div className="payment-state payment-state--card">
                  <p className="pix-status">
                    Você será redirecionado para o checkout seguro da AbacatePay para concluir o pagamento com cartão.
                  </p>
                  <button type="button" className="btn btn-gold payment-checkout-btn" onClick={() => createOrder("CARD")} disabled={loading}>
                    <Icon name="CreditCard" size={16} />
                    {loading ? "Abrindo checkout..." : "Pagar com cartão"}
                  </button>
                  <p className="thanks">
                    Ao finalizar o pagamento, você volta para o site e a confirmação é registrada automaticamente.
                  </p>
                  {error && (
                    <p className="payment-error" role="alert">
                      {error}
                    </p>
                  )}
                </div>
              ) : loading ? (
                <p className="payment-state payment-state--muted">Gerando o Pix...</p>
              ) : error ? (
                <div className="payment-state payment-state--error">
                  <p style={{ color: "var(--rose)", marginBottom: "1.2rem" }}>{error}</p>
                  <button type="button" className="btn btn-ghost" onClick={createOrder}>
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <>
                  <p className="pix-status" role="status" aria-live="polite">
                    {awaitingPayment
                      ? "Aguardando a confirmação do pagamento..."
                      : "Escaneie o QR Code ou copie o código Pix abaixo"}
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

                  <p className="thanks">Obrigado por fazer parte desse começo com a gente.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function GiftSection({ standalone = false }) {
  const location = useLocation();
  const [gifts, setGifts] = useState([]);
  const [giftsLoading, setGiftsLoading] = useState(true);
  const [giftsError, setGiftsError] = useState(false);
  const [modal, setModal] = useState(null);
  const [customValue, setCustomValue] = useState("");
  const [customError, setCustomError] = useState("");
  const [returnMessage, setReturnMessage] = useState(null);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get("payment");
    const orderId = params.get("order");

    if (!payment || !orderId) {
      setReturnMessage(null);
      return undefined;
    }

    let cancelled = false;

    const resolveReturn = async () => {
      if (payment === "cancelled") {
        if (!cancelled) {
          setReturnMessage({
            tone: "info",
            text: "O checkout de cartão foi interrompido. Se quiser, você pode tentar novamente.",
          });
        }
        return;
      }

      if (!cancelled) {
        setReturnMessage({
          tone: "info",
          text: "Pagamento concluído no checkout. Estamos confirmando com a AbacatePay...",
        });
      }

      for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
          const status = await api.getPaymentStatus(orderId);
          if (cancelled) return;
          if (status.status === "PAID") {
            setReturnMessage({
              tone: "success",
              text: "Pagamento confirmado. Obrigado pelo presente e pelo carinho com a nossa nova fase.",
            });
            return;
          }
        } catch {
          // Try again shortly; the webhook may still be processing.
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!cancelled) {
        setReturnMessage({
          tone: "info",
          text: "Recebemos seu retorno do checkout. A confirmação pode levar alguns instantes para aparecer.",
        });
      }
    };

    resolveReturn();

    return () => {
      cancelled = true;
    };
  }, [location.search]);

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
        description="Se você quiser nos presentear, reunimos aqui algumas opções que vão nos ajudar a montar a nossa casa. Sua presença já é motivo de alegria para nós."
      />

      <p className="gift-intro reveal d1">
        Escolha o item que fizer sentido para você ou, se preferir, faça uma contribuição em
        qualquer valor.
      </p>

      {returnMessage && (
        <div className={`status-panel reveal d1 payment-return payment-return--${returnMessage.tone}`} role="status">
          <p>{returnMessage.text}</p>
        </div>
      )}

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
                Escolher <span className="arr">→</span>
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
            Se preferir, você também pode contribuir com o valor que quiser.
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
              Continuar <span className="arr">→</span>
            </button>
          </div>
        </div>
      </div>

      {modal && <GiftModal gift={modal} onClose={() => setModal(null)} />}
      </div>
    </section>
  );
}
