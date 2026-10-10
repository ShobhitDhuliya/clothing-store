import httpClient from "../api/httpClient";

/**
 * Generic CRUD service. Domain services extend this and, at most, override
 * the resource path or add bespoke methods — keeping data access DRY and
 * OOP-oriented.
 */
export default class BaseService {
  constructor(resource) {
    this.resource = resource;
    this.http = httpClient;
  }

  getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.http.get(query ? `${this.resource}?${query}` : this.resource);
  }

  getById(id) {
    return this.http.get(`${this.resource}/${id}`);
  }

  create(payload) {
    return this.http.post(this.resource, payload);
  }

  update(id, payload) {
    return this.http.put(`${this.resource}/${id}`, payload);
  }

  remove(id) {
    return this.http.delete(`${this.resource}/${id}`);
  }
}
