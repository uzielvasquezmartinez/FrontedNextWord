import { motion, AnimatePresence } from "framer-motion";
import styles from "./Modal.module.css";

const Modal = ({ title, subtitle, onClose, children }) => (
  <AnimatePresence>
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.box}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0,    scale: 0.95, y: 10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
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
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

export default Modal;