import Button from "../common/Button";
import { ROUTES } from "../../constants/routes";
import "./Hero.css";

const highlights = [
  { value: "500+", label: "Premium styles" },
  { value: "4.8/5", label: "Average rating" },
  { value: "Free", label: "Shipping over $75" },
];

/** Home hero: headline, supporting copy, primary/secondary CTAs and stats. */
export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero__panel">
          <div className="hero__content">
            <p className="hero__eyebrow">New Season · 2026 Collection</p>
            <h1 id="hero-title" className="hero__title">
              Elevate Your Everyday Wardrobe
            </h1>
            <p className="hero__text">
              Discover premium fabrics, considered tailoring and timeless design
              — crafted for the way you live today.
            </p>

            <div className="hero__actions">
              <Button to={ROUTES.PRODUCTS} size="lg">
                Shop Now
              </Button>
              <Button to={ROUTES.CATEGORIES} variant="secondary" size="lg">
                Explore Collection
              </Button>
            </div>

            <ul className="hero__stats">
              {highlights.map((item) => (
                <li key={item.label}>
                  <span className="hero__stat-value">{item.value}</span>
                  <span className="hero__stat-label">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <span className="hero__blob" />
            <div className="hero__frame">
              <span className="hero__frame-mark">ATELIER</span>
            </div>
            <span className="hero__tag">New In</span>
          </div>
        </div>
      </div>
    </section>
  );
}