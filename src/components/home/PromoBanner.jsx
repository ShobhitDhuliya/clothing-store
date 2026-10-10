import Button from "../common/Button";
import { ROUTES } from "../../constants/routes";
import "./PromoBanner.css";

/** Seasonal promotion panel with a single call to action. */
export default function PromoBanner() {
  return (
    <section className="promo page-section" aria-labelledby="promo-title">
      <div className="container">
        <div className="promo__panel">
          <div className="promo__content">
            <p className="promo__eyebrow">Limited time offer</p>
            <h2 id="promo-title" className="promo__title">
              Autumn Edit — Up to 40% Off
            </h2>
            <p className="promo__text">
              Refresh your wardrobe with our seasonal favourites. Offer ends
              while stock lasts.
            </p>
            <Button to={ROUTES.PRODUCTS} variant="accent" size="lg">
              Shop the Sale
            </Button>
          </div>

          <div className="promo__art" aria-hidden="true">
            <span className="promo__discount">40%</span>
            <span className="promo__discount-label">off selected styles</span>
          </div>
        </div>
      </div>
    </section>
  );
}