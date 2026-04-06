import styles from "./Avatar.module.css";

const Avatar = ({ initials, size = "md" }) => (
  <div className={`${styles.avatar} ${styles[size]}`}>
    {initials}
  </div>
);

export default Avatar;