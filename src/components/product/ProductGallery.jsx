import { useState } from "react";
import "./ProductGallery.css";

/**
 * Product image gallery: a large main image plus a clickable thumbnail strip.
 *
 * Real images render when available; otherwise the CSS placeholder artwork is
 * used. The thumbnail strip is hidden automatically for single-image products.
 */
export default function ProductGallery({
  items = [],
  productName = "",
  discount = 0,
  badge = null,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0] ?? null;
  const hasMultiple = items.length > 1;

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        {active?.src ? (
          <img
            className="product-gallery__image"
            src={active.src}
            alt={active.label ?? productName}
            decoding="async"
          />
        ) : (
          <div
            className="product-gallery__placeholder"
            style={{ "--hue": active?.hue ?? 30 }}
            aria-hidden="true"
          >
            <span className="product-gallery__monogram">
              {productName.charAt(0)}
            </span>
          </div>
        )}

        {discount > 0 && (
          <span className="product-gallery__badge product-gallery__badge--sale">
            -{discount}%
          </span>
        )}
        {badge && (
          <span className="product-gallery__badge product-gallery__badge--tag">
            {badge}
          </span>
        )}
      </div>

      {hasMultiple && (
        <ul className="product-gallery__thumbs">
          {items.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={
                  index === activeIndex
                    ? "product-gallery__thumb product-gallery__thumb--active"
                    : "product-gallery__thumb"
                }
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1} of ${items.length}`}
                aria-current={index === activeIndex}
              >
                {item.src ? (
                  <img src={item.src} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span
                    className="product-gallery__thumb-placeholder"
                    style={{ "--hue": item.hue }}
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}