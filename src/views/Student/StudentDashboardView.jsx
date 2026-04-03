import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Button from "../../components/UI/Button/Button";
import Avatar from "../../components/UI/Avatar/Avatar";
import TeacherCard from "../../components/Student/TeacherCard/TeacherCard";
import TeacherProfileModal from "../../components/Student/TeacherProfileModal/TeacherProfileModal";
import { IconCalendar, IconClock } from "../../components/Icons/Icons";
import styles from "./StudentDashboardView.module.css";
// ── Navegación ───────────────────────────────────────────────────
const STUDENT_NAV = [
  { label: "Inicio",    path: "/student/dashboard" },
  { label: "Horario",   path: "/student/schedule"  },
  { label: "Clases",    path: "/student/classes"   },
  { label: "Mensajes",  path: "/student/messages"  },
];

// ── Datos mock ───────────────────────────────────────────────────
const KPIS = [
  { id: "next",      label: "Próxima Clase",       value: "06-03-2026", icon: <IconCalendar /> },
  { id: "completed", label: "Clases Completadas",  value: "2",          icon: <IconCalendar /> },
  { id: "hours",     label: "Horas de Estudio",    value: "8h",         icon: <IconClock />    },
];

const TEACHERS = [
  {
    id: 1, name: "Marco Lopez",     rating: 4.5, classes: 30, hourlyRate: 45,
    avatar: "https://i.pravatar.cc/150?img=12",
    bio: "Lingüista con doctorado y 10 años transformando el aprendizaje del idioma.",
    education: "Doctorado en Lingüística Aplicada / Enseñanza del Inglés",
    experience: "10 años de experiencia",
  },
  {
    id: 2, name: "Kioga Lee",       rating: 4.7, classes: 50, hourlyRate: 40,
    avatar: "https://i.pravatar.cc/150?img=32",
    bio: "Especialista en inglés conversacional con enfoque en negocios internacionales.",
    education: "Maestría en Lingüística Aplicada",
    experience: "8 años de experiencia",
  },
  {
    id: 3, name: "Jose Emmanuel",   rating: 4.8, classes: 80, hourlyRate: 50,
    avatar: "https://i.pravatar.cc/150?img=22",
    bio: "Profesor certificado por Cambridge con experiencia en preparación de exámenes.",
    education: "Certificación Cambridge CELTA",
    experience: "12 años de experiencia",
  },
  {
    id: 4, name: "Juan Sebastian",  rating: 4.6, classes: 40, hourlyRate: 35,
    avatar: "https://i.pravatar.cc/150?img=14",
    bio: "Apasionado por la enseñanza del inglés con metodología dinámica e interactiva.",
    education: "Licenciatura en Idiomas Modernos",
    experience: "6 años de experiencia",
  },
];

// ── Componente principal ─────────────────────────────────────────
const StudentDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const userName = user?.name?.split(" ")[0] ?? "Estudiante";

  const handleViewSchedule = (teacher) => {
    setSelectedTeacher(null);
    navigate("/student/schedule", { state: { teacher } });
  };

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={STUDENT_NAV} activeItem="Inicio" />

      <main className={styles.main}>

        {/* ── Banner ── */}
        <section className={styles.bannerCard}>
          <div className={styles.bannerText}>
            <h1>Bienvenido, {userName}</h1>
            <p>Continua tu camino de aprendizaje</p>
          </div>
          <Button variant="primary" onClick={() => navigate("/student/schedule")}>
            Reservar una clase
          </Button>
        </section>

        {/* ── KPIs ── */}
        <section className={styles.kpiGrid}>
          {KPIS.map((kpi) => (
            <article key={kpi.id} className={styles.kpiCard}>
              <div className={styles.kpiBody}>
                <span className={styles.kpiLabel}>{kpi.label}</span>
                <span className={styles.kpiValue}>{kpi.value}</span>
              </div>
              <div className={styles.kpiIcon}>{kpi.icon}</div>
            </article>
          ))}
        </section>

        {/* ── Próxima clase ── */}
        <section className={styles.nextClassSection}>
          <div className={styles.nextClassHeading}>
            <span className={styles.nextClassTag}>
              <IconClock /> Próxima clase
            </span>
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
              <Button variant="primary" fullWidth onClick={() => alert("Unido a la clase")}>
                Unirse
              </Button>
              <Button variant="secondary" fullWidth onClick={() => alert("Clase cancelada")}>
                Cancelar
              </Button>
            </div>
          </div>
        </section>

        {/* ── Profesores recomendados ── */}
        <section className={styles.teachersSection}>
          <h2 className={styles.teachersTitle}>Profesores recomendados</h2>
          <div className={styles.teachersGrid}>
            {TEACHERS.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onViewMore={(t) => setSelectedTeacher(t)}
              />
            ))}
          </div>
        </section>

      </main>

      {/* ── Modal perfil del profesor ── */}
      {selectedTeacher && (
        <TeacherProfileModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onViewSchedule={handleViewSchedule}
        />
      )}

    </div>
  );
};

export default StudentDashboard;