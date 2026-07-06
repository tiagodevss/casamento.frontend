export function SectionHead({
  variant = "narrative",
  eyebrow,
  title,
  description,
  titleClassName = "",
  headStyle,
  titleStyle,
}) {
  const showEyebrow = variant === "narrative" && eyebrow;
  const showFlourish = variant === "narrative";
  const showRule = variant === "action";

  return (
    <div className={`section-head section-head--${variant}`} style={headStyle}>
      {showEyebrow && <span className="eyebrow reveal">{eyebrow}</span>}
      <h2 className={`section-title reveal d1 ${titleClassName}`.trim()} style={titleStyle}>
        {title}
      </h2>
      {description && (
        <p className="section-lead reveal d2">{description}</p>
      )}
      {showFlourish && (
        <div className="divider-flourish reveal d2" aria-hidden="true">
          <span className="line" />
          <span className="dot" />
          <span className="line right" />
        </div>
      )}
      {showRule && <div className="section-rule reveal d2" aria-hidden="true" />}
    </div>
  );
}
