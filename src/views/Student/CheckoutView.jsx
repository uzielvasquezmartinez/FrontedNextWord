import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { bookSlot } from "../../services/reservationService";
import GradientPage from "../../components/UI/GradientPage/GradientPage";
import Button from "../../components/UI/Button/Button";
import { IconCalendar, IconClock } from "../../components/Icons/Icons";
import styles from "./CheckoutView.module.css";

const CheckoutView = () => {
  const { user } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { slot, teacher } = location.state ?? {};

  // Redirige al horario si falta información esencial
  if (!slot || !teacher) {
    setTimeout(() => navigate("/student/schedule"), 0);
    return null;
  }

  const classPrice = teacher?.hourlyRate || 50; // Usar el precio del profesor o 50 por defecto
  const userBalance = user?.walletBalance || 0;
  const hasEnoughFunds = userBalance >= classPrice;

  const handleConfirmReservation = async () => {
    if (!hasEnoughFunds) {
      setError("No tienes saldo suficiente para realizar esta reserva.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Llamada real al backend para reservar el slot
      // Se asume que slot.id es el identificador del espacio
      await bookSlot(user.id, slot.id);
      
      setLoading(false);
      navigate("/student/payment/success", { state: { slot, teacher } });
    } catch (err) {
      console.error("Error al confirmar reserva:", err);
      setError(err.response?.data?.message || err.response?.data || "Hubo un problema al procesar tu reserva. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <GradientPage>
      <div className={styles.card}>

        <div className={styles.header}>
          <h2 className={styles.title}>Resumen de Reserva</h2>
          <p className={styles.subtitle}>Revisa los detalles antes de confirmar</p>
        </div>

        {/* Info del profesor */}
        <div className={styles.teacherRow}>
          <img
            className={styles.teacherAvatar}
            src={teacher.avatar}
            alt={teacher.name}
          />
          <div>
            <span className={styles.teacherName}>{teacher.name}</span>
            <span className={styles.teacherRate}>${teacher.hourlyRate}/hr</span>
          </div>
        </div>

        {/* Detalles */}
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailIcon}><IconCalendar /></span>
            <div>
              <span className={styles.detailLabel}>Fecha</span>
              <span className={styles.detailValue}>{slot.date}</span>
            </div>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailIcon}><IconClock /></span>
            <div>
              <span className={styles.detailLabel}>Horario</span>
              <span className={styles.detailValue}>{slot.start} - {slot.end}</span>
            </div>
          </div>
        </div>

        {/* Resumen de costos */}
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Tu saldo actual</span>
            <span className={userBalance < classPrice ? styles.insufficient : ""}>
              ${userBalance.toFixed(2)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span>Costo de la clase</span>
            <span>${classPrice.toFixed(2)}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total a descontar</span>
            <span>${classPrice.toFixed(2)}</span>
          </div>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        {/* Botones */}
        <div className={styles.actions}>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleConfirmReservation} 
            loading={loading}
            disabled={!hasEnoughFunds}
          >
            {hasEnoughFunds ? "Confirmar Reserva" : "Saldo Insuficiente"}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate(-1)} disabled={loading}>
            Cancelar
          </Button>
        </div>

        <p className={styles.secureNote}>ℹ️ Esta reserva se descontará de tu saldo disponible ($)</p>

      </div>
    </GradientPage>
  );
};

export default CheckoutView;