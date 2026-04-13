import { useNavigate } from "react-router-dom";
import Button from "../../UI/Button/Button";
import { IconStar, IconGraduate, IconBriefcase } from "../../Icons/Icons";
import styles from "./TeacherProfileModal.module.css";
const TeacherProfileModal = ({ teacher, onClose, onViewSchedule }) => {
  const navigate = useNavigate();

  if (!teacher) return null;

  const handleMessageClick = () => {
    // Redirige a mensajes pasando el objeto del profesor en el estado de navegación
    navigate("/student/messages", { 
      state: { 
        selectedTeacher: {
          id: teacher.id,
          name: teacher.name || teacher.fullName || "Profesor",
          avatar: teacher.avatar
        } 
      } 
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>

        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.header}>
          <img
            className={styles.avatar}
            src={teacher.avatar ?? `https://i.pravatar.cc/150?img=${teacher.id}`}
            alt={teacher.name}
          />
          <h2 className={styles.name}>{teacher.name}</h2>
          <div className={styles.rating}>
            <IconStar />
            <span>{teacher.rating?.toFixed(1)}</span>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{teacher.classes}</span>
              <span className={styles.statLabel}>Clases</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>${teacher.hourlyRate}</span>
              <span className={styles.statLabel}>Por hora</span>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Sobre mí</h3>
            <p className={styles.sectionText}>{teacher.bio}</p>

            <div className={styles.infoBlock}>
              <div className={styles.infoRow}>
                <IconGraduate />
                <div>
                  <strong>Educación</strong>
                  <p>{teacher.education}</p>
                </div>
              </div>
              <div className={styles.infoRow}>
                <IconBriefcase />
                <div>
                  <strong>Experiencia</strong>
                  <p>{teacher.experience}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" fullWidth onClick={handleMessageClick}>
            Enviar Mensaje
          </Button>
          <Button variant="primary" fullWidth onClick={() => onViewSchedule(teacher)}>
            Ver Horarios disponibles
          </Button>
        </div>

      </div>
    </div>
  );
};

export default TeacherProfileModal;