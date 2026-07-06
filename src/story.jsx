import { useEffect, useState } from "react";

import { GALLERY } from "./data";
import { Icon, PhotoFrame } from "./effects";
import { SectionHead } from "./SectionHead";

export function GallerySection() {
  const [active, setActive] = useState(null);

  const close = () => setActive(null);
  const move = (direction) => {
    setActive((current) =>
      current === null ? current : (current + direction + GALLERY.length) % GALLERY.length,
    );
  };

  useEffect(() => {
    if (active === null) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section className="section" id="galeria">
      <SectionHead
        variant="narrative"
        title="Galeria do Ensaio"
        description="Páginas soltas do nosso livro de luz. Toque numa imagem para vê-la de perto."
      />

      <div className="gallery-grid">
        {GALLERY.map((item, index) => (
          <div
            className={`gallery-item ${item.cls} reveal ${
              index % 4 === 1 ? "d1" : index % 4 === 2 ? "d2" : index % 4 === 3 ? "d3" : ""
            }`}
            key={item.src}
            onClick={() => setActive(index)}
          >
            <PhotoFrame src={item.src} label={item.caption} caption={item.caption} />
          </div>
        ))}
      </div>

      {active !== null && (
        <div className="lightbox" onClick={close}>
          <button className="lb-close" onClick={close} aria-label="Fechar">
            <Icon name="X" size={22} />
          </button>
          <button
            className="lb-nav prev"
            onClick={(event) => {
              event.stopPropagation();
              move(-1);
            }}
            aria-label="Anterior"
          >
            <Icon name="ChevronLeft" size={24} />
          </button>
          <div className="lb-frame" onClick={(event) => event.stopPropagation()}>
            <PhotoFrame
              src={GALLERY[active].src}
              label={GALLERY[active].caption}
              caption={GALLERY[active].caption}
            />
          </div>
          <button
            className="lb-nav next"
            onClick={(event) => {
              event.stopPropagation();
              move(1);
            }}
            aria-label="Próxima"
          >
            <Icon name="ChevronRight" size={24} />
          </button>
          <div
            style={{
              position: "absolute",
              bottom: "1.6rem",
              left: 0,
              right: 0,
              textAlign: "center",
              color: "var(--lilac-soft)",
              fontFamily: "var(--font-script)",
              fontStyle: "italic",
              fontSize: "1.2rem",
            }}
          >
            {GALLERY[active].caption} · {active + 1}/{GALLERY.length}
          </div>
        </div>
      )}
    </section>
  );
}
