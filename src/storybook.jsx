import { useEffect, useRef, useState } from "react";

import { STORY, WEDDING } from "./data";
import { Icon, MiniLantern } from "./effects";
import { SectionHead } from "./SectionHead";

function IlluPlate({ chapter }) {
  return (
    <div className="illu-plate">
      <img
        src={chapter.photo}
        alt={`Ilustração: ${chapter.title}`}
        onError={(event) => {
          event.target.style.opacity = 0;
        }}
      />
    </div>
  );
}

function PageIllu({ chapter, pageNo }) {
  return (
    <div className="book-face verso">
      <div className="page-inner page-illu">
        <span className="page-corner tl" />
        <span className="page-corner tr" />
        <span className="page-corner bl" />
        <span className="page-corner br" />
        <IlluPlate chapter={chapter} />
        <div className="illu-cap">{chapter.title}</div>
        {pageNo && <div className="page-num">{pageNo}</div>}
      </div>
    </div>
  );
}

function PageText({ chapter, pageNo, face = "recto" }) {
  return (
    <div className={`book-face ${face}`}>
      <div className="page-inner page-text">
        <span className="page-corner tl" />
        <span className="page-corner tr" />
        <span className="page-corner bl" />
        <span className="page-corner br" />
        <div className="ch-kicker">{chapter.no}</div>
        <h3>{chapter.title}</h3>
        <div className="ch-date">{chapter.date}</div>
        <div className="page-rule">
          <span className="l" />
          <span className="d" />
          <span className="l r" />
        </div>
        <p className="body">{chapter.text}</p>
        {pageNo && <div className="page-num">{pageNo}</div>}
      </div>
    </div>
  );
}

function PageCover({ face = "recto" }) {
  return (
    <div className={`book-face ${face}`}>
      <div className="page-inner page-cover">
        <span className="page-corner tl" />
        <span className="page-corner tr" />
        <span className="page-corner bl" />
        <span className="page-corner br" />
        <div className="pc-eyebrow">Era uma vez</div>
        <div className="page-medallion">
          <Icon name="Sparkles" size={28} />
        </div>
        <h2>
          Nossa
          <br />
          História
        </h2>
        <div className="pc-amp">
          {WEDDING.groom} &amp; {WEDDING.bride}
        </div>
        <p className="pc-sub">Um conto de luz, em quatro capítulos.</p>
      </div>
    </div>
  );
}

function PageInsideCover({ base }) {
  return (
    <div className={`book-face ${base ? "" : "verso"}`}>
      <div className="page-inner page-cover">
        <span className="page-corner tl" />
        <span className="page-corner tr" />
        <span className="page-corner bl" />
        <span className="page-corner br" />
        <div className="page-medallion">
          <Icon name="BookHeart" size={26} />
        </div>
        <p className="pc-sub" style={{ fontSize: "clamp(1rem,2.4vw,1.4rem)" }}>
          “Toda grande aventura começa com uma página em branco… e a coragem de virá-la.”
        </p>
      </div>
    </div>
  );
}

function PageEnd({ face = "verso" }) {
  return (
    <div className={`book-face ${face}`}>
      <div className="page-inner page-end">
        <span className="page-corner tl" />
        <span className="page-corner tr" />
        <span className="page-corner bl" />
        <span className="page-corner br" />
        <h2>Fim?</h2>
        <p className="pe-sub">Não… apenas o começo.</p>
        <div className="page-medallion" style={{ margin: "0.6rem auto" }}>
          <Icon name="Heart" size={26} />
        </div>
        <p className="pe-sub">O próximo capítulo se escreve no nosso grande dia.</p>
      </div>
    </div>
  );
}

function PageBackInside() {
  return (
    <div className="book-face">
      <div className="page-inner page-cover">
        <span className="page-corner tl" />
        <span className="page-corner tr" />
        <span className="page-corner bl" />
        <span className="page-corner br" />
        <div style={{ transform: "scale(0.8)" }}>
          <MiniLantern size={64} />
        </div>
        <p className="pc-sub" style={{ marginTop: "1rem" }}>
          Vire para confirmar sua presença nessa história.
        </p>
      </div>
    </div>
  );
}

