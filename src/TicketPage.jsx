import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode";

import { api } from "./api";
import { ActionPageLead } from "./ActionPageLead";
import { Icon } from "./effects";
import { SiteShell } from "./SiteShell";
import { PARTY, WEDDING } from "./data";

export default function TicketPage() {
  const { token } = useParams();
  const [ticket, setTicket] = useState(null);
  const [qrSrc, setQrSrc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .getTicket(token)
      .then(async (data) => {
        if (cancelled) return;
        setTicket(data);
        if (data.valid) {
          // Alto contraste e margem de silêncio: precisa ler bem em brilho baixo e no print.
          const src = await QRCode.toDataURL(data.checkinUrl, {
            width: 560,
            margin: 2,
            errorCorrectionLevel: "M",
            color: { dark: "#1a1710", light: "#ffffff" },
          });
          if (!cancelled) setQrSrc(src);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <SiteShell>
      <ActionPageLead backLabel="Voltar ao convite" />
      <section className="section-band section-band--light ticket">
        <div className="section-band__inner ticket__inner">
          {error && (
            <>
              <h1 className="ticket__title">Ingresso não encontrado</h1>
              <p className="ticket__text">
                Confira se o link está completo. Se precisar de ajuda, responda a mensagem que
                recebeu da nossa assistente no WhatsApp.
              </p>
            </>
          )}

          {!error && !ticket && <p className="ticket__text">Carregando seu ingresso...</p>}

          {ticket && !ticket.valid && (
            <>
              <h1 className="ticket__title">Ingresso indisponível</h1>
              <p className="ticket__text">
                Este convite não tem presença na festa confirmada. Se isso estiver errado, fale com
                os noivos pelo WhatsApp.
              </p>
            </>
          )}

          {ticket?.valid && (
            <>
              <p className="ticket__eyebrow">
                <Icon name="PartyPopper" size={16} /> Entrada na festa
              </p>
              <h1 className="ticket__title">{ticket.displayName}</h1>
              <div className="ticket__qr">
                {qrSrc ? (
                  <img src={qrSrc} alt="QR Code de entrada na festa" width="280" height="280" />
                ) : (
                  <span className="ticket__text">Gerando QR Code...</span>
                )}
              </div>
              <p className="ticket__people">
                Vale para {ticket.peopleCount} {ticket.peopleCount === 1 ? "pessoa" : "pessoas"}:
                <strong> {ticket.people.join(", ")}</strong>
              </p>
              <p className="ticket__text">
                Mostre este QR Code na entrada da chácara (pode ser um print da tela). Cada QR Code
                vale uma única entrada.
              </p>
              <ul className="ticket__facts">
                <li>
                  <Icon name="Calendar" size={16} /> {WEDDING.dateLabel}
                </li>
                <li>
                  <Icon name="PartyPopper" size={16} /> {PARTY.timeLabel}: {PARTY.venue}
                </li>
                <li>
                  <Icon name="MapPin" size={16} /> {PARTY.address}
                </li>
              </ul>
              <a className="btn btn-gold" href={PARTY.mapsUrl} rel="noopener noreferrer">
                <Icon name="MapPin" size={18} /> Ver rota da festa
              </a>
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
