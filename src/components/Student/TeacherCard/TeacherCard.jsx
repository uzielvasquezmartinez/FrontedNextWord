
import Button from "../../UI/Button/Button";
import { IconStar } from "../../Icons/Icons";
import styles from "./TeacherCard.module.css";
const TeacherCard = ({ teacher, onViewMore }) => (
  <article className={styles.card}>
    {teacher.avatar
  ? <img className={styles.avatar} src={teacher.avatar} alt={teacher.name} />
  : <div className={styles.avatarInitials}>
      {teacher.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
    </div>
}
    <p className={styles.name}>{teacher.name}</p>
    <div className={styles.rating}>
      <IconStar />
      <span>{teacher.rating?.toFixed(1)} ({teacher.classes} Clases)</span>
    </div>
    <p className={styles.price}>{teacher.hourlyRate} créditos/hr</p>
    <Button variant="primary" fullWidth onClick={() => onViewMore(teacher)}>
      Ver más &gt;
    </Button>
  </article>
);

export default TeacherCard;