function BookDesktop({ story }) {
  const totalLeaves = story.length + 1;
  const [page, setPage] = useState(0);
  const [flip, setFlip] = useState(null);
  const timer = useRef(null);

  const goTo = (nextPage) => {
    const target = Math.max(0, Math.min(totalLeaves, nextPage));
    if (target === page) return;
    setFlip(target > page ? page : target);
    setPage(target);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlip(null), 1100);
  };

  const label = page === 0 ? "A capa" : page <= story.length ? story[page - 1].no : "Fim";

  const faces = [
    { front: <PageCover />, back: <PageIllu chapter={story[0]} pageNo={1} /> },
    { front: <PageText chapter={story[0]} pageNo={2} />, back: <PageIllu chapter={story[1]} pageNo={3} /> },
    { front: <PageText chapter={story[1]} pageNo={4} />, back: <PageIllu chapter={story[2]} pageNo={5} /> },
    { front: <PageText chapter={story[2]} pageNo={6} />, back: <PageIllu chapter={story[3]} pageNo={7} /> },
    { front: <PageText chapter={story[3]} pageNo={8} />, back: <PageEnd /> },
  ];

  return (
    <div className="storybook-wrap">
      <div className="book">
        <div className="book-board" />
        <div className="book-base-left">
          <PageInsideCover base />
        </div>
        <div
          className="book-base-left"
          style={{ left: "auto", right: 0, borderRadius: "2px 8px 8px 2px" }}
        >
          <PageBackInside />
        </div>

        {faces.map((face, index) => {
          const turned = index < page;
          const zIndex = flip === index ? 999 : turned ? 10 + index : 10 + (totalLeaves - index);
          return (
            <div key={index} className={`leaf ${turned ? "turned" : ""}`} style={{ zIndex }}>
              {face.front}
              <div className="turn-hot next" onClick={() => goTo(page + 1)} title="Virar página" />
              {face.back}
              <div
                className="turn-hot prev"
                onClick={() => goTo(page - 1)}
                title="Voltar página"
                style={{ left: 0, right: "auto" }}
              />
            </div>
          );
        })}
      </div>

      <div className="book-controls">
        <button className="book-btn" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Página anterior">
          <Icon name="ChevronLeft" size={24} />
        </button>
        <div className="book-progress">
          <span className="bp-label">{label}</span>
          <div className="book-dots">
            {Array.from({ length: totalLeaves + 1 }).map((_, index) => (
              <span key={index} className={index === page ? "on" : ""} onClick={() => goTo(index)} />
            ))}
          </div>
        </div>
        <button className="book-btn" onClick={() => goTo(page + 1)} disabled={page === totalLeaves} aria-label="Próxima página">
          <Icon name="ChevronRight" size={24} />
        </button>
      </div>
      <div className="book-hint">
        <Icon name="MousePointerClick" size={15} /> Clique nas setas ou no canto das páginas para
        folhear
      </div>
    </div>
  );
}

function BookMobile({ story }) {
  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const timer = useRef(null);

  const goTo = (nextIndex) => {
    const target = (nextIndex + story.length) % story.length;
    if (target === index) return;
    setFlipping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIndex(target);
      setFlipping(false);
    }, 280);
  };

  const chapter = story[index];

  return (
    <div className="storybook-wrap">
      <div className="book-mobile">
        <div className={`mpage ${flipping ? "flipping" : ""}`}>
          <div className="book-face">
            <div className="page-inner page-text" style={{ position: "absolute" }}>
              <span className="page-corner tl" />
              <span className="page-corner tr" />
              <span className="page-corner bl" />
              <span className="page-corner br" />
              <div className="mp-illu">
                <img
                  src={chapter.photo}
                  alt={`Ilustração: ${chapter.title}`}
                  onError={(event) => {
                    event.target.style.opacity = 0;
                  }}
                />
              </div>
              <div className="ch-kicker">{chapter.no}</div>
              <h3>{chapter.title}</h3>
              <div className="ch-date">{chapter.date}</div>
              <div className="page-rule">
                <span className="l" />
                <span className="d" />
                <span className="l r" />
              </div>
              <p className="body">{chapter.text}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="book-controls">
        <button className="book-btn" onClick={() => goTo(index - 1)} aria-label="Anterior">
          <Icon name="ChevronLeft" size={22} />
        </button>
        <div className="book-progress">
          <span className="bp-label">{chapter.no}</span>
          <div className="book-dots">
            {story.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={dotIndex === index ? "on" : ""}
                onClick={() => goTo(dotIndex)}
              />
            ))}
          </div>
        </div>
        <button className="book-btn" onClick={() => goTo(index + 1)} aria-label="Próximo">
          <Icon name="ChevronRight" size={22} />
        </button>
      </div>
    </div>
  );
}

export function StorySection() {
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 760px)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const onChange = (event) => setNarrow(event.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return (
    <section className="section" id="historia">
      <SectionHead
        variant="narrative"
        title="Nossa História"
        description="Abra o nosso livro de contos e folheie, página a página, a jornada que nos trouxe até aqui."
      />
      {narrow ? <BookMobile story={STORY} /> : <BookDesktop story={STORY} />}
    </section>
  );
}
