import "./FormField.css";

/**
 * Labelled text input with inline validation feedback. Reusable across the
 * checkout, login and account forms.
 */
export default function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  placeholder,
  inputMode,
  disabled = false,
  min,
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      <input
        id={id}
        className={
          error ? "form-field__input form-field__input--invalid" : "form-field__input"
        }
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        disabled={disabled}
        min={min}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
      />

      {error && (
        <p id={errorId} className="form-field__error">
          {error}
        </p>
      )}
    </div>
  );
}