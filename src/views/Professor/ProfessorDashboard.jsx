import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import { IconCalendar, IconUsers, IconClock } from "../../components/Icons/Icons";
import styles from "./ProfessorDashboard.module.css";
import Avatar from "../../components/UI/Avatar/Avatar";


const TEACHER_NAV = [
  { label: "Inicio",   path: "/teacher/dashboard" },
  { label: "Horario",  path: "/teacher/schedule"  },
  { label: "Mensajes", path: "/teacher/messages"  },
];

const KPIS = [
  { id: "today",    label: "Clases de hoy",    value: 5   },
  { id: "upcoming", label: "Próximas clases",  value: 12  },
  { id: "students", label: "Total de Alumnos", value: 10  },
  { id: "hours",    label: "Horas Impartidas", value: 150 },
];

const TODAY_CLASSES = [
  { id: 1, subject: "Inglés III", time: "10:00 - 11:00", meetUrl: "https://meet.google.com" },
  { id: 2, subject: "Inglés III", time: "11:00 - 12:00", meetUrl: "https://meet.google.com" },
  { id: 3, subject: "Inglés III", time: "13:00 - 14:00", meetUrl: "https://meet.google.com" },
  { id: 4, subject: "Inglés III", time: "15:00 - 16:00", meetUrl: "https://meet.google.com" },
  { id: 5, subject: "Inglés III", time: "17:00 - 18:00", meetUrl: "https://meet.google.com" },
];

const MESSAGES = [
  { id: 1, name: "Carlos Rodríguez", preview: "Claro, las revisaremos en la próxima sesión", read: true,  avatar: "CR" },
  { id: 2, name: "Emmanuel Pereira", preview: "Échale más ganas, practica más",              read: false, avatar: "EP" },
  { id: 3, name: "Gerson Olivares",  preview: "Deberías de practicar más tu listening",      read: false, avatar: "GO" },
];

const KPI_ICONS = {
  today:    <IconCalendar />,
  upcoming: <IconCalendar />,
  students: <IconUsers />,
  hours:    <IconClock />,
};

const ProfessorDashboard = () => {
  const { user } = useAuth();
  const [animated, setAnimated] = useState(false);
const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={TEACHER_NAV} activeItem="Inicio" />

      <main className={styles.main}>

        <section className={styles.banner}>
          <div className={styles.bannerText}>
            <h2 className={styles.bannerTitle}>
              Bienvenido, profesor {user?.name?.split(" ")[0] ?? "Profesor"}
            </h2>
            <p className={styles.bannerSub}>
              Tiene(s) <strong>{TODAY_CLASSES.length} clases programada(s)</strong> para hoy
            </p>
          </div>
        </section>

        <section className={styles.kpiGrid}>
          {KPIS.map((kpi) => (
            <div
              key={kpi.id}
              className={`${styles.kpiCard} ${animated ? styles.kpiCardVisible : ""}`}
            >
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>{kpi.label}</span>
                <span className={styles.kpiValue}>{kpi.value}</span>
              </div>
              <div className={styles.kpiIcon}>{KPI_ICONS[kpi.id]}</div>
            </div>
          ))}
        </section>

        <section className={styles.bottomGrid}>

       <div className={styles.card}>
  <div className={styles.cardTitleRow}>
    <h3 className={styles.cardTitle}>Clases de hoy</h3>
  </div>
  <ul className={styles.classList}>
    {TODAY_CLASSES.map((cls, index) => (
      <li
        key={cls.id}
        className={`${styles.classItem} ${index === TODAY_CLASSES.length - 1 ? styles.classItemLast : ""}`}
      >
        <div className={styles.classTime}>
          {cls.time.split(" - ").map((t, i) => (
            <span key={i} className={styles.classTimeRow}>{t}</span>
          ))}
        </div>
        <span className={styles.classSubject}>{cls.subject}</span>
        
         <a href={cls.meetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.btnEnter} ${index === 0 ? styles.btnEnterActive : ""}`}
        >
          Entrar
        </a>
      </li>
    ))}
  </ul>
</div>

          {/* Mensajes recientes */}
<div className={styles.card}>
  <div className={styles.cardTitleRow}>
    <h3 className={styles.cardTitle}>Mensajes Recientes</h3>
    <button
      className={styles.cardLinkBtn}
      onClick={() => navigate("/teacher/messages")}
    >
      Ver todos →
    </button>
  </div>
  <ul className={styles.messageList}>
    {MESSAGES.map((msg) => (
      <li
        key={msg.id}
        className={styles.messageItem}
        onClick={() => navigate("/teacher/messages")}
      >
        <Avatar initials={msg.avatar} size="md" />
        <div className={styles.messageBody}>
          <span className={styles.messageName}>{msg.name}</span>
          <span className={styles.messagePreview}>{msg.preview}</span>
        </div>
        {!msg.read && <span className={styles.messageDot} />}
      </li>
    ))}
  </ul>
</div>

        </section>
      </main>
    </div>
  );
};

export default ProfessorDashboard;