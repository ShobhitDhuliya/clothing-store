import Breadcrumb from "../../../components/common/Breadcrumb";
import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import ProductCard from "../../../components/product/ProductCard";
import { ROUTES } from "../../../constants/routes";
import { useWishlist } from "../../../context/WishlistContext";
import { products } from "../../../data/products";
import "./Wishlist.css";

/**
 * `/wishlist` — every product the visitor has hearted (WishlistContext is
 * the single source of truth, already shared with the header counter and
 * the heart buttons on cards).
 */
export default function Wishlist() {
  const { ids, count } = useWishlist();
  const saved = products.filter((product) => ids.includes(product.id));

  const breadcrumb = [
    { label: "Home", to: ROUTES.HOME },
    { label: "Wishlist" },
  ];

  return (
    <div className="container wishlist">
      <Breadcrumb items={breadcrumb} />

      <header className="wishlist__header">
        <h1 className="wishlist__title">Wishlist</h1>
        <p className="wishlist__subtitle">
          {count > 0
            ? `${count} ${count === 1 ? "item" : "items"} saved for later.`
            : "Products you have saved for later."}
        </p>
      </header>

      {saved.length === 0 ? (
        <div className="wishlist__empty">
          <span className="wishlist__empty-icon">
            <Icon name="heart" size={30} />
          </span>
          <h2 className="wishlist__empty-title">Your wishlist is empty</h2>
          <p className="wishlist__empty-text">
            Tap the heart on any product to save it here for later.
          </p>
          <div className="wishlist__empty-actions">
            <Button to={ROUTES.PRODUCTS} size="lg">
              Browse Products
            </Button>
            <Button to={ROUTES.HOME} variant="ghost" size="lg">
              Back to Home
            </Button>
          </div>
        </div>
      ) : (
        <ul className="wishlist__grid">
          {saved.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} showWishlist showStock />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

