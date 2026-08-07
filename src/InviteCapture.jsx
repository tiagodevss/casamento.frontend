import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { setStoredInviteId } from "./inviteStorage";

const INVITE_PARAM = "convite";

/**
 * On any route with ?convite=, persists the guest identity and cleans the query
 * from the URL while keeping the current path (e.g. / or /presentes).
 */
export function InviteCapture({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const inviteId = new URLSearchParams(location.search).get(INVITE_PARAM)?.trim() || "";

  useEffect(() => {
    if (!inviteId) return;
    setStoredInviteId(inviteId);
    navigate({ pathname: location.pathname, search: "" }, { replace: true });
  }, [inviteId, navigate, location.pathname]);

  if (inviteId) return null;

  return children;
}
