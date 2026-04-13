import { useState, useEffect } from "react";
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
// IMPORTAMOS EL SERVICIO
import teacherService from "../../services/teacherService";
// 1. Agrega el import de tu nuevo servicio (que crearemos en breve)

import { getSlotsByRange } from "../../services/reservationService";

const STUDENT_NAV = [
  { label: "Inicio",    path: "/student/dashboard" },
  { label: "Horario",   path: "/student/schedule"  },
  { label: "Clases",    path: "/student/classes"   },
  { label: "Mensajes",  path: "/student/messages"  },
];

// 2. AGREGA ESTOS ESTADOS JUSTO DEBAJO DE TUS OTROS ESTADOS
  
  const StudentScheduleView = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const today     = new Date();


  // 1. ── TUS ESTADOS ORIGINALES (Aquí creamos activeTeacher) ──
  const [search,          setSearch]          = useState("");
  const [activeFilter,    setActiveFilter]    = useState("Mensual");
  const [currentYear,     setCurrentYear]     = useState(today.getFullYear());
  const [currentMonth,    setCurrentMonth]    = useState(today.getMonth());
  const [weekStart,       setWeekStart]       = useState(getWeekStart(today));
  const [currentDay,      setCurrentDay]      = useState(today);
  const [selectedTeacher, setSelectedTeacher] = useState(location.state?.teacher ?? null);
  const [activeTeacher,   setActiveTeacher]   = useState(location.state?.teacher ?? null);
  const [bookingSlot,     setBookingSlot]     = useState(null);

  // 2. ── NUEVOS ESTADOS PARA EL BACKEND ──
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [errorTeachers, setErrorTeachers] = useState(null);
  
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // 3. ── EFECTO PARA CARGAR LA LISTA DE PROFESORES ──
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const response = await teacherService.getTeachers();
        
        const mappedTeachers = response.data.map(t => ({
          id: t.id,
          name: t.fullName, 
          rating: t.averageRating ?? 0,
          classes: t.completedClasses ?? 0, 
          hourlyRate: t.hourlyRate ?? 25, 
          avatar: t.profilePicture || "https://i.pravatar.cc/150?u=" + t.id, 
          bio: t.professionalDescription ?? "Sin descripción profesional.",
          education: t.certifications ?? "No especificada",
          experience: t.yearsOfExperience ? `${t.yearsOfExperience} años de experiencia` : "Experiencia no especificada",
        }));

        setTeachers(mappedTeachers);
      } catch (err) {
        console.error("Error al traer los profesores:", err);
        setErrorTeachers("Hubo un problema al cargar la lista de profesores.");
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  // 4. ── EFECTO PARA TRAER HORARIOS DEL PROFESOR ACTIVO ──
  useEffect(() => {
    // Como esto está debajo de la línea 15, activeTeacher ya existe y no dará error
    if (!activeTeacher) {
      setSchedules([]);
      return;
    }

    const fetchTeacherSchedules = async () => {
      try {
        setLoadingSchedules(true);
        const today = new Date();
        const response = await getSlotsByRange(
          `${today.getFullYear()}-01-01`, 
          `${today.getFullYear() + 1}-12-31`, 
          activeTeacher.id
        );
        
        const mappedSchedules = response.data.map(slot => ({
          id: slot.slotId, 
          date: slot.slotDate,         
          start: slot.startTime,   
          end: slot.endTime,       
          type: "Disponible"
        }));

        setSchedules(mappedSchedules);
      } catch (err) {
        console.error("Error al cargar horarios:", err);
        setSchedules([]); 
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchTeacherSchedules();
  }, [activeTeacher]);
  // ── Navegación mensual, semanal y diaria (Se mantienen igual) ──
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };
  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
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
    // Cambiamos MOCK_SCHEDULES por schedules 👇
    const slot = schedules.find((s) => s.date === dateStr && s.type === "Disponible");
    if (slot) setBookingSlot(slot);
  };

  // ── Filtramos la lista REAL de profesores ────────────────────
  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  
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

            {/* ... (El resto de la Toolbar de filtros y leyenda se mantiene igual) ... */}
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
                schedules={schedules}
                currentYear={currentYear}
                currentMonth={currentMonth}
                onPrev={prevMonth}
                onNext={nextMonth}
                onDayClick={handleDayClick}
              />
            )}
            {activeFilter === "Semanal" && (
              <WeeklyView
                schedules={schedules}
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
                schedules={schedules}
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
              {/* Manejo de estados de carga y error */}
              {loadingTeachers ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando profesores...</div>
              ) : errorTeachers ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{errorTeachers}</div>
              ) : (
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
              )}
            </div>
          </>
        )}

      </main>

      {/* ── Modales se mantienen igual ── */}
      {selectedTeacher && (
        <TeacherProfileModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onViewSchedule={handleSelectTeacher}
        />
      )}

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