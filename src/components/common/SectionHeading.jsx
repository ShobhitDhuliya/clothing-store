import "./SectionHeading.css";

/**
 * Consistent section header: optional eyebrow, a heading (with an id so the
 * parent <section> can point at it via aria-labelledby) and an optional action.
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  titleId,
  align = "center",
  action = null,
}) {
  return (
    <header className={`section-heading section-heading--${align}`}>
      <div className="section-heading__text">
        {eyebrow && <p className="section-heading__eyebrow">{eyebrow}</p>}
        <h2 id={titleId} className="section-heading__title">
          {title}
        </h2>
        {subtitle && <p className="section-heading__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="section-heading__action">{action}</div>}
    </header>
  );
}