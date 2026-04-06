import { DAYS_OF_WEEK, HOURS, formatWeekRange } from "./scheduleHelpers";
import styles from "./Schedule.module.css";
import React from "react";



const WeeklyView = ({ schedules, weekStart, onPrev, onNext, onCellClick }) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getScheduleForCell = (date, hour) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    return schedules.find((s) => s.date === dateStr && s.start === hour);
  };

  return (
    <div className={styles.calendarCard}>
      <div className={styles.calendarNav}>
        <button className={styles.navBtn} onClick={onPrev}>‹ Anterior</button>
        <h2 className={styles.calendarTitle}>{formatWeekRange(weekStart)}</h2>
        <button className={styles.navBtn} onClick={onNext}>Siguiente ›</button>
      </div>
      <div className={styles.weekGrid}>
        <div className={styles.weekTimeHeader} />
        {weekDays.map((d, i) => (
          <div key={i} className={styles.weekDayHeader}>
            <span className={styles.weekDayLabel}>{DAYS_OF_WEEK[i]}</span>
            <span className={styles.weekDayNum}>{d.getDate()}</span>
          </div>
        ))}
     {HOURS.map((hour) => (
  <React.Fragment key={hour}>
    <div className={styles.weekHourLabel}>{hour}</div>
            {weekDays.map((d, i) => {
              const s = getScheduleForCell(d, hour);
              return (
                <div
                  key={`${i}-${hour}`}
                  className={`${styles.weekCell} ${
                    s?.type === "Reservado"  ? styles.weekCellReserved  : ""
                  } ${
                    s?.type === "Disponible" ? styles.weekCellAvailable : ""
                  }`}
                  onClick={() => onCellClick?.({ date: d, hour, schedule: s })}
                >
                  {s && <span className={styles.weekCellLabel}>{s.label}</span>}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeeklyView;