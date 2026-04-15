import { useState, useEffect } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Button from "../../components/UI/Button/Button";
import { getMyReservations, cancelReservation } from "../../services/reservationService";
import { useAuth } from "../../context/AuthContext";
import styles from "./StudentClassesView.module.css";

const STUDENT_NAV = [
  { label: "Inicio", path: "/student/dashboard" },
  { label: "Horario", path: "/student/schedule" },
  { label: "Clases", path: "/student/classes" },
  { label: "Mensajes", path: "/student/messages" },
];

const STATUS_FILTERS = ["Pendientes", "Completadas", "Canceladas"];

const STATUS_BY_FILTER = {
  Pendientes: ["PENDIENTE", "PENDIENTEPAGO", "PENDING", "PROGRAMADA", "PENDIENTES"],
  Completadas: ["COMPLETADA", "COMPLETADAS", "COMPLETED", "FINALIZADA"],
  Canceladas: ["CANCELADA", "CANCELADAS", "CANCELLED", "CANCELED"],
};

const extractReservations = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeTeacherName = (item) =>
  item.teacherName ||
  item.profeFullName ||
  item.professorName ||
  item.teacher?.fullName ||
  item.teacher?.name ||
  "Profesor asignado";

const normalizeStatus = (status) => {
  if (!status) return "Pendientes";
  const s = String(status).trim().toUpperCase();
  if (STATUS_BY_FILTER.Completadas.includes(s)) return "Completadas";
  if (STATUS_BY_FILTER.Canceladas.includes(s)) return "Canceladas";
  return "Pendientes";
};

const StudentClassesView = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("Pendientes");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchClasses = async () => {
    setLoading(true);
    setError("");

    try {
      // Nota: traemos todas las clases y filtramos en frontend.
      // Evita romper por diferencias de contrato del query param status.
      const response = await getMyReservations();
      const reservations = extractReservations(response.data);

      const mappedData = reservations.map((item) => ({
        id: item.reservationId ?? item.id,
        subject: item.topic || "Clase de Ingles",
        teacher: normalizeTeacherName(item),
        teacherAvatar: null,
        date: item.date ?? item.slotDate ?? "-",
        time: `${item.startTime ?? "--:--"} - ${item.endTime ?? "--:--"}`,
        status: normalizeStatus(item.status),
        meetUrl: item.meetLink,
        duration: "50 min",
      }));

      setClasses(mappedData);
    } catch (err) {
      console.error("Error al cargar las clases:", err);
      setClasses([]);
      setError("No se pudieron cargar tus clases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user?.id]);

  const handleCancel = async (reservaId) => {
    const confirmation = window.confirm("Estas seguro de que quieres cancelar esta clase?");
    if (!confirmation) return;

    try {
      await cancelReservation(reservaId, "STUDENT", "Cancelacion por el alumno", user.id);
      alert("Clase cancelada exitosamente");
      fetchClasses();
    } catch (err) {
      console.error("Error al cancelar:", err);
      alert("No se pudo cancelar la clase");
    }
  };

  const filteredClasses = classes.filter((cls) => cls.status === activeFilter);

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={STUDENT_NAV} activeItem="Clases" />

      <main className={styles.main}>
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Mis clases</h1>
          <p className={styles.subtitle}>Revisa tus clases con facilidad</p>
        </section>

        <div className={styles.dashboardContainer}>
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

          <section className={styles.contentSection}>
            {loading ? (
              <p className={styles.empty}>Cargando clases...</p>
            ) : error ? (
              <p className={styles.empty}>{error}</p>
            ) : filteredClasses.length === 0 ? (
              <p className={styles.empty}>No hay clases en esta categoria todavia.</p>
            ) : (
              <div className={styles.classesList}>
                {filteredClasses.map((cls) => (
                  <article key={cls.id} className={styles.classCard}>
                    {cls.teacherAvatar ? (
                      <img className={styles.teacherAvatar} src={cls.teacherAvatar} alt={cls.teacher} />
                    ) : (
                      <div className={styles.teacherAvatarInitials}>
                        {cls.teacher?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                    )}

                    <div className={styles.classInfo}>
                      <h3 className={styles.classSubject}>{cls.subject}</h3>
                      <p className={styles.classMeta}>Docente: {cls.teacher}</p>
                      <p className={styles.classMeta}>Duracion: {cls.duration}</p>
                    </div>

                    <div className={styles.classActions}>
                      {activeFilter === "Pendientes" && (
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
