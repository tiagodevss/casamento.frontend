import { useEffect, useMemo, useState } from "react";

import { api } from "../api";
import { Icon } from "../effects";
import "./cerimonialista.css";

const AUDIENCE_LABELS = {
  ALL: "Todos com convite enviado",
  RSVP_PENDING: "RSVP pendente",
  CONFIRMED: "Confirmados",
  CEREMONY_ONLY_CONFIRMED: "Confirmados — somente informações da cerimônia",
  PARTY_CONFIRMED: "Confirmados — cerimônia + festa",
  CUSTOM: "Convidados selecionados",
};

const STATUS_LABELS = {
  DRAFT: "Rascunho",
  SCHEDULED: "Agendada",
  PROCESSING: "Enviando",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  FAILED: "Falhou",
};

const DELIVERY_LABELS = {
  PENDING: "Pendentes",
  PROCESSING: "Processando",
  SENT: "Enviadas",
  DELIVERED: "Entregues",
  READ: "Lidas",
  FAILED: "Falhas",
  SKIPPED: "Ignoradas",
};

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function statusTone(status) {
  if (["COMPLETED", "DELIVERED", "READ", "SENT"].includes(status)) return "success";
  if (["FAILED", "CANCELLED"].includes(status)) return "danger";
  if (["SCHEDULED", "PROCESSING"].includes(status)) return "info";
  return "neutral";
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`cer-badge cer-badge--${tone}`}>{children}</span>;
}

