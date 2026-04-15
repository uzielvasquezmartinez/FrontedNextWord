import { useCallback, useEffect, useState } from "react";
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

const KPIS_INITIAL = [
  { id: "next", label: "Proxima Capacitacion", value: "Pendiente", icon: <IconCalendar /> },
  { id: "completed", label: "Clases Completadas", value: "0", icon: <IconCalendar /> },
  { id: "credits", label: "Creditos Disponibles", value: "0", icon: <IconStar /> },
];

const StudentDashboard = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState({ type: "", message: "" });

  const [nextClass, setNextClass] = useState(null);
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const [kpis, setKpis] = useState(KPIS_INITIAL);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingAgenda(true);

      let saldoReal = 0;
      try {
        const meResponse = await userService.getStudentProfile();
        saldoReal = meResponse.data.walletBalance || 0;
      } catch (error) {
        console.error("Error al obtener el saldo:", error);
      }

      await refreshUser();

      try {
        const resTeachers = await teacherService.getTeachers();
        const teacherRows = toArray(resTeachers.data);
        const mappedTeachers = teacherRows.map((teacher) => ({
          id: teacher.id,
          name: teacher.fullName,
          rating: teacher.averageRating ?? 0,
          classes: teacher.completedClasses ?? 0,
          hourlyRate: teacher.hourlyRate ?? 25,
          avatar: teacher.profilePicture,
          bio: teacher.professionalDescription ?? "Sin descripcion profesional.",
          education: teacher.certifications ?? "No especificada",
          experience: teacher.yearsOfExperience
            ? `${teacher.yearsOfExperience} anos de experiencia`
            : "Experiencia no especificada",
        }));
        setTeachers(mappedTeachers);
      } catch (error) {
        console.error("Error al cargar profesores:", error);
      }

      let proximaFecha = "Pendiente";
      try {
        const resAgenda = await getMyReservations("pendientes");
        const agendaRows = toArray(resAgenda.data);
        if (agendaRows.length > 0) {
          const soonest = agendaRows[0];
          setNextClass({
            subject: soonest.topic || "Clase de Ingles",
            teacher: soonest.teacherName || soonest.profeFullName || "Profesor asignado",
            duration: "50 min",
            meetUrl: soonest.meetLink || "https://meet.google.com/landing",
            date: soonest.date || soonest.slotDate || "Pendiente",
            time: soonest.startTime || "",
          });
          proximaFecha = soonest.date || soonest.slotDate || "Pendiente";
        } else {
          setNextClass(null);
        }
      } catch (error) {
        console.error("Error en agenda (pendientes):", error);
      }

      let completedCount = 0;
      try {
        const resCompleted = await getMyReservations("Completadas");
        completedCount = toArray(resCompleted.data).length;
      } catch (error) {
        console.error("Error al cargar clases completadas:", error);
      }

      setKpis([
        { id: "next", label: "Proxima Capacitacion", value: proximaFecha, icon: <IconCalendar /> },
        { id: "completed", label: "Clases Completadas", value: `${completedCount}`, icon: <IconCalendar /> },
        { id: "credits", label: "Creditos Disponibles", value: `${saldoReal}`, icon: <IconStar /> },
      ]);
    } catch (error) {
      console.error("Error critico global cargando el dashboard:", error);
    } finally {
      setLoading(false);
      setLoadingAgenda(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const userName = user?.name?.split(" ")[0] ?? "Estudiante";

  const handleViewSchedule = (teacher) => {
    setSelectedTeacher(null);
    navigate("/student/schedule", { state: { teacher } });
  };

  const handleClaimPayment = async (event) => {
    event.preventDefault();
    if (!paymentId) return;

    try {
      setClaiming(true);
      setClaimStatus({ type: "", message: "" });
      const response = await paymentService.claimPayment(paymentId);
      setClaimStatus({ type: "success", message: response.data.message });
      setPaymentId("");
      await fetchDashboardData();
    } catch (error) {
      setClaimStatus({
        type: "error",
        message: error.response?.data?.error || "Error al reclamar el pago. Verifica el ID.",
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={STUDENT_NAV} activeItem="Inicio" />

      <main className={styles.main}>
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

        <section className={styles.nextClassSection}>
          <div className={styles.nextClassHeading}>
            <span className={styles.nextClassTag}>
              <IconClock /> Proxima capacitacion
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
                  <p>
                    Fecha: {nextClass.date} - {nextClass.time}
                  </p>
                </div>
              </div>
              <div className={styles.nextClassActions}>
                <Button variant="primary" fullWidth onClick={() => window.open(nextClass.meetUrl, "_blank")}>
                  Unirse
                </Button>
                <Button variant="secondary" fullWidth onClick={() => alert("Funcion de cancelacion proximamente")}>
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

        <section className={styles.teachersSection}>
          <h2 className={styles.teachersTitle}>Profesores recomendados</h2>
          {loading ? (
            <p className={styles.loading}>Cargando recomendaciones...</p>
          ) : (
            <div className={styles.teachersGrid}>
              {teachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} onViewMore={(item) => setSelectedTeacher(item)} />
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedTeacher && (
        <TeacherProfileModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onViewSchedule={handleViewSchedule}
        />
      )}

      {showClaimModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.claimModal}>
            <button className={styles.closeBtn} onClick={() => setShowClaimModal(false)} type="button">
              X
            </button>
            <h2>Reclamar Saldo</h2>
            <p>
              Ingresa el <b>ID de Operacion</b> que aparece en tu comprobante de Mercado Pago.
            </p>

            <form onSubmit={handleClaimPayment}>
              <input
                type="text"
                className={styles.claimInput}
                placeholder="Ej: 1234567890"
                value={paymentId}
                onChange={(event) => setPaymentId(event.target.value)}
                required
              />

              {claimStatus.message && (
                <div className={`${styles.statusMsg} ${styles[claimStatus.type]}`}>{claimStatus.message}</div>
              )}

              <div className={styles.modalActions}>
                <Button variant="primary" fullWidth type="submit" loading={claiming}>
                  Validar Pago
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowClaimModal(false)}
                  disabled={claiming}
                >
                  Cerrar
                </Button>
              </div>
            </form>

            <p className={styles.helpText}>
              No tienes saldo?{" "}
              <a href="https://link.mercadopago.com.mx/prueba" target="_blank" rel="noreferrer">
                Paga aqui primero
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
