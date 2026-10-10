import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import QuantitySelector from "../common/QuantitySelector";
import { ROUTES } from "../../constants/routes";
import { useWishlist } from "../../context/WishlistContext";
import { formatCurrency } from "../../utils/currency";
import "./CartItem.css";

/**
 * A single cart line: image, identity (name / category / colour / size),
 * unit pricing with the original price, a stock-aware quantity stepper, the
 * line total plus remove and wishlist actions.
 *
 * The page passes the line in already resolved, so this component stays
 * presentational and never touches the catalogue itself.
 */
export default function CartItem({ line, onQuantityChange, onRemove }) {
  const {
    key,
    productId,
    name,
    slug,
    category,
    categorySlug,
    image,
    accentHue,
    color,
    size,
    price,
    originalPrice,
    discountPercent,
    stock,
    quantity,
    effectiveQuantity,
    isAvailable,
    wasReduced,
    lineTotal,
    lineSavings,
  } = line;

  const { has, toggle } = useWishlist();

  const isSaved = has(productId);
  const detailsPath = `${ROUTES.PRODUCTS}/${slug}`;
  const categoryPath = categorySlug
    ? `${ROUTES.CATEGORIES}/${categorySlug}`
    : null;
  const maxQuantity = stock === null ? 99 : Math.max(1, stock);
  const hasDiscount = originalPrice !== null && originalPrice > price;

  return (
    <li
      className={
        isAvailable ? "cart-item" : "cart-item cart-item--unavailable"
      }
    >
      <div className="cart-item__media">
        {image ? (
          <img
            className="cart-item__image"
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="cart-item__placeholder"
            style={{ "--hue": accentHue }}
            aria-hidden="true"
          >
            <span className="cart-item__monogram">
              {(category || name).charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="cart-item__body">
        <div className="cart-item__head">
          <div className="cart-item__identity">
            {categoryPath && (
              <p className="cart-item__category">
                <Link to={categoryPath}>{category}</Link>
              </p>
            )}

            <h3 className="cart-item__name">
              <Link to={detailsPath}>{name}</Link>
            </h3>

            <p className="cart-item__variant">
              <span>Colour: {color}</span>
              <span aria-hidden="true">·</span>
              <span>Size: {size}</span>
            </p>
          </div>

          <button
            type="button"
            className={
              isSaved
                ? "cart-item__wishlist cart-item__wishlist--active"
                : "cart-item__wishlist"
            }
            aria-pressed={isSaved}
            aria-label={
              isSaved
                ? `Remove ${name} from wishlist`
                : `Add ${name} to wishlist`
            }
            onClick={() => toggle(productId)}
          >
            <Icon name="heart" size={18} />
          </button>
        </div>

        {!isAvailable && (
          <p className="cart-item__alert cart-item__alert--out" role="status">
            <Icon name="close" size={16} />
            Out of stock — this item is excluded from your total.
          </p>
        )}

        {isAvailable && wasReduced && (
          <p className="cart-item__alert" role="status">
            <Icon name="close" size={16} />
            Only {stock} left — quantity reduced from {quantity} to{" "}
            {effectiveQuantity}.
          </p>
        )}

        <div className="cart-item__details">
          <p className="cart-item__price">
            <span className="cart-item__price-current">
              {formatCurrency(price)}
            </span>
            {hasDiscount && (
              <del className="cart-item__price-original">
                {formatCurrency(originalPrice)}
              </del>
            )}
            {discountPercent > 0 && (
              <span className="cart-item__badge">-{discountPercent}%</span>
            )}
          </p>

          <div className="cart-item__controls">
            {isAvailable ? (
              <QuantitySelector
                value={effectiveQuantity}
                min={1}
                max={maxQuantity}
                label="Qty"
                onChange={(next) => onQuantityChange(key, next)}
              />
            ) : (
              <div className="cart-item__qty-static">
                <span className="cart-item__qty-label">Qty</span>
                <span className="cart-item__qty-value">{effectiveQuantity}</span>
              </div>
            )}
          </div>

          <p className="cart-item__total">
            <span className="cart-item__total-label">Item total</span>
            <span className="cart-item__total-value">
              {formatCurrency(lineTotal)}
            </span>
          </p>
        </div>

        <div className="cart-item__actions">
          {lineSavings > 0 && (
            <p className="cart-item__savings">
              You save {formatCurrency(lineSavings)}
            </p>
          )}

          <button
            type="button"
            className="cart-item__remove"
            onClick={() => onRemove(key, name)}
            aria-label={`Remove ${name} (${color}, ${size}) from cart`}
          >
            <Icon name="trash" size={16} />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}