function Stat({ label, value, hint }) {
  return (
    <div className="adm-card cer-stat">
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function ErrorBanner({ error, onClear }) {
  if (!error) return null;
  return (
    <div className="cer-alert cer-alert--danger">
      <span>{error}</span>
      <button type="button" onClick={onClear} aria-label="Fechar erro">
        ×
      </button>
    </div>
  );
}

function SuccessBanner({ message }) {
  return message ? <div className="cer-alert cer-alert--success">{message}</div> : null;
}

export function AdminCerimonialista() {
  const [view, setView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [guests, setGuests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [preview, setPreview] = useState(null);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [deliveryCampaign, setDeliveryCampaign] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [scheduleValues, setScheduleValues] = useState({});
  const [qrCode, setQrCode] = useState("");
  const [busy, setBusy] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Teste da cerimonialista digital 💛");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateDraft, setTemplateDraft] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    templateId: "",
    audience: "RSVP_PENDING",
    scheduledAt: "",
    includeGuestGroupIds: [],
  });

  const run = async (key, action, okMessage) => {
    setBusy(key);
    setError("");
    setSuccess("");
    try {
      const result = await action();
      if (okMessage) setSuccess(okMessage);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy("");
    }
  };

  const loadStatus = async () => {
    try {
      const nextStatus = await api.getWhatsAppStatus();
      setStatus(nextStatus);
      return nextStatus;
    } catch (err) {
      const unavailable = { connected: false, state: "UNAVAILABLE", error: err.message };
      setStatus(unavailable);
      return unavailable;
    }
  };

  const loadCore = async () => {
    const [statsData, campaignData, templateData, guestData, conversationData] = await Promise.all([
      api.getCommunicationStats(),
      api.listCommunicationCampaigns(),
      api.listCommunicationTemplates(),
      api.listGuestGroups(),
      api.listWhatsAppConversations(),
    ]);
    setStats(statsData);
    setCampaigns(campaignData);
    setTemplates(templateData);
    setGuests(guestData);
    setConversations(conversationData);
    setScheduleValues(
      Object.fromEntries(campaignData.map((item) => [item.id, toDateTimeLocal(item.scheduledAt)])),
    );
    if (!selectedTemplateId && templateData[0]) {
      setSelectedTemplateId(templateData[0].id);
      setTemplateDraft({ ...templateData[0] });
    }
  };

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadStatus(), loadCore()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(loadStatus, 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (template) setTemplateDraft({ ...template });
  }, [selectedTemplateId, templates]);

  const pendingHuman = useMemo(
    () => conversations.filter((message) => message.needsHuman && !message.resolvedAt),
    [conversations],
  );

  const connect = async () => {
    const result = await run("connect", () => api.connectWhatsApp(), "Sessão iniciada. Leia o QR Code se necessário.");
    if (!result) return;
    const nextStatus = await loadStatus();
    if (!nextStatus?.connected) {
      const qr = await run("qr", () => api.getWhatsAppQrCode());
      if (qr?.qrCode) setQrCode(qr.qrCode);
    }
  };

  const reloadQr = async () => {
    const qr = await run("qr", () => api.getWhatsAppQrCode());
    if (qr?.qrCode) setQrCode(qr.qrCode);
  };

  const disconnect = async () => {
    const result = await run("disconnect", () => api.disconnectWhatsApp(), "WhatsApp desconectado.");
    if (result !== null) {
      setQrCode("");
      await loadStatus();
    }
  };

  const sendTest = async (event) => {
    event.preventDefault();
    const result = await run(
      "test",
      () => api.sendWhatsAppTest({ phone: testPhone, message: testMessage }),
      "Mensagem de teste enviada.",
    );
    if (result) await loadCore();
  };

  const openPreview = async (campaign) => {
    const result = await run(`preview-${campaign.id}`, () => api.previewCommunicationCampaign(campaign.id));
    if (!result) return;
    setPreview(result);
    setPreviewCampaign(campaign);
    await loadCore();
  };

  const openHistory = async (campaign) => {
    const result = await run(`history-${campaign.id}`, () => api.listCommunicationDeliveries(campaign.id));
    if (!result) return;
    setDeliveries(result);
    setDeliveryCampaign(campaign);
  };

  const scheduleCampaign = async (campaign) => {
    const local = scheduleValues[campaign.id];
    if (!local) {
      setError("Escolha a data e o horário da campanha.");
      return;
    }
    const result = await run(
      `schedule-${campaign.id}`,
      () => api.scheduleCommunicationCampaign(campaign.id, new Date(local).toISOString()),
      "Campanha agendada.",
    );
    if (result) await loadCore();
  };

  const sendNow = async (campaign) => {
    if (!window.confirm(`Enviar agora a campanha “${campaign.name}”? O público será revalidado antes de cada mensagem.`)) return;
    const result = await run(
      `send-${campaign.id}`,
      () => api.sendCommunicationCampaignNow(campaign.id),
      "Campanha colocada na fila de envio.",
    );
    if (result) await loadCore();
  };

  const cancelCampaign = async (campaign) => {
    if (!window.confirm(`Cancelar a campanha “${campaign.name}”?`)) return;
    const result = await run(
      `cancel-${campaign.id}`,
      () => api.cancelCommunicationCampaign(campaign.id),
      "Campanha cancelada.",
    );
    if (result) await loadCore();
  };

  const saveTemplate = async (event) => {
    event.preventDefault();
    if (!templateDraft) return;
    const result = await run(
      "template",
      () =>
        api.updateCommunicationTemplate(templateDraft.id, {
          name: templateDraft.name,
          description: templateDraft.description ?? "",
          bodySingle: templateDraft.bodySingle,
          bodyGroup: templateDraft.bodyGroup,
          active: templateDraft.active,
        }),
      "Template salvo. Campanhas relacionadas precisarão ser visualizadas novamente antes do envio.",
    );
    if (result) await loadCore();
  };

  const createCampaign = async (event) => {
    event.preventDefault();
    const payload = {
      name: newCampaign.name,
      templateId: newCampaign.templateId,
      audience: newCampaign.audience,
      requireInviteSent: true,
      includeGuestGroupIds:
        newCampaign.audience === "CUSTOM" ? newCampaign.includeGuestGroupIds : [],
      ...(newCampaign.scheduledAt
        ? { scheduledAt: new Date(newCampaign.scheduledAt).toISOString() }
        : {}),
    };
    const result = await run(
      "create-campaign",
      () => api.createCommunicationCampaign(payload),
      "Campanha criada como rascunho. Visualize o público antes de agendar.",
    );
    if (!result) return;
    setNewCampaignOpen(false);
    setNewCampaign({
      name: "",
      templateId: "",
      audience: "RSVP_PENDING",
      scheduledAt: "",
      includeGuestGroupIds: [],
    });
    await loadCore();
  };

  const toggleGuest = (id) => {
    setNewCampaign((current) => ({
      ...current,
      includeGuestGroupIds: current.includeGuestGroupIds.includes(id)
        ? current.includeGuestGroupIds.filter((item) => item !== id)
        : [...current.includeGuestGroupIds, id],
    }));
  };

  const reply = async (message) => {
    const text = (replyDrafts[message.id] ?? "").trim();
    if (!text) return;
    const result = await run(
      `reply-${message.id}`,
      () => api.replyWhatsAppConversation(message.id, text),
      "Resposta enviada.",
    );
    if (!result) return;
    setReplyDrafts((current) => ({ ...current, [message.id]: "" }));
    await loadCore();
  };

  const resolve = async (message) => {
    const result = await run(
      `resolve-${message.id}`,
      () => api.resolveWhatsAppConversation(message.id),
      "Conversa marcada como resolvida.",
    );
    if (result) await loadCore();
  };

  if (loading) return <p className="adm-hint">Carregando cerimonialista digital...</p>;

  const qrSrc = qrCode
    ? qrCode.startsWith("data:")
      ? qrCode
      : `data:image/png;base64,${qrCode}`
    : "";

  return (
    <div className="cer">
      <div className="cer-header">
        <div>
          <h1>Cerimonialista digital</h1>
          <p>Comunicações automáticas e atendimento determinístico pelo WhatsApp, sem IA.</p>
        </div>
        <button type="button" className="adm-btn adm-btn-secondary" onClick={refresh}>
          <Icon name="RefreshCw" size={14} /> Atualizar
        </button>
      </div>

      <ErrorBanner error={error} onClear={() => setError("")} />
      <SuccessBanner message={success} />

      <div className="cer-tabs" role="tablist">
        {[
          ["overview", "Visão geral"],
          ["campaigns", "Campanhas"],
          ["templates", "Templates"],
          ["conversations", `Atendimento${pendingHuman.length ? ` (${pendingHuman.length})` : ""}`],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={view === id ? "is-active" : ""}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "overview" ? (
        <div className="cer-stack">
          <section className="adm-card adm-card-pad cer-connection">
            <div className="cer-section-head">
              <div>
                <h2>WhatsApp</h2>
                <p className="adm-hint">WPPConnect roda isolado do backend principal.</p>
              </div>
              <Badge tone={status?.connected ? "success" : "danger"}>
                {status?.connected ? "Conectado" : status?.state === "UNAVAILABLE" ? "Indisponível" : "Desconectado"}
              </Badge>
            </div>
            {status?.error ? <p className="cer-inline-error">{status.error}</p> : null}
            <div className="cer-actions">
              {!status?.connected ? (
                <>
                  <button type="button" className="adm-btn adm-btn-primary" disabled={busy === "connect"} onClick={connect}>
                    <Icon name="Link" size={14} /> {busy === "connect" ? "Conectando..." : "Conectar WhatsApp"}
                  </button>
                  <button type="button" className="adm-btn adm-btn-secondary" disabled={busy === "qr"} onClick={reloadQr}>
                    Atualizar QR Code
                  </button>
                </>
              ) : (
                <button type="button" className="adm-btn adm-btn-danger" disabled={busy === "disconnect"} onClick={disconnect}>
                  Desconectar
                </button>
              )}
            </div>
            {qrSrc && !status?.connected ? (
              <div className="cer-qr">
                <img src={qrSrc} alt="QR Code para conectar o WhatsApp" />
                <p>WhatsApp → Dispositivos conectados → Conectar dispositivo.</p>
              </div>
            ) : null}
          </section>

          <div className="cer-stats-grid">
            <Stat label="Convites com WhatsApp" value={stats?.base?.withPhone} hint={`${stats?.base?.peopleWithPhone ?? 0} pessoas representadas`} />
            <Stat label="Sem telefone" value={stats?.base?.withoutPhone} />
            <Stat label="Opt-outs" value={stats?.base?.optOuts} hint="Não recebem automações" />
            <Stat label="Aguardando humano" value={stats?.pendingHuman} />
          </div>

          <div className="cer-overview-grid">
            <section className="adm-card adm-card-pad">
              <div className="cer-section-head">
                <h2>Próxima comunicação</h2>
              </div>
              {stats?.nextCampaign ? (
                <>
                  <strong>{stats.nextCampaign.name}</strong>
                  <p>{formatDateTime(stats.nextCampaign.scheduledAt)}</p>
                  <p className="adm-hint">{AUDIENCE_LABELS[stats.nextCampaign.audience] ?? stats.nextCampaign.audience}</p>
                </>
              ) : (
                <p className="adm-hint">Nenhuma campanha agendada.</p>
              )}
            </section>

            <section className="adm-card adm-card-pad">
              <div className="cer-section-head">
                <h2>Histórico de entregas</h2>
              </div>
              <div className="cer-delivery-summary">
                {Object.entries(stats?.deliveries ?? {}).map(([key, value]) => (
                  <div key={key}>
                    <span>{DELIVERY_LABELS[key] ?? key}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
                {!Object.keys(stats?.deliveries ?? {}).length ? <p className="adm-hint">Nenhum envio ainda.</p> : null}
              </div>
            </section>
          </div>

          <form className="adm-card adm-card-pad" onSubmit={sendTest}>
            <div className="cer-section-head">
              <div>
                <h2>Mensagem de teste</h2>
                <p className="adm-hint">Use seu próprio número antes de ativar campanhas reais.</p>
              </div>
            </div>
            <div className="cer-test-grid">
              <input className="adm-input" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="(19) 99999-9999" required />
              <input className="adm-input" value={testMessage} onChange={(e) => setTestMessage(e.target.value)} required />
              <button className="adm-btn adm-btn-primary" disabled={busy === "test" || !status?.connected}>
                Enviar teste
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {view === "campaigns" ? (
        <div className="cer-stack">
          <div className="cer-toolbar">
            <div>
              <h2>Plano de comunicações</h2>
              <p className="adm-hint">Toda campanha precisa de preview antes de poder ser agendada ou enviada.</p>
            </div>
            <button type="button" className="adm-btn adm-btn-primary" onClick={() => setNewCampaignOpen((v) => !v)}>
              <Icon name="Plus" size={14} /> Nova comunicação
            </button>
          </div>

          {newCampaignOpen ? (
            <form className="adm-card adm-card-pad cer-new-campaign" onSubmit={createCampaign}>
              <h3>Nova comunicação</h3>
              <div className="cer-form-grid">
                <label>
                  Nome
                  <input className="adm-input" value={newCampaign.name} onChange={(e) => setNewCampaign((c) => ({ ...c, name: e.target.value }))} required />
                </label>
                <label>
                  Template
                  <select className="adm-select" value={newCampaign.templateId} onChange={(e) => setNewCampaign((c) => ({ ...c, templateId: e.target.value }))} required>
                    <option value="">Selecione...</option>
                    {templates.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label>
                  Público
                  <select className="adm-select" value={newCampaign.audience} onChange={(e) => setNewCampaign((c) => ({ ...c, audience: e.target.value, includeGuestGroupIds: [] }))}>
                    {Object.entries(AUDIENCE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </label>
                <label>
                  Data sugerida
                  <input type="datetime-local" className="adm-input" value={newCampaign.scheduledAt} onChange={(e) => setNewCampaign((c) => ({ ...c, scheduledAt: e.target.value }))} />
                </label>
              </div>
              {newCampaign.audience === "CUSTOM" ? (
                <div className="cer-guest-picker">
                  <strong>Selecione os convites</strong>
                  {guests.map((group) => (
                    <label key={group.id}>
                      <input type="checkbox" checked={newCampaign.includeGuestGroupIds.includes(group.id)} onChange={() => toggleGuest(group.id)} />
                      <span>{group.displayName}</span>
                      <small>{group.members?.length ?? 0} pessoa(s)</small>
                    </label>
                  ))}
                </div>
              ) : null}
              <div className="cer-actions">
                <button className="adm-btn adm-btn-primary" disabled={busy === "create-campaign"}>Criar rascunho</button>
                <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setNewCampaignOpen(false)}>Cancelar</button>
              </div>
            </form>
          ) : null}

          <div className="cer-campaign-list">
            {campaigns.map((campaign) => {
              const editable = ["DRAFT", "SCHEDULED"].includes(campaign.status);
              return (
                <article className="adm-card cer-campaign" key={campaign.id}>
                  <div className="cer-campaign-main">
                    <div>
                      <div className="cer-campaign-title">
                        <strong>{campaign.name}</strong>
                        <Badge tone={statusTone(campaign.status)}>{STATUS_LABELS[campaign.status] ?? campaign.status}</Badge>
                      </div>
                      <p>{campaign.template?.name}</p>
                      <small>{AUDIENCE_LABELS[campaign.audience] ?? campaign.audience}</small>
                    </div>
                    <div className="cer-campaign-count">
                      <strong>{campaign._count?.deliveries ?? 0}</strong>
                      <span>envios registrados</span>
                    </div>
                  </div>

                  {editable ? (
                    <div className="cer-campaign-controls">
                      <input
                        type="datetime-local"
                        className="adm-input"
                        value={scheduleValues[campaign.id] ?? ""}
                        onChange={(e) => setScheduleValues((current) => ({ ...current, [campaign.id]: e.target.value }))}
                      />
                      <button type="button" className="adm-btn adm-btn-secondary" disabled={busy === `preview-${campaign.id}`} onClick={() => openPreview(campaign)}>
                        <Icon name="Eye" size={14} /> Ver público
                      </button>
                      <button type="button" className="adm-btn adm-btn-ghost" disabled={busy === `history-${campaign.id}`} onClick={() => openHistory(campaign)}>
                        Histórico
                      </button>
                      <button type="button" className="adm-btn adm-btn-secondary" disabled={!campaign.previewedAt || busy === `schedule-${campaign.id}`} onClick={() => scheduleCampaign(campaign)}>
                        <Icon name="Calendar" size={14} /> Agendar
                      </button>
                      <button type="button" className="adm-btn adm-btn-primary" disabled={!campaign.previewedAt || busy === `send-${campaign.id}`} onClick={() => sendNow(campaign)}>
                        Enviar agora
                      </button>
                      {campaign.status === "SCHEDULED" ? (
                        <button type="button" className="adm-btn adm-btn-ghost" onClick={() => cancelCampaign(campaign)}>Cancelar</button>
                      ) : null}
                    </div>
                  ) : (
                    <div className="cer-campaign-finished">
                      <span>Agendada: {formatDateTime(campaign.scheduledAt)}</span>
                      <span>{campaign.status === "PROCESSING" ? "Iniciada" : "Finalizada"}: {formatDateTime(campaign.status === "PROCESSING" ? campaign.startedAt : campaign.finishedAt)}</span>
                      <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" disabled={busy === `history-${campaign.id}`} onClick={() => openHistory(campaign)}>
                        Ver histórico
                      </button>
                      {campaign.status === "PROCESSING" ? (
                        <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" disabled={busy === `cancel-${campaign.id}`} onClick={() => cancelCampaign(campaign)}>
                          Interromper envios
                        </button>
                      ) : null}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "templates" ? (
        <div className="cer-stack">
          <div className="cer-toolbar">
            <div>
              <h2>Templates</h2>
              <p className="adm-hint">As versões individual e família são escolhidas automaticamente conforme o convite.</p>
            </div>
          </div>
          <div className="cer-template-layout">
            <aside className="adm-card cer-template-list">
              {templates.map((template) => (
                <button key={template.id} type="button" className={selectedTemplateId === template.id ? "is-active" : ""} onClick={() => setSelectedTemplateId(template.id)}>
                  <strong>{template.name}</strong>
                  <small>{template.key}</small>
                </button>
              ))}
            </aside>
            {templateDraft ? (
              <form className="adm-card adm-card-pad cer-template-editor" onSubmit={saveTemplate}>
                <label>
                  Nome
                  <input className="adm-input" value={templateDraft.name} onChange={(e) => setTemplateDraft((c) => ({ ...c, name: e.target.value }))} />
                </label>
                <label>
                  Descrição
                  <input className="adm-input" value={templateDraft.description ?? ""} onChange={(e) => setTemplateDraft((c) => ({ ...c, description: e.target.value }))} />
                </label>
                <label>
                  Mensagem — convite individual
                  <textarea className="adm-textarea" rows={10} value={templateDraft.bodySingle} onChange={(e) => setTemplateDraft((c) => ({ ...c, bodySingle: e.target.value }))} />
                </label>
                <label>
                  Mensagem — família / grupo
                  <textarea className="adm-textarea" rows={10} value={templateDraft.bodyGroup} onChange={(e) => setTemplateDraft((c) => ({ ...c, bodyGroup: e.target.value }))} />
                </label>
                <p className="adm-hint">
                  Variáveis: {"{{nome}}"}, {"{{pessoas}}"}, {"{{pendentes}}"}, {"{{confirmados}}"}, {"{{dias_faltando}}"}, {"{{link}}"}, {"{{presentes}}"}, {"{{site}}"}, {"{{maps_cerimonia}}"}, {"{{maps_festa}}"}.
                </p>
                <label className="cer-checkbox">
                  <input type="checkbox" checked={templateDraft.active} onChange={(e) => setTemplateDraft((c) => ({ ...c, active: e.target.checked }))} /> Ativo
                </label>
                <button className="adm-btn adm-btn-primary" disabled={busy === "template"}>Salvar template</button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}

      {view === "conversations" ? (
        <div className="cer-stack">
          <div className="cer-toolbar">
            <div>
              <h2>Atendimento</h2>
              <p className="adm-hint">O menu automático resolve opções 1–3. A opção 4 fica sinalizada aqui para atendimento humano.</p>
            </div>
          </div>
          <div className="cer-conversations">
            {pendingHuman.length === 0 ? (
              <div className="adm-card adm-card-pad"><p className="adm-hint">Nenhuma conversa aguardando atendimento humano.</p></div>
            ) : null}
            {pendingHuman.map((message) => (
              <article className="adm-card adm-card-pad cer-conversation" key={message.id}>
                <div className="cer-section-head">
                  <div>
                    <strong>{message.guestGroup?.displayName ?? message.phone}</strong>
                    <p className="adm-hint">{message.phone} · {formatDateTime(message.createdAt)}</p>
                  </div>
                  <Badge tone="danger">Aguardando resposta</Badge>
                </div>
                <blockquote>{message.body}</blockquote>
                <textarea className="adm-textarea" rows={3} placeholder="Responder pelo WhatsApp..." value={replyDrafts[message.id] ?? ""} onChange={(e) => setReplyDrafts((current) => ({ ...current, [message.id]: e.target.value }))} />
                <div className="cer-actions">
                  <button type="button" className="adm-btn adm-btn-primary" disabled={busy === `reply-${message.id}`} onClick={() => reply(message)}>Responder</button>
                  <button type="button" className="adm-btn adm-btn-secondary" disabled={busy === `resolve-${message.id}`} onClick={() => resolve(message)}>Marcar resolvido</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {deliveryCampaign ? (
        <div className="cer-modal-backdrop" role="presentation" onMouseDown={() => setDeliveryCampaign(null)}>
          <div className="adm-card cer-preview-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="cer-section-head">
              <div>
                <h2>Histórico — {deliveryCampaign.name}</h2>
                <p className="adm-hint">Cada linha representa um convite/telefone, não uma pessoa.</p>
              </div>
              <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setDeliveryCampaign(null)}>Fechar</button>
            </div>
            <div className="cer-history-table-wrap">
              <table className="adm-data-table cer-history-table">
                <thead><tr><th>Convite</th><th>Status</th><th>Tentativas</th><th>Enviado</th><th>Detalhe</th></tr></thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td><strong>{delivery.guestGroup?.displayName ?? delivery.phone}</strong><br/><small>{delivery.phone}</small></td>
                      <td><Badge tone={statusTone(delivery.status)}>{DELIVERY_LABELS[delivery.status] ?? delivery.status}</Badge></td>
                      <td>{delivery.attempts}</td>
                      <td>{formatDateTime(delivery.sentAt)}</td>
                      <td><small>{delivery.skippedReason ?? delivery.lastError ?? "—"}</small></td>
                    </tr>
                  ))}
                  {deliveries.length === 0 ? <tr><td colSpan="5" className="adm-hint">Nenhuma entrega registrada.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {preview ? (
        <div className="cer-modal-backdrop" role="presentation" onMouseDown={() => setPreview(null)}>
          <div className="adm-card cer-preview-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="cer-section-head">
              <div>
                <h2>Preview — {previewCampaign?.name}</h2>
                <p className="adm-hint">Nenhum envio acontece nesta etapa.</p>
              </div>
              <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setPreview(null)}>Fechar</button>
            </div>
            <div className="cer-preview-summary">
              <Stat label="Convites" value={preview.invitationCount} />
              <Stat label="Pessoas representadas" value={preview.peopleCount} />
              <Stat label="Excluídos" value={preview.excluded?.length ?? 0} />
            </div>
            <div className="cer-preview-columns">
              <div>
                <h3>Incluídos</h3>
                <div className="cer-preview-list">
                  {preview.included?.map((item) => (
                    <details key={item.guestGroupId}>
                      <summary><strong>{item.displayName}</strong><span>{item.memberCount} pessoa(s)</span></summary>
                      <pre>{item.message}</pre>
                    </details>
                  ))}
                </div>
              </div>
              <div>
                <h3>Excluídos</h3>
                <div className="cer-preview-list cer-preview-list--excluded">
                  {preview.excluded?.map((item) => (
                    <div key={item.guestGroupId}><strong>{item.displayName}</strong><span>{item.reason}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
