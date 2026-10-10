import Icon from "./Icon";
import "./Rating.css";

/** Read-only star rating, exposed to assistive tech as a single labelled image. */
export default function Rating({ value = 0, count, max = 5, size = 14 }) {
  const filled = Math.round(Number(value) || 0);
  const label =
    count != null
      ? `Rated ${value} out of ${max} from ${count} reviews`
      : `Rated ${value} out of ${max}`;

  return (
    <div className="rating" role="img" aria-label={label}>
      <span className="rating__stars">
        {Array.from({ length: max }, (_, index) => (
          <span
            key={index}
            className={
              index < filled ? "rating__star rating__star--filled" : "rating__star"
            }
          >
            <Icon name="star" size={size} strokeWidth={1.2} />
          </span>
        ))}
      </span>
      {count != null && <span className="rating__count">({count})</span>}
    </div>
  );
}