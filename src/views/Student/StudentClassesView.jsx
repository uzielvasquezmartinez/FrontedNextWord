import { useState, useEffect } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Button from "../../components/UI/Button/Button";
import { getMyReservations, cancelReservation } from "../../services/reservationService";
import { useAuth } from "../../context/AuthContext";
import styles from "./StudentClassesView.module.css";

// ── Navegación ───────────────────────────────────────────────────
const STUDENT_NAV = [
  { label: "Inicio", path: "/student/dashboard" },
  { label: "Horario", path: "/student/schedule" },
  { label: "Clases", path: "/student/classes" },
  { label: "Mensajes", path: "/student/messages" },
];

const STATUS_FILTERS = ["Proximas", "Completadas", "Canceladas"];

// Mapeo de filtros UI a estados del Backend
const FILTER_TO_STATUS = {
  "Proximas": "PENDING",
  "Completadas": "COMPLETED",
  "Canceladas": "CANCELLED"
};

// ── Componente principal ─────────────────────────────────────────
const StudentClassesView = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("Proximas");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const status = FILTER_TO_STATUS[activeFilter];
      const response = await getMyReservations(status);

      const mappedData = response.data.map(item => ({
        id: item.reservationId,
        subject: item.classType || "Ingles Avanzado",
        teacher: item.participantName,
        teacherAvatar: "https://i.pravatar.cc/150?img=33",
        date: item.date,
        time: `${item.startTime} - ${item.endTime}`,
        status: activeFilter,
        meetUrl: item.meetLink,
        duration: "50 min" // Mocked based on screenshot
      }));

      setClasses(mappedData);
    } catch (error) {
      console.error("Error al cargar las clases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [activeFilter, user?.id]);

  const handleCancel = async (reservaId) => {
    const confirmation = window.confirm("¿Estás seguro de que quieres cancelar esta clase?");
    if (!confirmation) return;

    try {
      await cancelReservation(reservaId, "STUDENT", "Cancelación por el alumno", user.id);
      alert("Clase cancelada exitosamente");
      fetchClasses();
    } catch (error) {
      console.error("Error al cancelar:", error);
      alert("No se pudo cancelar la clase");
    }
  };

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={STUDENT_NAV} activeItem="Clases" />

      <main className={styles.main}>
        {/* ── Título y Subtítulo ── */}
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Mis clases</h1>
          <p className={styles.subtitle}>Revisa tus clases con facilidad</p>
        </section>

        <div className={styles.dashboardContainer}>

          {/* ── Tabs / Filtros ── */}
          <section className={styles.filterSection}>
            <div className={styles.filterButtons}>
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  className={`${styles.filterTab} ${activeFilter === filter ? styles.activeTab : ""}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.divider} />

          {/* ── Lista de clases ── */}
          <section className={styles.contentSection}>
            {loading ? (
              <p className={styles.empty}>Cargando clases...</p>
            ) : classes.length === 0 ? (
              <p className={styles.empty}>No hay clases en esta categoría todavía.</p>
            ) : (
              <div className={styles.classesList}>
                {classes.map((cls) => (
                  <article key={cls.id} className={styles.classCard}>
                    {/* Foto */}
                    <img
                      className={styles.teacherAvatar}
                      src={cls.teacherAvatar}
                      alt={cls.teacher}
                    />

                    {/* Información Central */}
                    <div className={styles.classInfo}>
                      <h3 className={styles.classSubject}>{cls.subject}</h3>
                      <p className={styles.classMeta}>Docente: {cls.teacher}</p>
                      <p className={styles.classMeta}>Duracion: {cls.duration}</p>
                    </div>

                    {/* Botones Derecha */}
                    <div className={styles.classActions}>
                      {activeFilter === "Proximas" && (
                        <>
                          <Button
                            variant="primary"
                            className={styles.btnUnirse}
                            onClick={() => window.open(cls.meetUrl, "_blank")}
                            disabled={!cls.meetUrl}
                          >
                            Unirse
                          </Button>
                          <Button
                            variant="secondary"
                            className={styles.btnCancelar}
                            onClick={() => handleCancel(cls.id)}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {activeFilter === "Completadas" && (
                        <Button variant="secondary" className={styles.btnCancelar}>
                          Resumen
                        </Button>
                      )}
                      {activeFilter === "Canceladas" && (
                        <Button variant="secondary" className={styles.btnCancelar}>
                          Reprogramar
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentClassesView;