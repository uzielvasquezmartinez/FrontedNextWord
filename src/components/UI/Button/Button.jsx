
import styles from "./Button.module.css";

const Spinner = () => (
  <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
);

const Button = ({
  children,
  variant  = "primary",
  size     = "md",
  fullWidth = false,
  loading  = false,
  disabled = false,
  onClick,
  type     = "button",
  icon     = null,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={[
      styles.btn,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : "",
    ].join(" ")}
  >
    {loading ? (
      <><Spinner /> Cargando...</>
    ) : (
      <>{icon && <span className={styles.icon}>{icon}</span>}{children}</>
    )}
  </button>
);

export default Button;