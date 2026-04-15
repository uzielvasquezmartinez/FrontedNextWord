import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Badge from "../../components/UI/Badge/Badge";
import Input from "../../components/UI/Input/Input";
import adminService from "../../services/AdminService";
import styles from "./ClassesView.module.css";

const ADMIN_NAV = [
  { label: "Inicio", path: "/admin/dashboard" },
  { label: "Profesores", path: "/admin/teachers" },
  { label: "Clases", path: "/admin/classes" },
  { label: "Reportes", path: "/admin/reports" },
];

const STATUS_LABELS = {
  PENDING: "Programada",
  PROGRAMADA: "Programada",
  SCHEDULED: "Programada",
  BOOKED: "Programada",
  RESERVED: "Programada",
  COMPLETED: "Completada",
  FINALIZADA: "Completada",
  COMPLETADA: "Completada",
  CANCELLED: "Cancelada",
  CANCELED: "Cancelada",
  CANCELADA: "Cancelada",
};

const FILTER_STYLES = {
  Todos: { idle: "", active: styles.filterActiveDefault },
  Programada: { idle: styles.filterIdleProgramada, active: styles.filterActiveProgramada },
  Cancelada: { idle: styles.filterIdleCancelada, active: styles.filterActiveCancelada },
  Completada: { idle: styles.filterIdleCompletada, active: styles.filterActiveCompletada },
};

const extractRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeStatus = (status) => {
  const normalized = String(status ?? "").trim().toUpperCase();
  if (STATUS_LABELS[normalized]) return STATUS_LABELS[normalized];
  if (!normalized) return "Programada";

  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 10);
  return parsed.toLocaleDateString("sv-SE");
};

const normalizeDateFilterValue = (value) => {
  if (!value) return "";
  const stringValue = String(value);
  return stringValue.length >= 10 ? stringValue.slice(0, 10) : stringValue;
};

