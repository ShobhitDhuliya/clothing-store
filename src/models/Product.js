import Variant from "./Variant";

/**
 * A clothing product. Stock is tracked per variant, so total stock is derived
 * from the variant list rather than stored on the product itself.
 */
export default class Product {
  constructor({
    id,
    name,
    slug,
    description,
    categoryId,
    brand,
    price,
    images = [],
    variants = [],
    rating = 0,
    reviewCount = 0,
  } = {}) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.categoryId = categoryId;
    this.brand = brand;
    this.price = price;
    this.images = images;
    this.variants = variants.map(Variant.fromJSON);
    this.rating = rating;
    this.reviewCount = reviewCount;
  }

  get totalStock() {
    return this.variants.reduce((sum, variant) => sum + variant.stock, 0);
  }

  /** Unique sizes available across all variants. */
  get sizes() {
    return [...new Set(this.variants.map((variant) => variant.size))];
  }

  /** Unique colors available across all variants. */
  get colors() {
    return [...new Set(this.variants.map((variant) => variant.color))];
  }

  static fromJSON(json) {
    return json instanceof Product ? json : new Product(json);
  }
}
