import SectionHeading from "../common/SectionHeading";
import Icon from "../common/Icon";
import "./WhyShopWithUs.css";

const benefits = [
  {
    icon: "sparkle",
    title: "Quality Products",
    text: "Premium fabrics and thoughtful detailing in every piece.",
  },
  {
    icon: "shield",
    title: "Secure Payment",
    text: "Encrypted checkout you can trust, every single time.",
  },
  {
    icon: "truck",
    title: "Fast Delivery",
    text: "Quick dispatch with free shipping on orders over $75.",
  },
  {
    icon: "refresh",
    title: "Easy Returns",
    text: "30-day hassle-free returns and exchanges on all orders.",
  },
];

/** Reassurance strip explaining the store's key benefits. */
export default function WhyShopWithUs() {
  return (
    <section className="benefits page-section" aria-labelledby="benefits-title">
      <div className="container">
        <SectionHeading
          titleId="benefits-title"
          eyebrow="Why choose us"
          title="Why Shop With Us"
          subtitle="Every order is backed by service designed around you."
        />

        <ul className="benefits__grid">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="benefits__item">
              <span className="benefits__icon">
                <Icon name={benefit.icon} size={24} />
              </span>
              <h3 className="benefits__title">{benefit.title}</h3>
              <p className="benefits__text">{benefit.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}