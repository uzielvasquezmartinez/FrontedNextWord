import styles from "./Badge.module.css";

const Badge = ({ label, variant = "default" }) => (
  <span className={`${styles.badge} ${styles[variant]}`}>
    {label}
  </span>
);

export default Badge;