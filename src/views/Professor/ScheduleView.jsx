import { useState } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import MonthlyView  from "../../components/Schedule/MonthlyView";
import WeeklyView   from "../../components/Schedule/WeeklyView";
import DailyView    from "../../components/Schedule/DailyView";
import ScheduleModal from "../../components/Schedule/ScheduleModal";
import { TEACHER_NAV, MOCK_SCHEDULES, getWeekStart } from "../../components/Schedule/scheduleHelpers";
import styles from "./ScheduleView.module.css";

const ScheduleView = () => {
  const today = new Date();

  const [activeFilter, setActiveFilter] = useState("Mensual");
  const [showModal,    setShowModal]    = useState(false);
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [weekStart,    setWeekStart]    = useState(getWeekStart(today));
  const [currentDay,   setCurrentDay]   = useState(today);
  const [schedules]                     = useState(MOCK_SCHEDULES);

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); } else setCurrentMonth((m) => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); } else setCurrentMonth((m) => m + 1); };
  const prevWeek  = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek  = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const prevDay   = () => { const d = new Date(currentDay); d.setDate(d.getDate() - 1); setCurrentDay(d); };
  const nextDay   = () => { const d = new Date(currentDay); d.setDate(d.getDate() + 1); setCurrentDay(d); };

  const handleSave = (newSchedule) => {
    console.log("Horario guardado:", newSchedule);
    setShowModal(false);
  };

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={TEACHER_NAV} activeItem="Horario" />

      <main className={styles.main}>

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <span className={styles.filterLabel}>FILTRO:</span>
            {["Mensual","Semanal","Diaria"].map((f) => (
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
