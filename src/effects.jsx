import { useEffect, useRef, useState } from "react";
import {
  BookHeart,
  Calendar,
  Castle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Coffee,
  Compass,
  Copy,
  Feather,
  Flame,
  Gift,
  HandHeart,
  Heart,
  Image,
  Map,
  MapPin,
  Menu,
  MessageCircleHeart,
  MousePointerClick,
  Navigation,
  Pause,
  PenLine,
  Phone,
  Play,
  RotateCcw,
  Send,
  Shirt,
  Sparkle,
  Sparkles,
  User,
  Users,
  Utensils,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { LANTERN_MESSAGES } from "./data";

const icons = {
  BookHeart,
  Calendar,
  Castle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  Copy,
  Feather,
  Flame,
  Gift,
  HandHeart,
  Heart,
  Image,
  Map,
  MapPin,
  Menu,
  MessageCircleHeart,
  MousePointerClick,
  Navigation,
  Pause,
  PenLine,
  Phone,
  Play,
  RotateCcw,
  Send,
  Shirt,
  Sparkle,
  Sparkles,
  User,
  Users,
  Utensils,
  UtensilsCrossed,
  X,
};

export function Icon({ name, size = 22, stroke = 1.8, className, style }) {
  const LucideIcon = icons[name] ?? CircleAlert;
  return (
    <LucideIcon
      size={size}
      strokeWidth={stroke}
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
}

export function PhotoFrame({ src, label, ornate = true, className = "", caption }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`photo-frame ${ornate ? "ornate" : ""} ${className}`}>
      {src && !failed && (
        <img
          src={src}
          alt={caption || label || "Foto do casal"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity .6s",
            zIndex: 1,
          }}
        />
      )}
      {!loaded && (
        <div className="ph-inner">
          <span className="ph-icon">
            <Icon name="Image" size={30} />
          </span>
          <span className="ph-label">{label || src}</span>
        </div>
      )}
      {ornate && (
        <>
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
        </>
      )}
    </div>
  );
}

export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

export function ScrollThread() {
  const fill = useRef(null);

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const progress = height > 0 ? (window.scrollY / height) * 100 : 0;
        if (fill.current) fill.current.style.width = `${progress}%`;
        raf = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="scroll-thread">
      <div className="fill" ref={fill} />
    </div>
  );
}

