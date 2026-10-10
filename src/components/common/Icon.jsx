/**
 * Inline SVG icon set. Kept dependency-free: every icon is a small, reusable
 * glyph rendered with currentColor so it inherits the parent's text colour.
 */
const ICONS = {
  menu: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
  close: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2.5 3h2.3l2.2 12a2 2 0 0 0 2 1.7h8.6a2 2 0 0 0 2-1.6L21.5 7H6.2" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="M6.5 7l.9 12.3A1.7 1.7 0 0 0 9.1 21h5.8a1.7 1.7 0 0 0 1.7-1.7L17.5 7" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  creditCard: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <line x1="2.5" y1="10" x2="21.5" y2="10" />
      <line x1="6" y1="15" x2="10" y2="15" />
    </>
  ),
  banknote: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v.01M18 14.5v.01" />
    </>
  ),
  heart: (
    <path d="M12 20.4 4.3 12.7a4.5 4.5 0 0 1 0-6.4 4.5 4.5 0 0 1 6.4 0l1.3 1.3 1.3-1.3a4.5 4.5 0 0 1 6.4 6.4z" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  truck: (
    <>
      <path d="M1.5 4h11.5v10.5H1.5z" />
      <path d="M13 7.5h3.7l3.8 3.8v3.2H13z" />
      <circle cx="5.5" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </>
  ),
  shield: <path d="M12 3l7.5 2.8v5.4c0 4.7-3.1 7.9-7.5 9.8-4.4-1.9-7.5-5.1-7.5-9.8V5.8z" />,
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20 3.5V9h-5.5" />
    </>
  ),
  sparkle: (
    <path d="M12 3l1.9 5.4L19 10.3l-5.1 1.9L12 17.6l-1.9-5.4L5 10.3l5.1-1.9z" />
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M3.5 7.5 12 13l8.5-5.5" />
    </>
  ),
  phone: (
    <path d="M4.5 3.5h3.2l1.7 4.2-2.3 1.5a12.5 12.5 0 0 0 5.7 5.7l1.5-2.3 4.2 1.7v3.2a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3 5.1 1.5 1.5 0 0 1 4.5 3.5z" />
  ),
  mapPin: (
    <>
      <path d="M12 21.5s7-5.4 7-11.1a7 7 0 1 0-14 0c0 5.7 7 11.1 7 11.1z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  arrowRight: (
    <>
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M14 6l6 6-6 6" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </>
  ),
  star: (
    <path
      d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
      fill="currentColor"
      stroke="none"
    />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path
      d="M13.5 21v-7.5H11V10.5h2.5V8.6A3.6 3.6 0 0 1 17.1 5H19v3h-1.6a1 1 0 0 0-1 1v1.5H19l-.5 3h-2.2V21z"
      fill="currentColor"
      stroke="none"
    />
  ),
  twitter: (
    <>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <path d="M11 9.6l4 2.4-4 2.4z" fill="currentColor" stroke="none" />
    </>
  ),
};

/** Render a named icon. `title` makes it meaningful to assistive tech. */
export default function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className = "",
  title,
}) {
  const glyph = ICONS[name];
  if (!glyph) return null;

  return (
    <svg
      className={["icon", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {glyph}
    </svg>
  );
}