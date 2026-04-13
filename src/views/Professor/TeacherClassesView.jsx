import { useState, useEffect } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Badge from "../../components/UI/Badge/Badge";
import { getTeacherAgenda } from "../../services/reservationService";
import { useAuth } from "../../context/AuthContext";
import styles from "../Admin/ClassesView.module.css";

const TEACHER_NAV = [
  { label: "Inicio", path: "/teacher/dashboard" },
  { label: "Horario", path: "/teacher/schedule" },
  { label: "Clases", path: "/teacher/classes" },
  { label: "Mensajes", path: "/teacher/messages" },
];

const FILTERS = ["Todos", "Programada", "Completada", "Cancelada"];

const FILTER_STYLES = {
  Todos: { idle: "", active: styles.filterActiveDefault },
  Programada: { idle: styles.filterIdleProgramada, active: styles.filterActiveProgramada },
  Completada: { idle: styles.filterIdleCompletada, active: styles.filterActiveCompletada },
  Cancelada: { idle: styles.filterIdleCancelada, active: styles.filterActiveCancelada },
};

const StudentAvatar = ({ initials, name }) => (
  <div className={styles.avatar}>
    <div className={styles.avatarFallback}>
      {initials || (name?.charAt(0).toUpperCase() ?? "?")}
    </div>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
      </div>
      <div className={styles.modalBody}>{children}</div>
    </div>
  </div>
);

const TeacherClassesView = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const res = await getTeacherAgenda();
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map(item => ({
            id: item.reservationId,
            subject: item.topic || item.classType || "Clase Individual",
            student: item.studentName || item.participantName || "Estudiante",
            date: item.date,
            time: `${item.startTime} - ${item.endTime}`,
            price: item.price ? `$${item.price}` : "$30",
            status: item.status === "PENDING" ? "Programada" :
              item.status === "COMPLETED" ? "Completada" : "Cancelada",
            initials: (item.studentName || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
          }));
          setClasses(mapped);
        } else {
          // Si no hay clases en el backend, cargamos unos Mocks corregidos para ver el diseño
          setClasses([
            { id: 1, subject: "Inglés Avanzado", student: "Uziel Redondo", date: "20/02/2026", time: "10:00 - 11:00", price: "$25", status: "Programada", initials: "UR" },
            { id: 2, subject: "Matemáticas",     student: "Laura Salsedo", date: "21/02/2026", time: "12:00 - 13:00", price: "$35", status: "Cancelada",  initials: "LS" },
            { id: 3, subject: "Inglés Conversación", student: "Mariana García", date: "22/02/2026", time: "15:00 - 16:00", price: "$30", status: "Completada", initials: "MG" },
          ]);
        }
      } catch (error) {
        console.error("Error cargando clases del profesor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const filtered = activeFilter === "Todos"
    ? classes
    : classes.filter((c) => c.status === activeFilter);

  return (
    <div className={styles.page}>
      <AppNavbar title="Portal del Profesor" navItems={TEACHER_NAV} activeItem="Clases" />

      <main className={styles.main}>
        <div className={styles.filtersRow}>
          <span className={styles.filterLabel}>FILTRAR:</span>
          {FILTERS.map((f) => {
            const colorClass = activeFilter === f
              ? FILTER_STYLES[f]?.active
              : FILTER_STYLES[f]?.idle;

            return (
              <button
                key={f}
                className={`${styles.filterBtn} ${colorClass}`}
                onClick={() => setActiveFilter(f)}
              >
                {f !== "Todos" && <span className={styles.filterDot} />}
                {f}
              </button>
            );
          })}
        </div>

        <div className={styles.cardList}>
          {loading ? (
            <p className={styles.empty}>Cargando tus clases...</p>
          ) : filtered.length === 0 ? (
            <p className={styles.empty}>Sin clases para este filtro.</p>
          ) : (
            filtered.map((cls) => (
              <div
                key={cls.id}
                className={styles.card}
                onClick={() => setDetailModal(cls)}
              >
                <StudentAvatar initials={cls.initials} name={cls.student} />
                <div className={styles.cardInfo}>
                  <p className={styles.cardSubject}>{cls.subject}</p>
                  <p className={styles.cardMeta}><strong>Estudiante:</strong> {cls.student}</p>
                  <span className={styles.cardDate}>{cls.date} &nbsp; {cls.time}</span>
                </div>

                <div className={styles.cardRight}>
                  <Badge label={cls.status} variant={cls.status.toLowerCase()} />
                  {/* El precio suele ser relevante para el profesor también */}
                  <span className={styles.cardPrice}>{cls.price}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {detailModal && (
        <Modal title="Detalle de Clase" onClose={() => setDetailModal(null)}>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Materia</span>
            <span className={styles.detailValue}>{detailModal.subject}</span>
            <span className={styles.detailLabel}>Estudiante</span>
            <span className={styles.detailValue}>{detailModal.student}</span>
            <span className={styles.detailLabel}>Fecha</span>
            <span className={styles.detailValue}>{detailModal.date}</span>
            <span className={styles.detailLabel}>Horario</span>
            <span className={styles.detailValue}>{detailModal.time}</span>
            <span className={styles.detailLabel}>Precio</span>
            <span className={styles.detailValue}>{detailModal.price}</span>
            <span className={styles.detailLabel}>Estado</span>
            <span className={styles.detailValue}>
              <Badge label={detailModal.status} variant={detailModal.status.toLowerCase()} />
            </span>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => setDetailModal(null)} style={{
              background: "#6366f1",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeacherClassesView;
