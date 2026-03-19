import styles from "./PageCard.module.css";

const PageCard = ({ children }) => (
  <div className={styles.card}>
    {children}
  </div>
);

export default PageCard;