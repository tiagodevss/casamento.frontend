import { useEffect, useRef, useState } from "react";

import { Icon } from "./effects";

const SRC = "/music/i-see-the-light.mp3";
const KEY_TIME = "tg_music_time";
const KEY_ON = "tg_music_on";

function fadeTo(audio, target) {
  const step = target > audio.volume ? 0.04 : -0.04;
  clearInterval(audio._fade);
  audio._fade = setInterval(() => {
    let volume = audio.volume + step;
    if ((step > 0 && volume >= target) || (step < 0 && volume <= target)) {
      volume = target;
      clearInterval(audio._fade);
    }
    audio.volume = Math.max(0, Math.min(1, volume));
  }, 30);
}

export function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.loop = true;
    audio.volume = 0;

    const savedTime = Number.parseFloat(localStorage.getItem(KEY_TIME) || "0");
    const onMeta = () => {
      if (savedTime && savedTime < audio.duration) audio.currentTime = savedTime;
    };
    const onTime = () => localStorage.setItem(KEY_TIME, String(audio.currentTime));

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);

    const wantsOn = localStorage.getItem(KEY_ON) === "1";
    let kick = null;

    if (wantsOn) {
      audio
        .play()
        .then(() => {
          fadeTo(audio, 0.55);
          setPlaying(true);
        })
        .catch(() => {
          setNeedsTap(true);
          kick = () => {
            audio
              .play()
              .then(() => {
                fadeTo(audio, 0.55);
                setPlaying(true);
                setNeedsTap(false);
              })
              .catch(() => {});
            window.removeEventListener("pointerdown", kick);
            window.removeEventListener("keydown", kick);
          };
          window.addEventListener("pointerdown", kick);
          window.addEventListener("keydown", kick);
        });
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      clearInterval(audio._fade);
      if (kick) {
        window.removeEventListener("pointerdown", kick);
        window.removeEventListener("keydown", kick);
      }
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => {
          fadeTo(audio, 0.55);
          setPlaying(true);
          setNeedsTap(false);
          localStorage.setItem(KEY_ON, "1");
        })
        .catch(() => {});
      return;
    }

    fadeTo(audio, 0);
    setTimeout(() => audio.pause(), 360);
    setPlaying(false);
    localStorage.setItem(KEY_ON, "0");
  };

  return (
    <div className={`music-player ${playing ? "is-playing" : ""} ${needsTap ? "needs-tap" : ""}`}>
      <audio ref={audioRef} src={SRC} preload="auto" />
      <button className="music-btn" onClick={toggle} aria-label={playing ? "Pausar música" : "Tocar música"}>
        <span className="eq" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="music-ico play">
          <Icon name="Play" size={17} />
        </span>
        <span className="music-ico pause">
          <Icon name="Pause" size={17} />
        </span>
      </button>
      <div className="music-meta">
        <span className="m-eyebrow">{needsTap ? "Toque para ouvir" : "Tocando"}</span>
        <span className="m-title">Música ambiente</span>
      </div>
    </div>
  );
}
