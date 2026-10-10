/**
 * A purchasable variant of a product — a unique size + color combination
 * that carries its own stock level and (optionally) its own price/sku.
 */
export default class Variant {
  constructor({
    id,
    productId,
    size,
    color,
    sku,
    price,
    stock = 0,
    image,
  } = {}) {
    this.id = id;
    this.productId = productId;
    this.size = size;
    this.color = color;
    this.sku = sku;
    this.price = price;
    this.stock = stock;
    this.image = image;
  }

  get inStock() {
    return this.stock > 0;
  }

  static fromJSON(json) {
    return json instanceof Variant ? json : new Variant(json);
  }
}
