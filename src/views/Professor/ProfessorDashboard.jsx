import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import { IconCalendar, IconUsers, IconClock } from "../../components/Icons/Icons";
import styles from "./ProfessorDashboard.module.css";
import Avatar from "../../components/UI/Avatar/Avatar";

import { getTeacherAgenda } from "../../services/reservationService";
import teacherService from "../../services/teacherService";
import api from "../../services/Api";

const TEACHER_NAV = [
  { label: "Inicio",   path: "/teacher/dashboard" },
  { label: "Horario",  path: "/teacher/schedule"  },
  { label: "Clases",   path: "/teacher/classes"   },
  { label: "Mensajes", path: "/teacher/messages"  },
];

const KPIS_META = [
  { id: "today",    label: "Clases de hoy" },
  { id: "upcoming", label: "Próximas clases" },
  { id: "students", label: "Total de Alumnos" },

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

  const [todayClasses, setTodayClasses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [kpis, setKpis] = useState({ today: 0, upcoming: 0, students: 0, hours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Agenda del profesor
        const agendaRes = await getTeacherAgenda();
        const agenda = Array.isArray(agendaRes?.data) ? agendaRes.data : [];

        // Mensajes (endpoint opcional)
        let msgs = [];
        try {
          const mres = await api.get('/teachers/me/messages');
          msgs = Array.isArray(mres?.data) ? mres.data : [];
        } catch (e) {
          // No hay endpoint de mensajes: seguir con vacío
          msgs = [];
        }

        // Perfil (para nombre / datos adicionales)
        let profile = null;
        try {
          const pres = await teacherService.getMyProfile();
          profile = pres?.data || null;
        } catch (e) {
          profile = null;
        }

        // Filtrar las clases de hoy (si hay fecha disponible) o tomar primeras 5
        const todayStr = new Date().toISOString().slice(0,10); // yyyy-mm-dd
        const classesToday = agenda.filter(item => {
          if (!item.date) return false;
          // soportar formatos: '2026-04-15' o '15/04/2026'
          if (/^\d{4}-\d{2}-\d{2}$/.test(item.date)) return item.date === todayStr;
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(item.date)) {
            const [d,m,y] = item.date.split('/');
            return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}` === todayStr;
          }
          return false;
        });

        const usedToday = classesToday.length > 0 ? classesToday : agenda.slice(0,5);

        // Calcular KPIs básicos
        const uniqueStudents = new Set(agenda.map(a => a.studentName || a.participantName).filter(Boolean));

        

        setTodayClasses(usedToday.map((item, idx) => ({
          id: item.reservationId ?? item.id ?? idx,
          subject: item.topic || item.classType || item.subject || "Clase Individual",
          time: item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : (item.time || "--:-- - --:--"),
          meetUrl: item.meetLink || item.meetUrl || item.meet || "#",
        })));

        setMessages(msgs.map((m, i) => ({
          id: m.id ?? i,
          name: m.senderName || m.name || m.from || "Usuario",
          preview: m.preview || m.body || m.message || "",
          read: !!m.read,
          avatar: (m.senderName || m.name || "U").split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase(),
        })));

        setKpis({
          today: usedToday.length,
          upcoming: agenda.length,
          students: uniqueStudents.size,
        });

        // si el perfil vino con nombre y el contexto auth no lo tiene, no sobrescribir el contexto; solo disponible para uso local
        if (profile && !user?.name) {
          // noop: solo lectura aquí
        }

      } catch (error) {
        console.error("Error cargando datos del dashboard del profesor:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  return (
    <div className={styles.page}>
      <AppNavbar  navItems={TEACHER_NAV} activeItem="Inicio" />

      <main className={styles.main}>

        <section className={styles.banner}>
          <div className={styles.bannerText}>
            <h2 className={styles.bannerTitle}>
              Bienvenido, {user?.name?.split(" ")[0] ?? "Profesor"}
            </h2>
            <p className={styles.bannerSub}>
              Tiene(s) <strong>{kpis.today} clases programada(s)</strong> para hoy
            </p>
          </div>
        </section>

        <section className={styles.kpiGrid}>
          {KPIS_META.map((kpi) => (
            <div
              key={kpi.id}
              className={`${styles.kpiCard} ${animated ? styles.kpiCardVisible : ""}`}
            >
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>{kpi.label}</span>
                <span className={styles.kpiValue}>{kpis[kpi.id] ?? "-"}</span>
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
    {loading ? (
      <li className={styles.empty}>Cargando...</li>
    ) : todayClasses.length === 0 ? (
      <li className={styles.empty}>Sin clases para hoy.</li>
    ) : (
      todayClasses.map((cls, index) => (
      <li
        key={cls.id}
        className={`${styles.classItem} ${index === todayClasses.length - 1 ? styles.classItemLast : ""}`}
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
    ))
    )}
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
    {messages.length === 0 ? (
      <li className={styles.empty}>Sin mensajes recientes.</li>
    ) : (
      messages.slice(0,5).map((msg) => (
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
    ))
    )}
  </ul>
</div>

        </section>
      </main>
    </div>
  );
};

export default ProfessorDashboard;
