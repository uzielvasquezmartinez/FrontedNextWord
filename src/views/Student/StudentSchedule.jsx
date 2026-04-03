import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Button from "../../components/UI/Button/Button";
import Modal from "../../components/UI/Modal/Modal";
import Avatar from "../../components/UI/Avatar/Avatar";
import styles from "./StudentSchedule.module.css";

const STUDENT_NAV = [
  { label: "Inicio",   path: "/student/dashboard" },
  { label: "Horario",  path: "/student/schedule" },
  { label: "Clases",   path: "/student/dashboard" },
  { label: "Mensajes", path: "/teacher/messages" },
];

const TEACHERS = [
  { id: 1, name: "Marco Lopez",      subject: "Inglés Avanzado",   rating: 4.5, price: "$22/h", avatar: "https://i.pravatar.cc/150?img=12", experience: "8 años" },
  { id: 2, name: "Kioga Lee",       subject: "Inglés Intermedio", rating: 4.7, price: "$20/h", avatar: "https://i.pravatar.cc/150?img=32", experience: "6 años" },
  { id: 3, name: "Jose Emmanuel",   subject: "Inglés Básico",      rating: 4.8, price: "$18/h", avatar: "https://i.pravatar.cc/150?img=22", experience: "5 años" },
  { id: 4, name: "Juan Sebastian",  subject: "Inglés Conversación",rating: 4.6, price: "$23/h", avatar: "https://i.pravatar.cc/150?img=14", experience: "7 años" },
];

const StudentSchedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <div className={styles.page}>
      <AppNavbar navItems={STUDENT_NAV} activeItem="Horario" />
      <main className={styles.main}>
        <section className={styles.header}>
          <div>
            <h2>Horarios y profesores</h2>
            <p>Selecciona un profesor para ver disponibilidad y reservar.</p>
          </div>
          <Button variant="primary" onClick={() => navigate("/student/dashboard")}>Volver al inicio</Button>
        </section>

        <section className={styles.teacherGrid}>
          {TEACHERS.map((teacher) => (
            <article className={styles.teacherCard} key={teacher.id}>
              <img className={styles.teacherImage} src={teacher.avatar} alt={teacher.name} />
              <div className={styles.teacherInfo}>
                <h4>{teacher.name}</h4>
                <span>{teacher.subject}</span>
                <span>⭐ {teacher.rating.toFixed(1)} | {teacher.experience}</span>
                <span>{teacher.price}</span>
              </div>
              <div className={styles.actions}>
                <Button size="sm" variant="secondary" onClick={() => setSelected(teacher)}>Ver más</Button>
                <Button size="sm" variant="primary" onClick={() => alert(`Ir a reservar clase con ${teacher.name}`)}>Reservar</Button>
              </div>
            </article>
          ))}
        </section>
      </main>

      {selected && (
        <Modal title={selected.name} subtitle={selected.subject} onClose={() => setSelected(null)}>
          <div className={styles.modalBody}>
            <div className={styles.modalHeader}>
              <Avatar initials={selected.name.split(" ").map((x) => x[0]).slice(0, 2).join("")} size="md" />
              <div>
                <p>Calificación: {selected.rating.toFixed(1)}</p>
                <p>Experiencia: {selected.experience}</p>
                <p>Precio: {selected.price}</p>
              </div>
            </div>
            <Button onClick={() => { setSelected(null); navigate("/student/dashboard"); }}>Reservar ahora</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentSchedule;