export function CursorTrail() {
  const layer = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return undefined;

    let last = 0;
    const onMove = (event) => {
      const now = performance.now();
      if (now - last < 28) return;
      last = now;

      const spark = document.createElement("span");
      spark.className = "spark";
      spark.style.left = `${event.clientX + (Math.random() - 0.5) * 10}px`;
      spark.style.top = `${event.clientY + (Math.random() - 0.5) * 10}px`;

      const scale = 0.5 + Math.random();
      spark.style.width = `${8 * scale}px`;
      spark.style.height = `${8 * scale}px`;
      layer.current?.appendChild(spark);
      setTimeout(() => spark.remove(), 820);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return <div ref={layer} aria-hidden="true" />;
}

export function FloatingLanterns() {
  const lanternRefs = useRef([]);
  const hideTimer = useRef(null);
  const [msg, setMsg] = useState(null);
  const lanterns = useRef(null);

  if (lanterns.current === null) {
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = reduce ? 6 : isMobile ? 9 : 18;
    let messageIndex = 0;

    lanterns.current = Array.from({ length: count }, (_, index) => {
      const depth = Math.random();
      const interactive =
        !reduce &&
        index % Math.max(2, Math.round(count / LANTERN_MESSAGES.length)) === 0 &&
        messageIndex < LANTERN_MESSAGES.length;

      const lantern = {
        id: index,
        left: Math.random() * 96,
        bottom: -10 - Math.random() * 30,
        size: 22 + depth * 46,
        depth,
        opacity: 0.35 + depth * 0.6,
        riseDur: 35 - depth * 13 + Math.random() * 11,
        swayDur: 3 + Math.random() * 3,
        delay: -Math.random() * 30,
        blur: (1 - depth) * 2.4,
        interactive,
        message: interactive ? LANTERN_MESSAGES[messageIndex++] : null,
      };

      return lantern;
    });
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return undefined;

    let raf = null;
    let tx = 0;
    let ty = 0;

    const onMove = (event) => {
      tx = event.clientX / window.innerWidth - 0.5;
      ty = event.clientY / window.innerHeight - 0.5;
      if (raf) return;

      raf = requestAnimationFrame(() => {
        lanternRefs.current.forEach((el) => {
          if (!el) return;
          const depth = Number(el.dataset.depth);
          el.style.transform = `translate(${-tx * depth * 46}px, ${-ty * depth * 28}px)`;
        });
        raf = null;
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const reveal = (lantern, event) => {
    if (!lantern.message) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setMsg({ x: rect.left + rect.width / 2, y: rect.top, ...lantern.message });
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setMsg(null), 3600);
  };

  return (
    <>
      <div className="lantern-field" aria-hidden="true">
        {lanterns.current.map((lantern) => (
          <div
            key={lantern.id}
            ref={(el) => {
              lanternRefs.current[lantern.id] = el;
            }}
            data-depth={lantern.depth}
            className={`lantern ${lantern.interactive ? "interactive" : ""}`}
            onClick={(event) => reveal(lantern, event)}
            style={{
              left: `${lantern.left}%`,
              bottom: `${lantern.bottom}vh`,
              width: `${lantern.size}px`,
              height: `${lantern.size * 1.3}px`,
              opacity: lantern.opacity,
              filter: lantern.blur ? `blur(${lantern.blur}px)` : "none",
              zIndex: Math.round(lantern.depth * 5),
            }}
          >
            <div
              className="body"
              style={{
                animationDuration: `${lantern.riseDur}s, ${lantern.swayDur}s`,
                animationDelay: `${lantern.delay}s, ${lantern.delay}s`,
              }}
            >
              <span className="glow" />
              <span className="cap" />
              <span className="shape" />
              <span className="flame" />
            </div>
          </div>
        ))}
      </div>
      {msg && (
        <div className="lantern-message" style={{ left: msg.x, top: msg.y }}>
          <div className="msg-label">{msg.label}</div>
          <div className="msg-text">{msg.text}</div>
        </div>
      )}
    </>
  );
}

export function Confetti() {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    const onBurst = () => {
      const colors = ["#f0d49a", "#e6c178", "#d8a94a", "#ffcf86", "#c4b3ec", "#d49a9b"];
      const id = Date.now();
      const pieces = Array.from({ length: 90 }, (_, index) => ({
        id: `${id}-${index}`,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        dur: 2.4 + Math.random() * 2.2,
        color: colors[index % colors.length],
        rot: Math.random() * 360,
        size: 6 + Math.random() * 8,
      }));

      setBursts((current) => [...current, { id, pieces }]);
      setTimeout(() => {
        setBursts((current) => current.filter((burst) => burst.id !== id));
      }, 5200);
    };

    window.addEventListener("magic-confetti", onBurst);
    return () => window.removeEventListener("magic-confetti", onBurst);
  }, []);

  return (
    <div className="confetti-layer" aria-hidden="true">
      {bursts.map((burst) =>
        burst.pieces.map((piece) => (
          <span
            key={piece.id}
            className="confetti"
            style={{
              left: `${piece.left}%`,
              background: piece.color,
              width: `${piece.size}px`,
              height: `${piece.size * 1.5}px`,
              transform: `rotate(${piece.rot}deg)`,
              animationDuration: `${piece.dur}s`,
              animationDelay: `${piece.delay}s`,
            }}
          />
        )),
      )}
    </div>
  );
}

export function fireConfetti() {
  window.dispatchEvent(new Event("magic-confetti"));
}

export function MiniLantern({ size = 70 }) {
  return (
    <div style={{ width: size, height: size * 1.3, position: "relative", margin: "0 auto" }}>
      <span
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "240%",
          height: "240%",
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(circle, rgba(255,207,134,.5), transparent 65%)",
          borderRadius: "50%",
        }}
      />
      <span
        className="shape"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "18% 18% 22% 22% / 12% 12% 16% 16%",
          background:
            "var(--tangled-sun) center/100% 100% no-repeat, linear-gradient(180deg,#f3982f 0%,#f8af45 30%,#fcc861 55%,#ffe6a0 82%,#fff4cf 100%)",
          boxShadow:
            "inset 0 -12px 20px rgba(255,240,180,.7), inset 0 8px 14px rgba(200,100,25,.35), 0 0 22px rgba(255,180,90,.6)",
        }}
      />
      <span
        className="flame"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "5%",
          transform: "translateX(-50%)",
          width: "54%",
          height: "20%",
          background: "radial-gradient(ellipse at 50% 90%, #fff8e2 0%, #ffe08a 45%, transparent 72%)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
