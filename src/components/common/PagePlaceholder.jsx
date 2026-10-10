import "./PagePlaceholder.css";

/**
 * Scaffold placeholder shown by pages that are not implemented yet.
 * Each feature page renders this until its real UI replaces it.
 */
export default function PagePlaceholder({ title, description }) {
  return (
    <section className="placeholder container">
      <p className="placeholder__eyebrow">Coming soon</p>
      <h1 className="placeholder__title">{title}</h1>
      {description && <p className="placeholder__desc">{description}</p>}
    </section>
  );
}
