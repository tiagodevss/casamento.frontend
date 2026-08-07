import { STORY, WEDDING } from "./data";
import { Icon, PhotoFrame } from "./effects";
import { SectionHead } from "./SectionHead";

function StoryItem({ chapter, index }) {
  const fromRight = index % 2 === 0;
  const paragraphs = chapter.text.split("\n").filter(Boolean);

  return (
    <div className={`story-item ${fromRight ? "from-right" : "from-left"}`}>
      <div className="story-item-photo reveal reveal-side">
        <PhotoFrame src={chapter.photo} label={chapter.title} caption={chapter.title} />
      </div>
      <div className="story-item-text reveal d1">
        <div className="ch-kicker">{chapter.no}</div>
        <h3>{chapter.title}</h3>
        <div className="ch-date">{chapter.date}</div>
        <div className="page-rule">
          <span className="l" />
          <span className="d" />
          <span className="l r" />
        </div>
        {paragraphs.map((paragraph, pIndex) => (
          <p className="story-item-p" key={pIndex}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export function StorySection() {
  return (
    <section className="section" id="historia">
      <SectionHead
        variant="narrative"
        title="Nossa História"
        description="Um resumo dos momentos que marcaram a nossa caminhada até o casamento."
      />

      <div className="story-timeline">
        <div className="story-timeline-line" aria-hidden="true" />
        {STORY.map((chapter, index) => (
          <StoryItem chapter={chapter} index={index} key={chapter.no} />
        ))}
        <div className="story-item story-item-end">
          <div className="story-end-medallion reveal">
            <Icon name="Heart" size={26} />
          </div>
          <p className="story-end-text reveal d1">
            O próximo capítulo acontece no nosso casamento — {WEDDING.dateLabel}.
          </p>
        </div>
      </div>
    </section>
  );
}
