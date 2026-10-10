import BaseService from "./BaseService";
import { ENDPOINTS } from "../api/endpoints";
import Product from "../models/Product";

/** Product data access. Extends BaseService with product-specific helpers. */
export default class ProductService extends BaseService {
  constructor() {
    super(ENDPOINTS.products);
  }

  /** Fetch products and map the raw API payload into Product instances. */
  async list(params = {}) {
    const data = await this.getAll(params);
    return Array.isArray(data) ? data.map(Product.fromJSON) : data;
  }
}
