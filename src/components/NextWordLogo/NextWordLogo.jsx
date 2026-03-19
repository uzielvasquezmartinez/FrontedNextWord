import styles from "./NextWordLogo.module.css";
import logo from "../../assets/NexWordLogo.jpg";
const NextWordLogo = () => (
  <div className={styles.logoCard}>
    <img src={logo} alt="NextWord" className={styles.logoImg} />
  </div>
);

export default NextWordLogo;