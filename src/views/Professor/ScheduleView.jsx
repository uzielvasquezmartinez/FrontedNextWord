// src/views/Professor/ScheduleView.jsx
import { useState, useEffect } from "react";
import AppNavbar      from "../../components/AppNavbar/AppNavbar";
import MonthlyView    from "../../components/Schedule/MonthlyView";
import WeeklyView     from "../../components/Schedule/WeeklyView";
import DailyView      from "../../components/Schedule/DailyView";
import ScheduleModal  from "../../components/Schedule/ScheduleModal";
import { TEACHER_NAV, getWeekStart } from "../../components/Schedule/scheduleHelpers";
import { useAuth }    from "../../context/AuthContext";
import { createSlot, getTeacherAgenda, getSlotsByRange } from "../../services/reservationService";
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
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const start = `${currentYear}-01-01`;
      const end   = `${currentYear + 1}-12-31`;

      const [slotsRes, agendaRes] = await Promise.all([
        getSlotsByRange(start, end, user.id),
        getTeacherAgenda(),
      ]);

      const slots = slotsRes.data.map((s) => ({
        date:  s.slotDate,
        start: s.startTime,
        end:   s.endTime,
        type:  "Disponible",
        label: "Horario disponible para reservar",
        slotId: s.slotId,
      }));

      const agenda = agendaRes.data.map((r) => ({
        date:  r.date,
        start: r.startTime,
        end:   r.endTime,
        type:  "Reservado",
        label: r.topic || r.classType || "Clase",
        meetLink: r.meetLink,
        reservationId: r.reservationId,
        participantName: r.studentName || r.participantName,
      }));

      setSchedules([...slots, ...agenda]);
    } catch (err) {
      console.error("Error cargando agenda:", err);
      setError("No se pudo cargar la agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentYear, user.id]);
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
      dates = [newSchedule.selectedDate];
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
          // Usamos formato local YYYY-MM-DD para evitar desfases de UTC
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          dates.push(`${yyyy}-${mm}-${dd}`);
        });
      }

    } else if (scheduleType === "Mensual") {
      // Genera slots para el día del mes durante la duración
      const monthsMap = { "1 mes": 1, "2 meses": 2, "3 meses": 3, "6 meses": 6 };
      const months    = monthsMap[duration] ?? 1;

      for (let m = 0; m < months; m++) {
        const d = new Date(today.getFullYear(), today.getMonth() + m, parseInt(dayOfMonth));
        if (d.getMonth() === (today.getMonth() + m) % 12) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          dates.push(`${yyyy}-${mm}-${dd}`);
        }
      }
    }

    // ── Validación de tiempo pasado (Frontend) ──────────────────
    const now = new Date();
    // Usamos el formato HH:mm (5 caracteres) para coincidir con la restricción de base de datos (VARCHAR2(5))
    const formattedStartTime = startTime;
    const formattedEndTime = endTime;

    for (const dStr of dates) {
      const slotDateTime = new Date(`${dStr}T${formattedStartTime}`);
      if (slotDateTime < now) {
        setError(`No puedes programar el horario del ${dStr} a las ${startTime} porque ya ha pasado.`);
        return;
      }
    }

    // ── Crea un slot por cada fecha calculada ────────────────────
    console.log("Enviando slots:", {
      dates,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      teacherId: user.id
    });

    // ── Crea los slots uno por uno para mejor control ───────────
    for (const slotDate of dates) {
      await createSlot({
        teacherId: user.id,
        slotDate: slotDate,  // Revertido a slotDate según el DTO oficial
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        classType: "individual",
      });
    }

    // Recargar todo (Slots + Agenda)
    await fetchData();
    setShowModal(false);


  } catch (err) {
    console.error("Error creando slot:", err);
    // Intentamos extraer el mensaje amigable del backend si existe
    const backendMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data;
    const finalMessage = typeof backendMessage === 'string' ? backendMessage : "Error al crear el horario. Verifica solapamientos o fechas pasadas.";
    setError(finalMessage);
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