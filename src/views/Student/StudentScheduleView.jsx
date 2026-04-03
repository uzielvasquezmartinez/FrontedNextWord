import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Input from "../../components/UI/Input/Input";
import Button from "../../components/UI/Button/Button";
import TeacherCard from "../../components/Student/TeacherCard/TeacherCard";
import TeacherProfileModal from "../../components/Student/TeacherProfileModal/TeacherProfileModal";
import BookingConfirmModal from "../../components/Student/BookingConfirmModal/BookingConfirmModal";
import MonthlyView from "../../components/Schedule/MonthlyView";
import WeeklyView from "../../components/Schedule/WeeklyView";
import DailyView from "../../components/Schedule/DailyView";
import { IconSearch } from "../../components/Icons/Icons";
import { MOCK_SCHEDULES, getWeekStart } from "../../components/Schedule/scheduleHelpers";
import styles from "./StudentScheduleView.module.css";

// ── Navegación ───────────────────────────────────────────────────
const STUDENT_NAV = [
  { label: "Inicio",   path: "/student/dashboard" },
  { label: "Horario",  path: "/student/schedule"  },
  { label: "Clases",   path: "/student/classes"   },
  { label: "Mensajes", path: "/student/messages"  },
];

// ── Datos mock profesores ────────────────────────────────────────
const TEACHERS = [
  {
    id: 1, name: "Marco Lopez",     rating: 4.8, classes: 50, hourlyRate: 25,
    avatar: "https://i.pravatar.cc/150?img=12",
    bio: "Lingüista con doctorado y 10 años transformando el aprendizaje del idioma.",
    education: "Doctorado en Lingüística Aplicada / Enseñanza del Inglés",
    experience: "10 años de experiencia",
  },
  {
    id: 2, name: "Marco Lopez",     rating: 4.8, classes: 50, hourlyRate: 25,
    avatar: "https://i.pravatar.cc/150?img=32",
    bio: "Especialista en inglés conversacional con enfoque en negocios internacionales.",
    education: "Maestría en Lingüística Aplicada",
    experience: "8 años de experiencia",
  },
  {
    id: 3, name: "Marco Lopez",     rating: 4.8, classes: 50, hourlyRate: 25,
    avatar: "https://i.pravatar.cc/150?img=22",
    bio: "Profesor certificado por Cambridge con experiencia en preparación de exámenes.",
    education: "Certificación Cambridge CELTA",
    experience: "12 años de experiencia",
  },
  {
    id: 4, name: "Carolina Bahena", rating: 4.5, classes: 40, hourlyRate: 20,
    avatar: "https://i.pravatar.cc/150?img=44",
    bio: "Apasionada por la enseñanza del inglés con metodología dinámica e interactiva.",
    education: "Licenciatura en Idiomas Modernos",
    experience: "6 años de experiencia",
  },
];

