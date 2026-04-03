import Button from "../../UI/Button/Button";
import { IconCalendar, IconClock } from "../../Icons/Icons";
import styles from "./BookingConfirmModal.module.css";

const BookingConfirmModal = ({ slot, teacher, onConfirm, onClose }) => {
  if (!slot || !teacher) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <h3 className={styles.title}>Confirmar Reserva</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>

          {/* Info del profesor */}
          <div className={styles.teacherRow}>
            <img
              className={styles.teacherAvatar}
              src={teacher.avatar}
              alt={teacher.name}
            />
            <div>
              <span className={styles.teacherName}>{teacher.name}</span>
              <span className={styles.teacherPrice}>${teacher.hourlyRate}/hr</span>
            </div>
          </div>

          {/* Detalles del horario */}
          <div className={styles.slotDetails}>
            <div className={styles.slotRow}>
              <span className={styles.slotIcon}><IconCalendar /></span>
              <div>
                <span className={styles.slotLabel}>Fecha</span>
                <span className={styles.slotValue}>{slot.date}</span>
              </div>
            </div>
            <div className={styles.slotRow}>
              <span className={styles.slotIcon}><IconClock /></span>
              <div>
                <span className={styles.slotLabel}>Horario</span>
                <span className={styles.slotValue}>{slot.start} - {slot.end}</span>
              </div>
            </div>
          </div>

          {/* Resumen de pago */}
          <div className={styles.paymentSummary}>
            <div className={styles.paymentRow}>
              <span>Clase de 1 hora</span>
              <span>${teacher.hourlyRate}</span>
            </div>
            <div className={styles.paymentRow}>
              <span>Comisión de servicio</span>
              <span>$0</span>
            </div>
            <div className={`${styles.paymentRow} ${styles.paymentTotal}`}>
              <span>Total</span>
              <span>${teacher.hourlyRate}</span>
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => onConfirm({ slot, teacher })}>
            Confirmar y Pagar
          </Button>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmModal;