import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Button from "../../components/UI/Button/Button";
import Avatar from "../../components/UI/Avatar/Avatar";
import TeacherCard from "../../components/Student/TeacherCard/TeacherCard";
import TeacherProfileModal from "../../components/Student/TeacherProfileModal/TeacherProfileModal";
import { IconCalendar, IconClock, IconStar } from "../../components/Icons/Icons";
import teacherService from "../../services/teacherService";
import paymentService from "../../services/paymentService";
import styles from "./StudentDashboardView.module.css";
import api from "../../services/Api";
import userService from "../../services/userService";
import { getMyReservations } from "../../services/reservationService";

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const STUDENT_NAV = [
  { label: "Inicio", path: "/student/dashboard" },
  { label: "Horario", path: "/student/schedule" },
  { label: "Clases", path: "/student/classes" },
  { label: "Mensajes", path: "/student/messages" },
];

// ── Valores iniciales de KPIs (se actualizan con datos reales) ───
const KPIS_INITIAL = [
  { id: "next", label: "Próxima Capacitación", value: "Pendiente", icon: <IconCalendar /> },
  { id: "completed", label: "Clases Completadas", value: "0", icon: <IconCalendar /> },
  { id: "credits", label: "Créditos Disponibles", value: "0", icon: <IconStar /> },
];