const formatTime = (value) => {
  if (!value) return "--:--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--:--";
  return parsed.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const normalizeDate = (item) => formatDate(item.datetime ?? item.date ?? item.slotDate ?? item.reservationDate);

const normalizeTime = (item) => formatTime(item.datetime ?? item.startTime ?? item.slotStartTime);

const normalizeTeacherName = (item) =>
  item.teacherName ||
  item.teacher ||
  item.teacherName ||
  item.teacherFullName ||
  item.professorName ||
  item.teacher?.fullName ||
  item.teacher?.name ||
  "Profesor asignado";

const normalizeStudentName = (item) =>
  item.studentName ||
  item.student ||
  item.studentName ||
  item.studentFullName ||
  item.alumnoNombre ||
  item.student?.fullName ||
  item.student?.name ||
  "Alumno asignado";

const normalizeSubject = (item) =>
  item.topic ||
  item.subject ||
  item.classType ||
  item.courseName ||
  "Clase";

const TeacherAvatar = ({ image, name }) => (
  <div className={styles.avatar}>
    {image ? (
      <img src={image} alt={name} className={styles.avatarImg} />
    ) : (
      <div className={styles.avatarFallback}>
        {name?.charAt(0).toUpperCase() ?? "?"}
      </div>
    )}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <button className={styles.modalClose} onClick={onClose} type="button">
          X
        </button>
      </div>
      <div className={styles.modalBody}>{children}</div>
    </div>
  </div>
);

const ClassesView = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await adminService.getClassHistory();
        const reservations = extractRows(response.data);

        const mappedReservations = reservations.map((item) => ({
          id: item.id ?? item.reservationId,
          subject: normalizeSubject(item),
          student: normalizeStudentName(item),
          teacher: normalizeTeacherName(item),
          teacherImage: null,
          date: normalizeDate(item),
          rawDate: normalizeDateFilterValue(normalizeDate(item)),
          time: normalizeTime(item),
          price: "No disponible",
          status: normalizeStatus(item.status),
          meetUrl: item.meetLink ?? item.meetingUrl ?? "",
        }));

        setClasses(mappedReservations);
      } catch (loadError) {
        console.error("Error cargando clases del administrador:", loadError);
        setClasses([]);
        setError("No se pudieron cargar las clases.");
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const availableFilters = useMemo(() => {
    const statusSet = new Set(classes.map((item) => item.status).filter(Boolean));
    return ["Todos", ...Object.keys(FILTER_STYLES).filter((status) => status !== "Todos" && statusSet.has(status))];
  }, [classes]);

  useEffect(() => {
    if (!availableFilters.includes(activeFilter)) {
      setActiveFilter("Todos");
    }
  }, [activeFilter, availableFilters]);

  const filteredClasses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return classes.filter((item) => {
      const matchesStatus = activeFilter === "Todos" || item.status === activeFilter;
      const matchesDate = !selectedDate || item.rawDate === selectedDate;
      const matchesTeacher = !selectedTeacher || item.teacher === selectedTeacher;
      const matchesStudent = !selectedStudent || item.student === selectedStudent;
      const matchesSearch =
        !normalizedSearch ||
        [item.subject, item.student, item.teacher, item.date, item.time]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesDate && matchesTeacher && matchesStudent && matchesSearch;
    });
  }, [activeFilter, classes, searchTerm, selectedDate, selectedTeacher, selectedStudent]);

  const teacherOptions = useMemo(
    () => [...new Set(classes.map((item) => item.teacher).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [classes]
  );

  const studentOptions = useMemo(
    () => [...new Set(classes.map((item) => item.student).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [classes]
  );

  const clearFilters = () => {
    setActiveFilter("Todos");
    setSearchTerm("");
    setSelectedDate("");
    setSelectedTeacher("");
    setSelectedStudent("");
  };

  return (
    <div className={styles.page}>
      <AppNavbar title="Panel de Administrador" navItems={ADMIN_NAV} activeItem="Clases" />

      <main className={styles.main}>
        <div className={styles.filtersPanel}>
          <div className={styles.filtersRow}>
            <span className={styles.filterLabel}>ESTADO:</span>
            {availableFilters.map((filter) => {
              const colorClass =
                activeFilter === filter ? FILTER_STYLES[filter]?.active : FILTER_STYLES[filter]?.idle;

              return (
                <button
                  key={filter}
                  className={`${styles.filterBtn} ${colorClass}`}
                  onClick={() => setActiveFilter(filter)}
                  type="button"
                >
                  {filter !== "Todos" && <span className={styles.filterDot} />}
                  {filter}
                </button>
              );
            })}
          </div>

          <div className={styles.toolsRow}>
            <Input
              id="class-search"
              label="Buscar"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Materia, alumno o profesor"
            />

            <label className={styles.dateField} htmlFor="class-date-filter">
              <span className={styles.dateLabel}>Fecha</span>
              <input
                id="class-date-filter"
                className={styles.dateInput}
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>

            <label className={styles.selectField} htmlFor="class-teacher-filter">
              <span className={styles.dateLabel}>Profesor</span>
              <select
                id="class-teacher-filter"
                className={styles.selectInput}
                value={selectedTeacher}
                onChange={(event) => setSelectedTeacher(event.target.value)}
              >
                <option value="">Todos</option>
                {teacherOptions.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.selectField} htmlFor="class-student-filter">
              <span className={styles.dateLabel}>Estudiante</span>
              <select
                id="class-student-filter"
                className={styles.selectInput}
                value={selectedStudent}
                onChange={(event) => setSelectedStudent(event.target.value)}
              >
                <option value="">Todos</option>
                {studentOptions.map((student) => (
                  <option key={student} value={student}>
                    {student}
                  </option>
                ))}
              </select>
            </label>

            <button type="button" className={styles.clearBtn} onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className={styles.cardList}>
          {loading ? (
            <p className={styles.empty}>Cargando clases...</p>
          ) : error ? (
            <p className={styles.empty}>{error}</p>
          ) : filteredClasses.length === 0 ? (
            <p className={styles.empty}>Sin clases para los filtros seleccionados.</p>
          ) : (
            filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className={styles.card}
                onClick={() => setDetailModal(cls)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setDetailModal(cls);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <TeacherAvatar image={cls.teacherImage} name={cls.teacher} />

                <div className={styles.cardInfo}>
                  <p className={styles.cardSubject}>{cls.subject}</p>
                  <p className={styles.cardMeta}>
                    <strong>Estudiante:</strong> {cls.student}
                  </p>
                  <p className={styles.cardMeta}>
                    <strong>Profesor:</strong> {cls.teacher}
                  </p>
                  <span className={styles.cardDate}>
                    {cls.date} {cls.time}
                  </span>
                </div>

                <div className={styles.cardRight}>
                  <Badge label={cls.status} variant={cls.status.toLowerCase()} />
                  <span className={styles.cardPrice}>{cls.price}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {detailModal && (
        <Modal title="Detalle de clase" onClose={() => setDetailModal(null)}>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Materia</span>
            <span className={styles.detailValue}>{detailModal.subject}</span>
            <span className={styles.detailLabel}>Estudiante</span>
            <span className={styles.detailValue}>{detailModal.student}</span>
            <span className={styles.detailLabel}>Profesor</span>
            <span className={styles.detailValue}>{detailModal.teacher}</span>
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
            {detailModal.meetUrl ? (
              <>
                <span className={styles.detailLabel}>Enlace</span>
                <a
                  className={styles.detailLink}
                  href={detailModal.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir clase
                </a>
              </>
            ) : null}
          </div>

          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => setDetailModal(null)} type="button">
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClassesView;
