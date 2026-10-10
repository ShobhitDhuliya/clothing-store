import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import QuantitySelector from "../../../components/common/QuantitySelector";
import Rating from "../../../components/common/Rating";
import ProductCard from "../../../components/product/ProductCard";
import ProductGallery from "../../../components/product/ProductGallery";
import ColorSelector from "../../../components/variant/ColorSelector";
import SizeSelector from "../../../components/variant/SizeSelector";
import { ROUTES } from "../../../constants/routes";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { products } from "../../../data/products";
import useProductVariant from "../../../hooks/useProductVariant";
import { formatCurrency } from "../../../utils/currency";
import { calculateDiscountPercent } from "../../../utils/pricing";
import {
  buildVariants,
  findProductBySlug,
  getProductGallery,
  getRelatedProducts,
  getTotalVariantStock,
  sortSizes,
} from "../../../utils/productDetails";
import "./ProductDetails.css";

const RELATED_LIMIT = 4;

/**
 * `/products/:slug` — resolves the product from the catalogue and renders the
 * detail view. All data shaping lives in `utils/productDetails` and
 * `hooks/useProductVariant`; this module only wires things together.
 */
export default function ProductDetails() {
  const { slug } = useParams();
  const product = useMemo(() => findProductBySlug(products, slug), [slug]);

  if (!product) return <ProductNotFound />;

  // Keyed by product id so variant selection resets when navigating between
  // products via the related-products grid.
  return <ProductDetailView key={product.id} product={product} />;
}

