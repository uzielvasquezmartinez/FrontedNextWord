
import styles from "./Input.module.css";

const Input = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  disabled = false,
  icon = null,
}) => (
  <div className={styles.field}>
    {label && (
      <label htmlFor={id} className={styles.label}>
        {label}{required && <span className={styles.required}>*</span>}
      </label>
    )}
    <div className={`${styles.inputWrapper} ${error ? styles.inputWrapperError : ""}`}>
      {icon && <span className={styles.inputIcon}>{icon}</span>}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={styles.input}
      />
    </div>
    {error && <span className={styles.errorText} role="alert">{error}</span>}
  </div>
);

export default Input;