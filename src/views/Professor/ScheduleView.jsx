// src/views/Professor/ScheduleView.jsx
import { useState, useEffect } from "react";
import AppNavbar      from "../../components/AppNavbar/AppNavbar";
import MonthlyView    from "../../components/Schedule/MonthlyView";
import WeeklyView     from "../../components/Schedule/WeeklyView";
import DailyView      from "../../components/Schedule/DailyView";
import ScheduleModal  from "../../components/Schedule/ScheduleModal";
import { TEACHER_NAV, getWeekStart } from "../../components/Schedule/scheduleHelpers";
import { useAuth }    from "../../context/AuthContext";
import { createSlot, getTeacherAgenda, getAvailableSlots } from "../../services/reservationService";
import styles from "./ScheduleView.module.css";

// ── Convierte ReservationResponseDto al formato que usan las vistas ──
const mapAgendaToSchedules = (agenda) =>
  agenda.map((item) => ({
    date:     item.date,           // LocalDate → "YYYY-MM-DD"
    start:    item.startTime,      // "HH:mm"
    end:      item.endTime,        // "HH:mm"
    type:     item.status === "PENDING" ? "Reservado" : item.status === "COMPLETED" ? "Completado" : "Disponible",
    label:    item.classType ?? "Clase",
    meetLink: item.meetLink ?? null,
    reservationId: item.reservationId,
    participantName: item.participantName,
  }));

const ScheduleView = () => {
  const { user }    = useAuth();
  const today       = new Date();

  const [activeFilter, setActiveFilter] = useState("Mensual");
  const [showModal,    setShowModal]    = useState(false);
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [weekStart,    setWeekStart]    = useState(getWeekStart(today));
  const [currentDay,   setCurrentDay]   = useState(today);
  const [schedules,    setSchedules]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  // ── Cargar agenda del profesor al montar ─────────────────────────
useEffect(() => {
  const fetchAgenda = async () => {
    setLoading(true);
    setError("");
    try {
      const [slotsRes, agendaRes] = await Promise.all([
        getAvailableSlots(),   // ← asegúrate de importar esto
        getTeacherAgenda(),
      ]);

      // SlotResponseDto → { slotId, teacherName, slotDate, startTime, endTime, classType }
      const slots = slotsRes.data.map((s) => ({
        date:  s.slotDate,     // ← "2026-04-06"
        start: s.startTime,    // ← "09:00"
        end:   s.endTime,
        type:  "Disponible",
        label: "Horario disponible para reservar",
        slotId: s.slotId,
      }));

      // ReservationResponseDto → { reservationId, participantName, date, startTime, endTime, classType, status, meetLink }
      const agenda = agendaRes.data.map((r) => ({
        date:  r.date,         // ← LocalDate viene como "2026-04-06"
        start: r.startTime,    // ← "09:00"
        end:   r.endTime,
        type:  "Reservado",
        label: r.classType ?? "Clase reservada",
        meetLink: r.meetLink,
        reservationId: r.reservationId,
        participantName: r.participantName,
      }));

      setSchedules([...slots, ...agenda]);

    } catch (err) {
      console.error("Error cargando agenda:", err);
      setError("No se pudo cargar la agenda.");
    } finally {
      setLoading(false);
    }
  };
  fetchAgenda();
}, []);
  // ── Navegación Mensual ───────────────────────────────────────────
  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); } else setCurrentMonth((m) => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); } else setCurrentMonth((m) => m + 1); };

  // ── Navegación Semanal ───────────────────────────────────────────
  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };

  // ── Navegación Diaria ────────────────────────────────────────────
  const prevDay = () => { const d = new Date(currentDay); d.setDate(d.getDate() - 1); setCurrentDay(d); };
  const nextDay = () => { const d = new Date(currentDay); d.setDate(d.getDate() + 1); setCurrentDay(d); };

  
const handleSave = async (newSchedule) => {
  setError("");
  try {
    const { scheduleType, selectedDays, dayOfMonth,
            startTime, endTime, duration } = newSchedule;

    const today = new Date();

    // ── Calcula las fechas según el tipo de horario ──────────────
    let dates = [];

    if (scheduleType === "Único") {
      // Un solo slot — usa la fecha actual del calendario visible
      dates = [currentDay.toISOString().split("T")[0]];

    } else if (scheduleType === "Semanal") {
      // Genera slots para los días seleccionados durante la duración
      const weeksMap = { "1 semana": 1, "2 semanas": 2, "4 semanas": 4, "8 semanas": 8, "3 meses": 13 };
      const weeks    = weeksMap[duration] ?? 4;
      const dayMap   = { "Lun": 1, "Mar": 2, "Mie": 3, "Jue": 4, "Vie": 5, "Sab": 6, "Dom": 0 };

      for (let w = 0; w < weeks; w++) {
        selectedDays.forEach((day) => {
          const d = new Date(today);
          const diff = (dayMap[day] - d.getDay() + 7) % 7 + w * 7;
          d.setDate(d.getDate() + diff);
          dates.push(d.toISOString().split("T")[0]);
        });
      }

    } else if (scheduleType === "Mensual") {
      // Genera slots para el día del mes durante la duración
      const monthsMap = { "1 mes": 1, "2 meses": 2, "3 meses": 3, "6 meses": 6 };
      const months    = monthsMap[duration] ?? 1;

      for (let m = 0; m < months; m++) {
        const d = new Date(today.getFullYear(), today.getMonth() + m, parseInt(dayOfMonth));
        if (d.getMonth() === (today.getMonth() + m) % 12) {
          dates.push(d.toISOString().split("T")[0]);
        }
      }
    }

    // ── Crea un slot por cada fecha calculada ────────────────────
    await Promise.all(
      dates.map((slotDate) =>
        createSlot({
          teacherId: user.id,
          slotDate,
          startTime,
          endTime,
          classType: "individual", // valor por defecto — ajusta si tienes selector
        })
      )
    );

    // Recargar agenda
    const res = await getTeacherAgenda();
    setSchedules(mapAgendaToSchedules(res.data));
    setShowModal(false);

  } catch (err) {
    console.error("Error creando slot:", err);
    setError(err.response?.data?.message ?? "Error al crear el horario.");
  }
};
  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={TEACHER_NAV} activeItem="Horario" />

      <main className={styles.main}>

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
          <button className={styles.btnAdd} onClick={() => setShowModal(true)}>
            + Agregar Horario
          </button>
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

        {error && (
          <p style={{ color: "red", textAlign: "center", margin: "1rem 0" }}>
            {error}
          </p>
        )}

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
            Cargando horarios...
          </p>
        ) : (
          <>
            {activeFilter === "Mensual" && (
              <MonthlyView
                schedules={schedules}
                currentYear={currentYear}
                currentMonth={currentMonth}
                onPrev={prevMonth}
                onNext={nextMonth}
              />
            )}
            {activeFilter === "Semanal" && (
              <WeeklyView
                schedules={schedules}
                weekStart={weekStart}
                onPrev={prevWeek}
                onNext={nextWeek}
              />
            )}
            {activeFilter === "Diaria" && (
              <DailyView
                schedules={schedules}
                currentDay={currentDay}
                onPrev={prevDay}
                onNext={nextDay}
              />
            )}
          </>
        )}

      </main>

      {showModal && (
        <ScheduleModal
          activeFilter={activeFilter}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ScheduleView;