import { useEffect, useRef, useState } from "react";
import {
  Bed,
  BookHeart,
  Calendar,
  Candy,
  Castle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Coffee,
  Compass,
  CookingPot,
  Copy,
  CreditCard,
  Dice5,
  Drill,
  Droplet,
  Feather,
  Flame,
  Flower2,
  Gift,
  HandHeart,
  Heart,
  Home,
  Image,
  Lamp,
  LayoutGrid,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Map,
  MapPin,
  Menu,
  MessageCircleHeart,
  Microwave,
  MousePointerClick,
  Music,
  Navigation,
  Pause,
  Pencil,
  PenLine,
  Phone,
  PiggyBank,
  Play,
  Plus,
  Popcorn,
  Refrigerator,
  RotateCcw,
  Sandwich,
  Search,
  Send,
  ShowerHead,
  Shirt,
  Snowflake,
  Sofa,
  Soup,
  Sparkle,
  Sparkles,
  Trash2,
  Tv,
  User,
  Users,
  Utensils,
  UtensilsCrossed,
  WashingMachine,
  Wine,
  Wrench,
  X,
} from "lucide-react";

import { LANTERN_MESSAGES } from "./data";

const icons = {
  Bed,
  BookHeart,
  Calendar,
  Candy,
  Castle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  CookingPot,
  Copy,
  CreditCard,
  Dice5,
  Drill,
  Droplet,
  Feather,
  Flame,
  Flower2,
  Gift,
  HandHeart,
  Heart,
  Home,
  Image,
  Lamp,
  LayoutGrid,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Map,
  MapPin,
  Menu,
  MessageCircleHeart,
  Microwave,
  MousePointerClick,
  Music,
  Navigation,
  Pause,
  Pencil,
  PenLine,
  Phone,
  PiggyBank,
  Play,
  Plus,
  Popcorn,
  Refrigerator,
  RotateCcw,
  Sandwich,
  Search,
  Send,
  ShowerHead,
  Shirt,
  Snowflake,
  Sofa,
  Soup,
  Sparkle,
  Sparkles,
  Trash2,
  Tv,
  User,
  Users,
  Utensils,
  UtensilsCrossed,
  WashingMachine,
  Wine,
  Wrench,
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
    const observed = new WeakSet();

    const reveal = (el) => {
      if (observed.has(el)) return;
      observed.add(el);
      el.classList.add("in");
    };

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(reveal);
      return undefined;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
    );

    const scan = () => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
        if (inView) {
          reveal(el);
        } else {
          obs.observe(el);
        }
      });
    };

    scan();

    const mo = new MutationObserver(scan);
    mo.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      obs.disconnect();
      mo.disconnect();
    };
  }, []);
}

export function FloatingLanterns({ scoped = false, count: countOverride, interactive = true }) {
  const lanternRefs = useRef([]);
  const hideTimer = useRef(null);
  const [msg, setMsg] = useState(null);
  const lanterns = useRef(null);

  if (lanterns.current === null) {
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const defaultCount = scoped ? (isMobile ? 4 : 6) : isMobile ? 6 : 10;
    const count = countOverride ?? (reduce ? 3 : defaultCount);
    let messageIndex = 0;

    lanterns.current = Array.from({ length: count }, (_, index) => {
      const depth = Math.random();
      const canInteract =
        interactive &&
        !reduce &&
        index % Math.max(2, Math.round(count / LANTERN_MESSAGES.length)) === 0 &&
        messageIndex < LANTERN_MESSAGES.length;

      const lantern = {
        id: index,
        left: Math.random() * 96,
        bottom: -10 - Math.random() * 30,
        size: 22 + depth * 46,
        depth,
        opacity: scoped ? 0.18 + depth * 0.32 : 0.28 + depth * 0.45,
        riseDur: 35 - depth * 13 + Math.random() * 11,
        swayDur: 3 + Math.random() * 3,
        delay: -Math.random() * 30,
        blur: (1 - depth) * 2.4,
        interactive: canInteract,
        message: canInteract ? LANTERN_MESSAGES[messageIndex++] : null,
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
          el.style.transform = `translate(${-tx * depth * 24}px, ${-ty * depth * 14}px)`;
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
      <div
        className={`lantern-field ${scoped ? "lantern-field--scoped" : ""}`}
        aria-hidden="true"
      >
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
      const colors = ["#f2e090", "#eed060", "#e8c038", "#ffe070", "#c4b3ec", "#d49a9b"];
      const id = Date.now();
      const pieces = Array.from({ length: 48 }, (_, index) => ({
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
          background: "radial-gradient(circle, rgba(255,224,112,.5), transparent 65%)",
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
            "var(--tangled-sun) center/100% 100% no-repeat, linear-gradient(180deg,#f0c840 0%,#f5d850 30%,#fde068 55%,#fff0a8 82%,#fff8d8 100%)",
          boxShadow:
            "inset 0 -12px 20px rgba(255,245,180,.7), inset 0 8px 14px rgba(220,170,40,.35), 0 0 22px rgba(255,210,80,.6)",
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
          background: "radial-gradient(ellipse at 50% 90%, #fffce8 0%, #ffe870 45%, transparent 72%)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
