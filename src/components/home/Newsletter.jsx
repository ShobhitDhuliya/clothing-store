import { useState } from "react";
import Button from "../common/Button";
import Icon from "../common/Icon";
import "./Newsletter.css";

const STATUS = { IDLE: "idle", SUBMITTING: "submitting", DONE: "done" };

/**
 * Newsletter signup. There is no backend yet, so submission is simulated to
 * prove out the loading/confirmation states; swap the body of `handleSubmit`
 * for a NewsletterService call later.
 */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);

  function handleSubmit(event) {
    event.preventDefault();
    if (!email) return;

    setStatus(STATUS.SUBMITTING);
    window.setTimeout(() => setStatus(STATUS.DONE), 600);
  }

  return (
    <section className="newsletter page-section" aria-labelledby="newsletter-title">
      <div className="container">
        <div className="newsletter__panel">
          <div className="newsletter__intro">
            <h2 id="newsletter-title" className="newsletter__title">
              Join the Atelier list
            </h2>
            <p className="newsletter__text">
              Be first to know about new arrivals, exclusive offers and style
              edits. No spam, ever.
            </p>
          </div>

          <form className="newsletter__form" onSubmit={handleSubmit} noValidate>
            <label className="visually-hidden" htmlFor="newsletter-email">
              Email address
            </label>
            <div className="newsletter__field">
              <Icon name="mail" size={18} className="newsletter__field-icon" />
              <input
                id="newsletter-email"
                className="newsletter__input"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              variant="accent"
              disabled={status === STATUS.SUBMITTING}
            >
              {status === STATUS.SUBMITTING ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>

          <p className="newsletter__status" role="status" aria-live="polite">
            {status === STATUS.DONE ? "Thanks! You're on the list." : ""}
          </p>
        </div>
      </div>
    </section>
  );
}