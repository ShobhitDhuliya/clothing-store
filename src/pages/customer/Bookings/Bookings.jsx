import Breadcrumb from "../../../components/common/Breadcrumb";
import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import CheckoutSection from "../../../components/checkout/CheckoutSection";
import BookingProductPicker from "../../../components/booking/BookingProductPicker";
import BookingVariantPicker from "../../../components/booking/BookingVariantPicker";
import BookingTypeOptions from "../../../components/booking/BookingTypeOptions";
import BookingSchedule from "../../../components/booking/BookingSchedule";
import BookingCustomerDetails from "../../../components/booking/BookingCustomerDetails";
import BookingSummary from "../../../components/booking/BookingSummary";
import BookingConfirmation from "../../../components/booking/BookingConfirmation";
import { ROUTES } from "../../../constants/routes";
import { products } from "../../../data/products";
import useBookingForm from "../../../hooks/useBookingForm";
import "./Bookings.css";

/**
 * `/bookings` — reserve a product or book an in-store trial/fitting.
 *
 * All state lives in `useBookingForm`, catalogue truth stays in
 * `data/products`, and slot availability arrives from AvailabilityService
 * behind a swappable abstraction. Three mutually exclusive views render —
 * confirmation (after a successful booking), the empty-catalogue state, or
 * the full form — the same composition the checkout page uses.
 */
export default function Bookings() {
  const {
    values,
    errors,
    setValue,
    productId,
    selectProduct,
    selectedProduct,
    variants,
    color,
    size,
    setColor,
    setSize,
    selectedVariant,
    isAvailable,
    bookingType,
    setBookingType,
    date,
    minDate,
    selectDate,
    timeSlot,
    selectTimeSlot,
    selectedSlot,
    slotOptions,
    availabilityLoading,
    availabilityError,
    submitting,
    statusMessage,
    statusTone,
    confirmedBooking,
    handleSubmit,
  } = useBookingForm();

  const breadcrumb = [
    { label: "Home", to: ROUTES.HOME },
    { label: "Bookings" },
  ];

  /* 1 — confirmation replaces the whole flow once a booking exists. */
  if (confirmedBooking) {
    return (
      <div className="container bookings">
        <Breadcrumb items={breadcrumb} />
        <BookingConfirmation booking={confirmedBooking} />
      </div>
    );
  }

  /* 2 — empty catalogue: no broken form, just a way back to the shop. */
  if (products.length === 0) {
    return (
      <div className="container bookings">
        <Breadcrumb items={breadcrumb} />
        <BookingsEmptyState />
      </div>
    );
  }

  /* 3 — full booking flow. */
  return (
    <div className="container bookings">
      <Breadcrumb items={breadcrumb} />

      <header className="bookings__header">
        <h1 className="bookings__title">Book an Appointment</h1>
        <p className="bookings__subtitle">
          Reserve a product or book an in-store trial — pick an item, choose a
          time that works for you, and we&apos;ll hold it for your visit.
        </p>
      </header>

      <form className="bookings__layout" onSubmit={handleSubmit} noValidate>
        <div className="bookings__form">
          <CheckoutSection
            step={1}
            title="Select a product"
            description="Choose the clothing item you'd like to reserve or try on."
          >
            <BookingProductPicker
              products={products}
              value={productId}
              onChange={selectProduct}
              disabled={submitting}
              error={errors.product}
            />
          </CheckoutSection>

          <CheckoutSection
            step={2}
            title="Colour & size"
            description="Pick the exact variant to hold for your visit."
          >
            {selectedProduct ? (
              <BookingVariantPicker
                product={selectedProduct}
                variants={variants}
                color={color}
                size={size}
                onColorChange={setColor}
                onSizeChange={setSize}
                outOfStock={Boolean(selectedVariant) && !isAvailable}
                disabled={submitting}
                error={errors.variant}
              />
            ) : (
              <p className="bookings__hint">
                Select a product first to choose its colour and size.
              </p>
            )}
          </CheckoutSection>

          <CheckoutSection
            step={3}
            title="Booking type"
            description="What would you like to book?"
          >
            <BookingTypeOptions
              value={bookingType}
              onChange={setBookingType}
              disabled={submitting}
              error={errors.bookingType}
            />
          </CheckoutSection>

          <CheckoutSection
            step={4}
            title="Date & time"
            description="Past dates are unavailable and some slots may already be taken."
          >
            <BookingSchedule
              date={date}
              minDate={minDate}
              onDateChange={selectDate}
              slotOptions={slotOptions}
              selectedSlot={timeSlot}
              onSelectSlot={selectTimeSlot}
              loading={availabilityLoading}
              availabilityError={availabilityError}
              disabled={submitting}
              dateError={errors.date}
              slotError={errors.timeSlot}
            />
          </CheckoutSection>

          <CheckoutSection
            step={5}
            title="Your details"
            description="How we'll reach you if anything changes."
          >
            <BookingCustomerDetails
              values={values}
              errors={errors}
              onChange={setValue}
              disabled={submitting}
            />
          </CheckoutSection>
        </div>

        <aside className="bookings__aside" aria-label="Booking summary">
          <BookingSummary
            product={selectedProduct}
            variant={selectedVariant}
            bookingType={bookingType}
            date={date}
            timeSlot={selectedSlot}
            values={values}
            submitting={submitting}
            statusMessage={statusMessage}
            statusTone={statusTone}
          />
        </aside>
      </form>
    </div>
  );
}

/** Empty state — shown when no products exist to book. */
function BookingsEmptyState() {
  return (
    <div className="bookings__empty">
      <span className="bookings__empty-icon">
        <Icon name="calendar" size={32} />
      </span>

      <h1 className="bookings__empty-title">No booking selected</h1>

      <p className="bookings__empty-text">
        There are no products available to book right now. Browse the catalogue
        to find something you&apos;d like to reserve or try on.
      </p>

      <div className="bookings__empty-actions">
        <Button to={ROUTES.PRODUCTS} size="lg">
          Browse Products
        </Button>
        <Button to={ROUTES.HOME} variant="ghost" size="lg">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