// ── Componente principal ─────────────────────────────────────────
const StudentScheduleView = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const today     = new Date();

  // ── Estados ──────────────────────────────────────────────────
  const [search,          setSearch]          = useState("");
  const [activeFilter,    setActiveFilter]    = useState("Mensual");
  const [currentYear,     setCurrentYear]     = useState(today.getFullYear());
  const [currentMonth,    setCurrentMonth]    = useState(today.getMonth());
  const [weekStart,       setWeekStart]       = useState(getWeekStart(today));
  const [currentDay,      setCurrentDay]      = useState(today);
  const [selectedTeacher, setSelectedTeacher] = useState(location.state?.teacher ?? null);
  const [activeTeacher,   setActiveTeacher]   = useState(location.state?.teacher ?? null);
  const [bookingSlot,     setBookingSlot]     = useState(null);

  // ── Navegación mensual ────────────────────────────────────────
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  // ── Navegación semanal ────────────────────────────────────────
  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };

  // ── Navegación diaria ─────────────────────────────────────────
  const prevDay = () => { const d = new Date(currentDay); d.setDate(d.getDate() - 1); setCurrentDay(d); };
  const nextDay = () => { const d = new Date(currentDay); d.setDate(d.getDate() + 1); setCurrentDay(d); };

  // ── Handlers ─────────────────────────────────────────────────
  const handleSelectTeacher = (teacher) => {
    setActiveTeacher(teacher);
    setSelectedTeacher(null);
  };

  const handleConfirmBooking = ({ slot, teacher }) => {
    setBookingSlot(null);
    navigate("/student/checkout", { state: { slot, teacher } });
  };

  const handleDayClick = ({ day, currentYear, currentMonth }) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const slot = MOCK_SCHEDULES.find((s) => s.date === dateStr && s.type === "Disponible");
    if (slot) setBookingSlot(slot);
  };

  const filteredTeachers = TEACHERS.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );
  // ── Render ────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={STUDENT_NAV} activeItem="Horario" />

      <main className={styles.main}>

        {activeTeacher ? (
          <>
            {/* ── Barra del profesor activo ── */}
           <div className={styles.activeTeacherBar}>
  <div className={styles.activeTeacherInfo}>
    <img
      className={styles.activeTeacherAvatar}
      src={activeTeacher.avatar}
      alt={activeTeacher.name}
    />
    <div>
      <span className={styles.activeTeacherName}>{activeTeacher.name}</span>
      <span className={styles.activeTeacherPrice}>${activeTeacher.hourlyRate}/hr</span>
    </div>
  </div>
  <div className={styles.activeTeacherActions}>
    <Button variant="outline" onClick={() => setActiveTeacher(null)}>
      ← Ver profesores
    </Button>
  </div>
</div>

            {/* ── Toolbar filtros ── */}
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <span className={styles.filterLabel}>FILTRO:</span>
                {["Mensual", "Semanal", "Diaria"].map((f) => (
                  <button
                    key={f}
                    className={`${styles.filterBtn} ${activeFilter === f ? styles.filterBtnActive : ""}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Leyenda ── */}
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotUnavailable}`} /> No disponible
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotReserved}`} /> Reservado
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotAvailable}`} /> Disponible
              </span>
            </div>

            {/* ── Vistas del calendario ── */}
            {activeFilter === "Mensual" && (
              <MonthlyView
                schedules={MOCK_SCHEDULES}
                currentYear={currentYear}
                currentMonth={currentMonth}
                onPrev={prevMonth}
                onNext={nextMonth}
                onDayClick={handleDayClick}
              />
            )}
            {activeFilter === "Semanal" && (
              <WeeklyView
                schedules={MOCK_SCHEDULES}
                weekStart={weekStart}
                onPrev={prevWeek}
                onNext={nextWeek}
                onCellClick={({ schedule }) => {
                  if (schedule?.type === "Disponible") setBookingSlot(schedule);
                }}
              />
            )}
            {activeFilter === "Diaria" && (
              <DailyView
                schedules={MOCK_SCHEDULES}
                currentDay={currentDay}
                onPrev={prevDay}
                onNext={nextDay}
                onSlotClick={({ slot }) => {
                  if (slot?.type === "Disponible") setBookingSlot(slot);
                }}
              />
            )}
          </>
        ) : (
          <>
            {/* ── Lista de profesores ── */}
            <div className={styles.searchWrapper}>
              <Input
                placeholder="Buscar Profesores"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<IconSearch />}
              />
            </div>

            <div className={styles.teachersContainer}>
              <div className={styles.teachersGrid}>
                {filteredTeachers.length === 0 ? (
                  <p className={styles.empty}>No se encontraron profesores.</p>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TeacherCard
                      key={teacher.id}
                      teacher={teacher}
                      onViewMore={(t) => setSelectedTeacher(t)}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}

      </main>

      {/* ── Modal perfil del profesor ── */}
      {selectedTeacher && (
        <TeacherProfileModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onViewSchedule={handleSelectTeacher}
        />
      )}

      {/* ── Modal confirmación de reserva ── */}
      {bookingSlot && (
        <BookingConfirmModal
          slot={bookingSlot}
          teacher={activeTeacher}
          onConfirm={handleConfirmBooking}
          onClose={() => setBookingSlot(null)}
        />
      )}
 
    </div>
  );
};

export default StudentScheduleView;