/** Clean fallback shown when the slug does not match any product. */
function ProductNotFound() {
  return (
    <div className="container product-details">
      <Breadcrumb
        items={[
          { label: "Home", to: ROUTES.HOME },
          { label: "Shop", to: ROUTES.PRODUCTS },
          { label: "Product not found" },
        ]}
      />

      <div className="product-details__not-found">
        <span className="product-details__not-found-icon">
          <Icon name="search" size={28} />
        </span>
        <h1 className="product-details__not-found-title">Product not found</h1>
        <p className="product-details__not-found-text">
          We couldn&apos;t find the product you&apos;re looking for. It may have
          been removed, or the link may be incorrect.
        </p>
        <div className="product-details__not-found-actions">
          <Button to={ROUTES.PRODUCTS}>Back to Shop</Button>
          <Button to={ROUTES.HOME} variant="ghost">
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

/** The actual detail view for a resolved product. */
function ProductDetailView({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [added, setAdded] = useState(false);

  const variants = useMemo(() => buildVariants(product), [product]);
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const colors = useMemo(() => product.colors ?? [], [product]);
  const sizes = useMemo(() => sortSizes(product.sizes ?? []), [product]);
  const related = useMemo(
    () => getRelatedProducts(products, product, RELATED_LIMIT),
    [product],
  );

  const {
    color,
    size,
    quantity,
    setColor,
    setSize,
    setQuantity,
    selectedVariant,
    maxQuantity,
    isAvailable,
  } = useProductVariant(variants);

  const discount = calculateDiscountPercent(product.price, product.originalPrice);
  const totalStock = getTotalVariantStock(variants);
  const isSaved = has(product.id);
  const categoryPath = `${ROUTES.CATEGORIES}/${product.categorySlug}`;

  const cartLine = {
    id: selectedVariant?.id,
    productId: product.id,
    name: product.name,
    slug: product.slug,
    color,
    size,
    quantity,
    price: product.price,
    image: product.image,
    accentHue: product.accentHue,
  };

  const selectColor = (nextColor) => {
    setColor(nextColor);
    setAdded(false);
  };

  const selectSize = (nextSize) => {
    setSize(nextSize);
    setAdded(false);
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem(cartLine);
    setAdded(true);
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addItem(cartLine);
    navigate(ROUTES.CHECKOUT);
  };

  const stockModifier =
    selectedVariant && selectedVariant.stock > 5
      ? "in"
      : selectedVariant && selectedVariant.stock > 0
        ? "low"
        : "out";

  const stockLabel = !selectedVariant
    ? "This combination is unavailable"
    : selectedVariant.stock > 5
      ? "In stock"
      : selectedVariant.stock > 0
        ? `Only ${selectedVariant.stock} left`
        : "Out of stock";

  return (
    <div className="container product-details">
      <Breadcrumb
        items={[
          { label: "Home", to: ROUTES.HOME },
          { label: "Shop", to: ROUTES.PRODUCTS },
          { label: product.category, to: categoryPath },
          { label: product.name },
        ]}
      />

      <div className="product-details__layout">
        <div className="product-details__gallery">
          <ProductGallery
            items={gallery}
            productName={product.name}
            discount={discount}
            badge={product.badge ?? (product.isNew ? "New" : null)}
          />
        </div>

        <div className="product-details__info">
          <p className="product-details__category">
            <Link to={categoryPath}>{product.category}</Link>
          </p>

          <h1 className="product-details__title">{product.name}</h1>

          <div className="product-details__meta">
            <Rating value={product.rating} count={product.reviewCount} size={16} />
            <span
              className={
                totalStock > 0
                  ? "product-details__availability product-details__availability--in"
                  : "product-details__availability product-details__availability--out"
              }
            >
              {totalStock > 0 ? "In stock" : "Out of stock"}
            </span>
          </div>

          <div className="product-details__price">
            <span className="product-details__price-current">
              {formatCurrency(product.price)}
            </span>
            {discount > 0 && (
              <>
                <span className="product-details__price-original">
                  {formatCurrency(product.originalPrice)}
                </span>
                <span className="product-details__price-save">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          <p className="product-details__description">{product.description}</p>

          <ColorSelector
            colors={colors}
            selected={color}
            onChange={selectColor}
            variants={variants}
          />

          <SizeSelector
            sizes={sizes}
            selected={size}
            onChange={selectSize}
            variants={variants}
            color={color}
          />

          {!isAvailable && (
            <p className="product-details__unavailable" role="status">
              <Icon name="close" size={16} />
              {selectedVariant
                ? "This colour and size combination is out of stock. Please choose another option."
                : "This combination is unavailable. Please choose another colour or size."}
            </p>
          )}

          <div className="product-details__actions-row">
            <QuantitySelector
              value={quantity}
              max={maxQuantity}
              onChange={setQuantity}
            />
            <span
              className={`product-details__variant-stock product-details__variant-stock--${stockModifier}`}
            >
              {stockLabel}
            </span>
          </div>

          <div className="product-details__actions">
            <Button size="lg" onClick={handleAddToCart} disabled={!isAvailable}>
              <Icon name="cart" size={18} />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="accent"
              onClick={handleBuyNow}
              disabled={!isAvailable}
            >
              Buy Now
            </Button>
            <button
              type="button"
              className={
                isSaved
                  ? "product-details__wishlist product-details__wishlist--active"
                  : "product-details__wishlist"
              }
              onClick={() => toggle(product.id)}
              aria-pressed={isSaved}
            >
              <Icon name="heart" size={18} />
              {isSaved ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          <p
            className="product-details__feedback"
            role="status"
            aria-live="polite"
          >
            {added ? `${quantity} × ${product.name} added to your cart.` : ""}
          </p>

          <ul className="product-details__perks">
            <li className="product-details__perk">
              <Icon name="truck" size={18} />
              Free shipping on orders over $75
            </li>
            <li className="product-details__perk">
              <Icon name="refresh" size={18} />
              30-day easy returns and exchanges
            </li>
            <li className="product-details__perk">
              <Icon name="shield" size={18} />
              Secure, encrypted checkout
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section
          className="product-details__related"
          aria-labelledby="related-products-title"
        >
          <h2
            id="related-products-title"
            className="product-details__related-title"
          >
            You may also like
          </h2>

          <ul className="product-details__related-grid">
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} showWishlist showStock />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
