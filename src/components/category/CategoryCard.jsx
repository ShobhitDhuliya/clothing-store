import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import { ROUTES } from "../../constants/routes";
import "./CategoryCard.css";

/**
 * Tile linking to a category landing page. Uses a CSS gradient placeholder
 * with a monogram until real category imagery is available.
 */
export default function CategoryCard({ category }) {
  const { name, slug, description, itemCount, accentHue = 30 } = category;

  return (
    <Link to={`${ROUTES.CATEGORIES}/${slug}`} className="category-card">
      <div
        className="category-card__media"
        style={{ "--hue": accentHue }}
        aria-hidden="true"
      >
        <span className="category-card__monogram">{name.charAt(0)}</span>
      </div>

      <div className="category-card__body">
        <h3 className="category-card__name">{name}</h3>
        <p className="category-card__desc">{description}</p>
        <span className="category-card__meta">
          {itemCount} items
          <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </Link>
  );
}