import styles from "./NextWordLogo.module.css";
import logo from "../../assets/NexWordLogo.jpg";
const NextWordLogo = ({ size = "md" }) => (
  <div className={styles.logoCard}>
    <img
      src={logo}
      alt="NextWord"
      className={`${styles.logoImg} ${styles[size]}`}
    />
  </div>
);

export default NextWordLogo;