import SectionHeading from "../common/SectionHeading";
import Button from "../common/Button";
import Icon from "../common/Icon";
import CategoryCard from "../category/CategoryCard";
import { featuredCategories } from "../../data/categories";
import { ROUTES } from "../../constants/routes";
import "./FeaturedCategories.css";

/** Grid of the store's headline categories. */
export default function FeaturedCategories() {
  return (
    <section
      className="featured-categories page-section"
      aria-labelledby="featured-categories-title"
    >
      <div className="container">
        <SectionHeading
          titleId="featured-categories-title"
          eyebrow="Shop by"
          title="Featured Categories"
          subtitle="Find your fit across our most-loved collections."
          action={
            <Button to={ROUTES.CATEGORIES} variant="ghost">
              All categories
              <Icon name="arrowRight" size={16} />
            </Button>
          }
        />

        {featuredCategories.length > 0 ? (
          <ul className="featured-categories__grid">
            {featuredCategories.map((category) => (
              <li key={category.id}>
                <CategoryCard category={category} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="section-empty">Categories are coming soon.</p>
        )}
      </div>
    </section>
  );
}