import { HOURS, formatDayTitle } from "./scheduleHelpers";
import styles from "./Schedule.module.css";

const DailyView = ({ schedules, currentDay, onPrev, onNext, onSlotClick }) => {
  const dateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth()+1).padStart(2,"0")}-${String(currentDay.getDate()).padStart(2,"0")}`;
  const daySchedules = schedules.filter((s) => s.date === dateStr);

  const reserved  = daySchedules.filter((s) => s.type === "Reservado").length;
  const available = daySchedules.filter((s) => s.type === "Disponible").length;
  const minutes   = daySchedules.filter((s) => s.type === "Reservado").reduce((acc, s) => acc + (s.minutes ?? 60), 0);

  const getSlotForHour = (hour) => daySchedules.find((s) => s.start === hour);

  return (
    <div className={styles.calendarCard}>
      <div className={styles.calendarNav}>
        <button className={styles.navBtn} onClick={onPrev}>‹ Anterior</button>
        <h2 className={styles.calendarTitle}>{formatDayTitle(currentDay)}</h2>
        <button className={styles.navBtn} onClick={onNext}>Siguiente ›</button>
      </div>

      <div className={styles.dailyKpis}>
        <div className={styles.dailyKpiCard}>
          <span className={styles.dailyKpiValue}>{reserved}</span>
          <span className={styles.dailyKpiLabel}>Clases Reservadas</span>
        </div>
        <div className={styles.dailyKpiCard}>
          <span className={styles.dailyKpiValue}>{available}</span>
          <span className={styles.dailyKpiLabel}>Horarios Disponibles</span>
        </div>
        <div className={styles.dailyKpiCard}>
          <span className={styles.dailyKpiValue}>{minutes}</span>
          <span className={styles.dailyKpiLabel}>Minutos de Clases</span>
        </div>
      </div>

      <div className={styles.dailyList}>
        {HOURS.map((hour) => {
          const slot = getSlotForHour(hour);
          return (
            <div
              key={hour}
              className={`${styles.dailySlot} ${
                slot?.type === "Reservado"  ? styles.dailySlotReserved  : ""
              } ${
                slot?.type === "Disponible" ? styles.dailySlotAvailable : ""
              } ${
                !slot ? styles.dailySlotEmpty : ""
              }`}
              onClick={() => onSlotClick?.({ hour, slot })}
            >
              <span className={styles.dailySlotHour}>{hour}</span>
              <span className={styles.dailySlotLabel}>
                {slot ? slot.label : ""}
                {slot?.type === "Reservado" && slot.minutes && (
                  <span className={styles.dailySlotMinutes}> +{slot.minutes} Minutos</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyView;