
import Button from "../../UI/Button/Button";
import { IconStar } from "../../Icons/Icons";
import styles from "./TeacherCard.module.css";
const TeacherCard = ({ teacher, onViewMore }) => (
  <article className={styles.card}>
    <img
      className={styles.avatar}
      src={teacher.avatar ?? `https://i.pravatar.cc/150?img=${teacher.id}`}
      alt={teacher.name}
    />
    <p className={styles.name}>{teacher.name}</p>
    <div className={styles.rating}>
      <IconStar />
      <span>{teacher.rating?.toFixed(1)} ({teacher.classes} Clases)</span>
    </div>
    <p className={styles.price}>${teacher.hourlyRate}/hrax</p>
    <Button variant="primary" fullWidth onClick={() => onViewMore(teacher)}>
      Ver más &gt;
    </Button>
  </article>
);

export default TeacherCard;