import { CONTACT, contactWhatsAppUrl } from "./contact";
import { WEDDING } from "./data";
import { Icon } from "./effects";

export function ContactHelp({ context = "geral", compact = false }) {
  const whatsappUrl = contactWhatsAppUrl(context);

  return (
    <aside className={`contact-help ${compact ? "contact-help--compact" : ""}`} aria-label="Ajuda e contato">
      <p className="contact-help-lead">
        {context === "rsvp"
          ? "Não achou seu convite? Tente o sobrenome da família ou o nome de quem recebeu o convite."
          : "Precisa de ajuda?"}
      </p>

      {CONTACT.hasContact ? (
        <div className="contact-help-actions">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              className="contact-link contact-link--whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="MessageCircleHeart" size={15} />
              WhatsApp
            </a>
          )}
          {CONTACT.hasPhone && (
            <a href={`tel:${CONTACT.phoneDisplay.replace(/\s/g, "")}`} className="contact-link">
              <Icon name="Phone" size={15} />
              {CONTACT.phoneDisplay}
            </a>
          )}
        </div>
      ) : (
        <p className="contact-help-fallback">
          Se ainda tiver dúvidas, fale com {WEDDING.groom} ou {WEDDING.bride}, ou com quem te
          convidou para o casamento.
        </p>
      )}
    </aside>
  );
}
