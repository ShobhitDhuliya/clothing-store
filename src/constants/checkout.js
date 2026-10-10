/**
 * Checkout-specific configuration: default values, Indian geography options
 * and stable DOM ids used for focus management after a failed validation.
 * Shipping prices and method lists live in `constants/cart` — never here.
 */

export const DEFAULT_COUNTRY = "India";

/** States + union territories, for the shipping form's state dropdown. */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

/** Starting point for the checkout form — country pre-filled per spec. */
export const INITIAL_CHECKOUT_VALUES = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: DEFAULT_COUNTRY,
};

/** Field names in the order a screen-reader user should visit them. */
export const FIELD_ORDER = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "address1",
  "city",
  "state",
  "postalCode",
  "country",
];

/** DOM id for a form field, shared by the input and the focus helper. */
export function fieldId(name) {
  return `checkout-${name}`;
}

/** DOM ids for the first radio of each option group (focus targets). */
export function deliveryOptionId(methodId) {
  return `delivery-${methodId}`;
}

export function paymentOptionId(methodId) {
  return `payment-${methodId}`;
}

