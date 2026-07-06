import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Confetti, useReveal } from "./effects";
import { Navbar } from "./hero";
import { Footer } from "./mural";
import { MusicPlayer } from "./music";
import { scrollToHash } from "./navigation";

export function SiteShell({ children }) {
  useReveal();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return undefined;
    const frame = requestAnimationFrame(() => {
      scrollToHash(location.hash, "auto");
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <div className="sky-backdrop" />
      <Confetti />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <MusicPlayer />
    </>
  );
}
