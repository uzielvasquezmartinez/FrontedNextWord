import styles from "./Modal.module.css";

const Modal = ({ title, subtitle, onClose, children, maxWidth }) => (
  <div className={styles.overlay} onClick={onClose}>
    <div
      className={styles.box}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.header}>
        <div>
          {title    && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  </div>
);

export default Modal;