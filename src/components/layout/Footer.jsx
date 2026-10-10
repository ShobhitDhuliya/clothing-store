import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import Icon from "../common/Icon";
import "./layout.css";

const quickLinks = [
  { label: "Shop All", to: ROUTES.PRODUCTS },
  { label: "Categories", to: ROUTES.CATEGORIES },
  { label: "Bookings", to: ROUTES.BOOKINGS },
  { label: "Wishlist", to: ROUTES.WISHLIST },
];

const supportLinks = [
  { label: "My Orders", to: ROUTES.ORDERS },
  { label: "Shipping & Delivery", to: "#" },
  { label: "Returns & Exchanges", to: "#" },
  { label: "Contact Support", to: "#" },
];

const socialLinks = [
  { label: "Instagram", icon: "instagram", href: "#" },
  { label: "Facebook", icon: "facebook", href: "#" },
  { label: "X (Twitter)", icon: "twitter", href: "#" },
  { label: "YouTube", icon: "youtube", href: "#" },
];

const contactDetails = [
  { icon: "mail", label: "support@atelier.example" },
  { icon: "phone", label: "+1 (555) 010-2030" },
  { icon: "mapPin", label: "221B Garment Street, New York, NY" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "#" },
  { label: "Terms of Service", to: "#" },
];

/** Renders internal routes as SPA links and placeholders as plain anchors. */
function FooterLink({ to, children }) {
  if (to.startsWith("/")) {
    return (
      <Link to={to} className="footer__link">
        {children}
      </Link>
    );
  }

  return (
    <a href={to} className="footer__link">
      {children}
    </a>
  );
}

/** Customer site footer: quick links, support, contact details and socials. */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">ATELIER</span>
          <p className="footer__tagline">Modern essentials, made to last.</p>

          <ul className="footer__social">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  className="footer__social-link"
                  aria-label={social.label}
                >
                  <Icon name={social.icon} size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="footer__column" aria-label="Quick links">
          <h2 className="footer__heading">Quick Links</h2>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.label}>
                <FooterLink to={link.to}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__column" aria-label="Customer support">
          <h2 className="footer__heading">Customer Support</h2>
          <ul>
            {supportLinks.map((link) => (
              <li key={link.label}>
                <FooterLink to={link.to}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__column">
          <h2 className="footer__heading">Contact</h2>
          <ul>
            {contactDetails.map((detail) => (
              <li key={detail.label} className="footer__contact-item">
                <Icon name={detail.icon} size={16} />
                <span>{detail.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <small>© {year} Atelier. All rights reserved.</small>
        <ul className="footer__legal">
          {legalLinks.map((link) => (
            <li key={link.label}>
              <FooterLink to={link.to}>{link.label}</FooterLink>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
