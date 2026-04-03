import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/UI/Button/Button";
import Avatar from "../../components/UI/Avatar/Avatar";
import { IconCalendar, IconClock } from "../../components/Icons/Icons";
import styles from "./StudentDashboardView.module.css";

const NAV_ITEMS = [
  { label: "Inicio" },
  { label: "Horario" },
  { label: "Clases" },
  { label: "Mensajes" },
];

const KPIS = [
  { id: "next", label: "Proxima Clase", value: "06-03-2026", icon: <IconCalendar /> },
  { id: "completed", label: "Clases Completadas", value: "2", icon: <IconCalendar /> },
  { id: "hours", label: "Horas de Estudio", value: "8h", icon: <IconClock /> },
];

const TEACHERS = [
  { id: 1, name: "Marco Lopez", rating: 4.5, avatar: "https://i.pravatar.cc/150?img=12" },
  { id: 2, name: "Kioga Lee", rating: 4.7, avatar: "https://i.pravatar.cc/150?img=32" },
  { id: 3, name: "Jose Emmanuel", rating: 4.8, avatar: "https://i.pravatar.cc/150?img=22" },
  { id: 4, name: "Juan Sebastian", rating: 4.6, avatar: "https://i.pravatar.cc/150?img=14" },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeItem] = useState("Inicio");

  const userName = user?.name?.split(" ")[0] ?? "Estudiante";

  return (
    <div className={styles.page}>
      <header className={styles.heroHeader}>
        <nav className={styles.navPills}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`${styles.navPill} ${activeItem === item.label ? styles.navPillActive : ""}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.userContainer}>
          <span className={styles.userGreeting}>Hola, {userName}</span>
          <Avatar
            initials={userName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
            size="md"
          />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.bannerCard}>
          <div className={styles.bannerText}>
            <h1>Bienvenido , Estudiante</h1>
            <p>Continua tu camino de aprendizaje</p>
          </div>
          <Button variant="primary" onClick={() => navigate("/alumno/horario")}>Reservar una clase</Button>
        </section>

        <section className={styles.kpiGrid}>
          {KPIS.map((kpi) => (
            <article key={kpi.id} className={styles.kpiCard}>
              <div className={styles.kpiIcon}>{kpi.icon}</div>
              <div className={styles.kpiBody}>
                <span className={styles.kpiLabel}>{kpi.label}</span>
                <span className={styles.kpiValue}>{kpi.value}</span>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.nextClassSection}>
          <div className={styles.nextClassHeading}>
            <span className={styles.nextClassTag}> <IconClock /> Próxima clase</span>
          </div>
          <div className={styles.nextClassCard}>
            <div className={styles.nextClassInfo}>
              <Avatar initials="MM" size="lg" />
              <div>
                <h3>Inglés Avanzado</h3>
                <p>Docente: Mario Moreno</p>
                <p>Duración: 50 min</p>
              </div>
            </div>
            <div className={styles.nextClassActions}>
              <Button variant="primary" fullWidth onClick={() => alert("Unido a la clase")}>Unirse</Button>
              <Button variant="secondary" fullWidth onClick={() => alert("Clase cancelada")}>Cancelar</Button>
            </div>
          </div>
        </section>

        <section className={styles.teachersGridSection}>
          <h2>Profesores recomendados</h2>
          <div className={styles.teachersGrid}>
            {TEACHERS.map((teacher) => (
              <article className={styles.teacherCard} key={teacher.id}>
                <img className={styles.teacherAvatar} src={teacher.avatar} alt={teacher.name} />
                <p className={styles.teacherName}>{teacher.name}</p>
                <p className={styles.teacherRating}>⭐ {teacher.rating.toFixed(1)}</p>
                <Button variant="primary" fullWidth onClick={() => alert(`Ver más de ${teacher.name}`)}>Ver más &gt;</Button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
