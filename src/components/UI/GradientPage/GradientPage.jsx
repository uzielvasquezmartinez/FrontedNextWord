import styles from "./GradientPage.module.css";

const GradientPage = ({ children }) => (
  <div className={styles.page}>
    {children}
  </div>
);

export default GradientPage;