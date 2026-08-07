import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { setStoredInviteId } from "./inviteStorage";

const INVITE_PARAM = "convite";

/**
 * On /?convite=, persists the guest identity and cleans the URL to /.
 */
export function InviteCapture({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const inviteId =
    location.pathname === "/"
      ? new URLSearchParams(location.search).get(INVITE_PARAM)?.trim() || ""
      : "";

  useEffect(() => {
    if (!inviteId) return;
    setStoredInviteId(inviteId);
    navigate("/", { replace: true });
  }, [inviteId, navigate]);

  if (inviteId) return null;

  return children;
}
