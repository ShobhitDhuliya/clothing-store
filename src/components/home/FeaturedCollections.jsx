import SectionHeading from "../common/SectionHeading";
import Button from "../common/Button";
import Icon from "../common/Icon";
import ProductCard from "../product/ProductCard";
import { featuredProducts } from "../../data/products";
import { ROUTES } from "../../constants/routes";
import "./FeaturedCollections.css";

/** Responsive grid of hand-picked products (mock data for now). */
export default function FeaturedCollections() {
  return (
    <section
      className="featured-collections page-section"
      aria-labelledby="featured-collections-title"
    >
      <div className="container">
        <SectionHeading
          titleId="featured-collections-title"
          eyebrow="Curated for you"
          title="Featured Collections"
          subtitle="Hand-picked pieces our customers love this season."
          action={
            <Button to={ROUTES.PRODUCTS} variant="ghost">
              View all products
              <Icon name="arrowRight" size={16} />
            </Button>
          }
        />

        {featuredProducts.length > 0 ? (
          <ul className="featured-collections__grid">
            {featuredProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="section-empty">New arrivals are on their way.</p>
        )}
      </div>
    </section>
  );
}