// ── Componente principal ─────────────────────────────────────────
const StudentDashboard = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para Reclamar Saldo
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState({ type: "", message: "" });

  // Estados para la próxima capacitación
  const [nextClass, setNextClass] = useState(null);
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const [kpis, setKpis] = useState(KPIS_INITIAL);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setLoadingAgenda(true);
        let saldoReal = 0;
        try {
          const meResponse = await userService.getStudentProfile();
          saldoReal = meResponse.data.walletBalance || 0;
        } catch (e) {
          console.error("Error al obtener el saldo:", e);
        }

        // 2. Refrescar contexto del usuario (opcional si ya usamos userService)
        await refreshUser();

        // 3. Cargar Profesores
        try {
          const resTeachers = await teacherService.getTeachers();
          const teacherRows = toArray(resTeachers.data);
          const mappedTeachers = teacherRows.slice(0, 4).map(t => ({
            id: t.id,
            name: t.fullName,
            rating: t.averageRating ?? 0,
            classes: t.completedClasses ?? 0,
            hourlyRate: t.hourlyRate ?? 25,
            avatar: t.profilePicture,
            bio: t.professionalDescription ?? "Sin descripción profesional.",
            education: t.certifications ?? "No especificada",
            experience: t.yearsOfExperience ? `${t.yearsOfExperience} años de experiencia` : "Experiencia no especificada",
          }));
          setTeachers(mappedTeachers);
        } catch (e) {
          console.error("Error al cargar profesores:", e);
        }

        // 4. Cargar Agenda (Pendientes)
        let proximaFecha = "Pendiente";
        try {
          const resAgenda = await getMyReservations("pendientes");
          const agendaRows = toArray(resAgenda.data);
          if (agendaRows.length > 0) {
            const soonest = agendaRows[0];

            setNextClass({
              subject: soonest.topic || "Clase de Inglés",
              // Ajustamos el mapeo: intentamos con teacherName primero
              teacher: soonest.teacherName || soonest.profeFullName || "Profesor asignado",
              duration: "50 min",
              meetUrl: soonest.meetLink || "https://meet.google.com/landing",
              date: soonest.date || soonest.slotDate || "Pendiente",
              time: soonest.startTime || ""
            });

            proximaFecha = soonest.date || soonest.slotDate || "Pendiente";
          }
        } catch (e) {
          console.error("Error en agenda (pendientes):", e);
        }

        // 5. Cargar Clases Completadas
        let completedCount = 0;
        try {
          const resCompleted = await getMyReservations("Completadas");
          completedCount = toArray(resCompleted.data).length;
        } catch (e) {
          console.error("Error al cargar clases completadas:", e);
        }

        // 6. Actualizar TODOS los KPIs al mismo tiempo (Evita parpadeos en la UI)
        setKpis([
          { id: "next", label: "Próxima Capacitación", value: proximaFecha, icon: <IconCalendar /> },
          { id: "completed", label: "Clases Completadas", value: `${completedCount}`, icon: <IconCalendar /> },
          { id: "credits", label: "Créditos Disponibles", value: `${saldoReal}`, icon: <IconStar /> },
        ]);

      } catch (err) {
        console.error("Error crítico global cargando el dashboard:", err);
      } finally {
        setLoading(false);
        setLoadingAgenda(false);
      }
    };
    fetchDashboardData();
  }, []);

  const userName = user?.name?.split(" ")[0] ?? "Estudiante";

  const handleViewSchedule = (teacher) => {
    setSelectedTeacher(null);
    navigate("/student/schedule", { state: { teacher } });
  };

  const handleClaimPayment = async (e) => {
    e.preventDefault();
    if (!paymentId) return;

    try {
      setClaiming(true);
      setClaimStatus({ type: "", message: "" });
      const response = await paymentService.claimPayment(paymentId);
      setClaimStatus({ type: "success", message: response.data.message });
      setPaymentId("");

      // Opcional: Recargar la página o actualizar el contexto para ver el nuevo saldo
      await fetchDashboardData();

    } catch (err) {
      setClaimStatus({
        type: "error",
        message: err.response?.data?.error || "Error al reclamar el pago. Verifica el ID."
      });
    } finally {
      setClaiming(false);
    }
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
          <div className={styles.bannerActions}>
            <Button variant="primary" onClick={() => navigate("/student/schedule")}>
              Reservar una clase
            </Button>
            <Button variant="secondary" onClick={() => setShowClaimModal(true)}>
              Reclamar Saldo
            </Button>
          </div>
        </section>

        {/* ── KPIs ── */}
        <section className={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <article key={kpi.id} className={styles.kpiCard}>
              <div className={styles.kpiBody}>
                <span className={styles.kpiLabel}>{kpi.label}</span>
                <span className={styles.kpiValue}>{kpi.value}</span>
              </div>
              <div className={styles.kpiIcon}>{kpi.icon}</div>
            </article>
          ))}
        </section>

        {/* ── Próxima capacitación ── */}
        <section className={styles.nextClassSection}>
          <div className={styles.nextClassHeading}>
            <span className={styles.nextClassTag}>
              <IconClock /> Próxima capacitación
            </span>
          </div>

          {loadingAgenda ? (
            <div className={styles.nextClassCard}>
              <p className={styles.emptyMessage}>Cargando agenda...</p>
            </div>
          ) : nextClass ? (
            <div className={styles.nextClassCard}>
              <div className={styles.nextClassInfo}>
                <Avatar initials={nextClass.teacher.charAt(0)} size="lg" />
                <div>
                  <h3>{nextClass.subject}</h3>
                  <p>Docente: {nextClass.teacher}</p>
                  <p>Fecha: {nextClass.date} · {nextClass.time}</p>
                </div>
              </div>
              <div className={styles.nextClassActions}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => window.open(nextClass.meetUrl, "_blank")}
                >
                  Unirse
                </Button>
                <Button variant="secondary" fullWidth onClick={() => alert("Función de cancelación próximamente")}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.nextClassCard}>
              <p className={styles.emptyMessage}>Actualmente no tienes capacitaciones disponibles.</p>
            </div>
          )}
        </section>

        {/* ── Profesores recomendados ── */}
        <section className={styles.teachersSection}>
          <h2 className={styles.teachersTitle}>Profesores recomendados</h2>
          {loading ? (
            <p className={styles.loading}>Cargando recomendaciones...</p>
          ) : (
            <div className={styles.teachersGrid}>
              {teachers.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  onViewMore={(t) => setSelectedTeacher(t)}
                />
              ))}
            </div>
          )}
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
      {/* ── Modal Reclamar Saldo ── */}
      {showClaimModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.claimModal}>
            <button className={styles.closeBtn} onClick={() => setShowClaimModal(false)}>×</button>
            <h2>Reclamar Saldo</h2>
            <p>Ingresa el <b>ID de Operación</b> que aparece en tu comprobante de Mercado Pago.</p>

            <form onSubmit={handleClaimPayment}>
              <input
                type="text"
                className={styles.claimInput}
                placeholder="Ej: 1234567890"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                required
              />

              {claimStatus.message && (
                <div className={`${styles.statusMsg} ${styles[claimStatus.type]}`}>
                  {claimStatus.message}
                </div>
              )}

              <div className={styles.modalActions}>
                <Button variant="primary" fullWidth type="submit" loading={claiming}>
                  Validar Pago
                </Button>
                <Button variant="outline" fullWidth onClick={() => setShowClaimModal(false)} disabled={claiming}>
                  Cerrar
                </Button>
              </div>
            </form>

            <p className={styles.helpText}>
              ¿No tienes saldo? <a href="https://link.mercadopago.com.mx/prueba" target="_blank" rel="noreferrer">Paga aquí primero</a>
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
