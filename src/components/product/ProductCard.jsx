import { Link } from "react-router-dom";
import Button from "../common/Button";
import Icon from "../common/Icon";
import Rating from "../common/Rating";
import { ROUTES } from "../../constants/routes";
import { useWishlist } from "../../context/WishlistContext";
import { formatCurrency } from "../../utils/currency";
import { calculateDiscountPercent } from "../../utils/pricing";
import "./ProductCard.css";

/**
 * Presentational product card shared by the home, listing and search grids.
 *
 * Product objects in `src/data/products.js` mirror the future
 * ProductService/API response, so this component needs no changes when the data
 * source is swapped. The optional flags let a page opt into extra affordances.
 */
export default function ProductCard({
  product,
  showWishlist = false,
  showStock = false,
}) {
  const {
    id,
    name,
    slug,
    price,
    originalPrice,
    rating,
    reviewCount,
    image,
    badge,
    isNew,
    stock,
    category,
    categoryName,
    accentHue = 30,
  } = product;

  const { has, toggle } = useWishlist();

  const categoryLabel = category ?? categoryName ?? "";
  const discount = calculateDiscountPercent(price, originalPrice);
  const detailsPath = `${ROUTES.PRODUCTS}/${slug}`;
  const tag = badge ?? (isNew ? "New" : null);
  const isSaved = showWishlist && has(id);
  const isOutOfStock = showStock && typeof stock === "number" && stock <= 0;

  let stockLabel = null;
  let stockModifier = "in";

  if (showStock && typeof stock === "number") {
    if (stock <= 0) {
      stockLabel = "Out of stock";
      stockModifier = "out";
    } else if (stock <= 5) {
      stockLabel = `Only ${stock} left`;
      stockModifier = "low";
    } else {
      stockLabel = "In stock";
    }
  }

  return (
    <article className="product-card">
      <div className="product-card__media">
        {image ? (
          <img
            className="product-card__image"
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="product-card__placeholder"
            style={{ "--hue": accentHue }}
            aria-hidden="true"
          >
            <span className="product-card__monogram">
              {(categoryLabel || name).charAt(0)}
            </span>
          </div>
        )}

        {discount > 0 && (
          <span className="product-card__badge product-card__badge--sale">
            -{discount}%
          </span>
        )}

        {showWishlist && (
          <button
            type="button"
            className={
              isSaved
                ? "product-card__wishlist product-card__wishlist--active"
                : "product-card__wishlist"
            }
            aria-label={
              isSaved
                ? `Remove ${name} from wishlist`
                : `Add ${name} to wishlist`
            }
            aria-pressed={isSaved}
            onClick={() => toggle(id)}
          >
            <Icon name="heart" size={18} />
          </button>
        )}

        {tag && (
          <span className="product-card__badge product-card__badge--tag">
            {tag}
          </span>
        )}

        {isOutOfStock && (
          <div className="product-card__stock-overlay" aria-hidden="true">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <div className="product-card__body">
        {categoryLabel && (
          <p className="product-card__category">{categoryLabel}</p>
        )}

        <h3 className="product-card__name">
          <Link to={detailsPath}>{name}</Link>
        </h3>

        <Rating value={rating} count={reviewCount} />

        {stockLabel && (
          <p className={`product-card__stock product-card__stock--${stockModifier}`}>
            {stockLabel}
          </p>
        )}

        <p className="product-card__price">
          <span className="product-card__price-current">
            {formatCurrency(price)}
          </span>
          {discount > 0 && (
            <span className="product-card__price-original">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </p>

        <div className="product-card__cta">
          <Button to={detailsPath} variant="secondary" size="sm" fullWidth>
            View Product
          </Button>
        </div>
      </div>
    </article>
  );
}