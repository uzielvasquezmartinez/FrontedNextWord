import { getDaysInMonth, getFirstDayOfMonth, DAYS_OF_WEEK, MONTHS } from "./scheduleHelpers";
import styles from "./Schedule.module.css";

const MonthlyView = ({ schedules, currentYear, currentMonth, onPrev, onNext, onDayClick }) => {
  const daysInMonth  = getDaysInMonth(currentYear, currentMonth);
  const firstDaySlot = getFirstDayOfMonth(currentYear, currentMonth);

  const getSchedulesForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return schedules.filter((s) => s.date === dateStr);
  };

  return (
    <div className={styles.calendarCard}>
      <div className={styles.calendarNav}>
        <button className={styles.navBtn} onClick={onPrev}>‹ Anterior</button>
        <h2 className={styles.calendarTitle}>{MONTHS[currentMonth]} {currentYear}</h2>
        <button className={styles.navBtn} onClick={onNext}>Siguiente ›</button>
      </div>
      <div className={styles.calendarGrid}>
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className={styles.calendarDayHeader}>{d}</div>
        ))}
        {Array.from({ length: firstDaySlot }).map((_, i) => (
          <div key={`e-${i}`} className={styles.calendarCell} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const daySchedules = getSchedulesForDay(day);
          const hasReserved  = daySchedules.some((s) => s.type === "Reservado");
          const hasAvailable = daySchedules.some((s) => s.type === "Disponible");
          return (
            <div
              key={day}
              className={`${styles.calendarCell} ${styles.calendarCellDay} ${
                hasReserved  ? styles.cellReserved  : ""
              } ${
                hasAvailable && !hasReserved ? styles.cellAvailable : ""
              }`}
              onClick={() => onDayClick?.({ day, currentYear, currentMonth })}
            >
              <span className={styles.calendarDayNum}>{day}</span>
              {daySchedules.map((s, i) => (
                <span
                  key={i}
                  className={`${styles.calendarEvent} ${
                    s.type === "Reservado" ? styles.calendarEventReserved : styles.calendarEventAvailable
                  }`}
                >
                  {s.start}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyView;