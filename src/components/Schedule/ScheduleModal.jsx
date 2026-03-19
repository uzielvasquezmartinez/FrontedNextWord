import { useState } from "react";
import { IconUnique, IconRecurring, IconMonthly } from "../Icons/Icons";
import { HOURS, DURATIONS_WEEK, DURATIONS_MONTH, DAYS_LABELS } from "./scheduleHelpers";
import styles from "./Schedule.module.css";

const buildPreview = ({ scheduleType, recurrenceType, dayOfMonth, selectedDays, startTime, endTime, duration }) => {
  if (!startTime || !endTime) return "";
  if (scheduleType === "Único")
    return `Agregarás disponibilidad el día seleccionado de ${startTime} a ${endTime}.`;
  if (scheduleType === "Semanal") {
    const days = selectedDays.length > 0 ? selectedDays.join(", ") : "los días seleccionados";
    return `Agregarás disponibilidad cada ${days} de ${startTime} a ${endTime} durante ${duration}.`;
  }
  if (scheduleType === "Mensual") {
    if (recurrenceType === "Día del Mes")
      return `Agregarás disponibilidad el día ${dayOfMonth} de cada mes de ${startTime} a ${endTime} durante ${duration}.`;
    return `Agregarás disponibilidad según el patrón de ${startTime} a ${endTime} durante ${duration}.`;
  }
  return "";
};

const ScheduleModal = ({ activeFilter, onClose, onSave }) => {
  const initType = activeFilter === "Diaria" ? "Único" : activeFilter === "Semanal" ? "Semanal" : "Mensual";

  const [scheduleType,   setScheduleType]   = useState(initType);
  const [recurrenceType, setRecurrenceType] = useState("Día del Mes");
  const [dayOfMonth,     setDayOfMonth]     = useState("1");
  const [selectedDays,   setSelectedDays]   = useState(["Lun","Mar","Mie","Jue","Vie"]);
  const [startTime,      setStartTime]      = useState("09:00");
  const [endTime,        setEndTime]        = useState("10:00");
  const [duration,       setDuration]       = useState("4 semanas");

  const toggleDay = (day) => setSelectedDays((prev) =>
    prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
  );

  const modal = { scheduleType, recurrenceType, dayOfMonth, selectedDays, startTime, endTime, duration };
  const preview = buildPreview(modal);
  const durations = scheduleType === "Semanal" ? DURATIONS_WEEK : DURATIONS_MONTH;

  const SCHEDULE_TYPES = [
    { label: "Único",   sub: "Un día",      icon: <IconUnique />    },
    { label: "Semanal", sub: "Cada semana", icon: <IconRecurring /> },
    { label: "Mensual", sub: "Cada mes",    icon: <IconMonthly />   },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Agregar Horarios Disponibles</h3>
            <p className={styles.modalSubtitle}>Define cuándo estarás disponible para clases</p>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalSection}>
            <label className={styles.modalLabel}>Tipo de Horario</label>
            <div className={styles.scheduleTypeGrid}>
              {SCHEDULE_TYPES.map((t) => (
                <button
                  key={t.label}
                  className={`${styles.scheduleTypeBtn} ${scheduleType === t.label ? styles.scheduleTypeBtnActive : ""}`}
                  onClick={() => setScheduleType(t.label)}
                >
                  <span className={styles.scheduleTypeIcon}>{t.icon}</span>
                  <span className={styles.scheduleTypeLabel}>{t.label}</span>
                  <span className={styles.scheduleTypeSub}>{t.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {scheduleType === "Semanal" && (
            <div className={styles.modalSection}>
              <label className={styles.modalLabel}>Días de la Semana</label>
              <div className={styles.daysGrid}>
                {DAYS_LABELS.map((day) => (
                  <button
                    key={day}
                    className={`${styles.dayBtn} ${selectedDays.includes(day) ? styles.dayBtnActive : ""}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {scheduleType === "Mensual" && (
            <div className={styles.modalSection}>
              <label className={styles.modalLabel}>Tipo de Recurrencia</label>
              <div className={styles.recurrenceToggle}>
                <button
                  className={`${styles.recurrenceBtn} ${recurrenceType === "Día del Mes" ? styles.recurrenceBtnActive : ""}`}
                  onClick={() => setRecurrenceType("Día del Mes")}
                >
                  Día del Mes
                </button>
                <button
                  className={`${styles.recurrenceBtn} ${recurrenceType === "Patrón" ? styles.recurrenceBtnActive : ""}`}
                  onClick={() => setRecurrenceType("Patrón")}
                >
                  Patrón
                </button>
              </div>
            </div>
          )}

          {scheduleType === "Mensual" && recurrenceType === "Día del Mes" && (
            <div className={styles.modalSection}>
              <label className={styles.modalLabel}>Día del Mes (1-31)</label>
              <input
                type="number" min="1" max="31"
                className={styles.modalInput}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
              />
              <span className={styles.modalHint}>Ejemplo 15 = día 15 de cada mes</span>
            </div>
          )}

          {(scheduleType === "Semanal" || scheduleType === "Mensual") && (
            <div className={styles.modalSection}>
              <label className={styles.modalLabel}>Duración</label>
              <select className={styles.modalSelect} value={duration} onChange={(e) => setDuration(e.target.value)}>
                {durations.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          )}

          <div className={styles.modalSection}>
            <label className={styles.modalLabel}>Horario</label>
            <div className={styles.timeRow}>
              <div className={styles.timeField}>
                <span className={styles.timeLabel}>Desde</span>
                <select className={styles.modalSelect} value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                  {HOURS.map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div className={styles.timeField}>
                <span className={styles.timeLabel}>Hasta</span>
                <select className={styles.modalSelect} value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                  {HOURS.map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>

          {preview && (
            <div className={styles.previewBox}>
              <span className={styles.previewLabel}>Vista Previa</span>
              <p className={styles.previewText}>{preview}</p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button className={styles.btnSave} onClick={() => onSave(modal)}>Guardar Horarios</button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;