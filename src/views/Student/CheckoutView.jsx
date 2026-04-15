import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { bookSlot } from "../../services/reservationService";
import userService from "../../services/userService";
import GradientPage from "../../components/UI/GradientPage/GradientPage";
import Button from "../../components/UI/Button/Button";
import { IconCalendar, IconClock } from "../../components/Icons/Icons";
import styles from "./CheckoutView.module.css";

const CheckoutView = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subject, setSubject] = useState("");
  const [realBalance, setRealBalance] = useState(null);

  const { slot, teacher } = location.state ?? {};

  useEffect(() => {
    const fetchFreshBalance = async () => {
      try {
        const response = await userService.getStudentProfile();
        setRealBalance(response.data?.walletBalance ?? user?.walletBalance ?? 0);
      } catch (err) {
        console.error("Error al obtener saldo actualizado", err);
        setRealBalance(user?.walletBalance || 0);
      }
    };

    if (user?.id) {
      fetchFreshBalance();
    }
  }, [user]);

  if (!slot || !teacher) {
    setTimeout(() => navigate("/student/schedule"), 0);
    return null;
  }

  const slotId = slot?.id ?? slot?.slotId;
  const userBalance = realBalance !== null ? realBalance : (user?.walletBalance || 0);
  const classPrice = Number(teacher?.hourlyRate ?? 50);
  const hasEnoughFunds = userBalance >= classPrice;

  const handleConfirmReservation = async () => {
    if (!user?.id) {
      setError("No se encontro el usuario autenticado. Inicia sesion nuevamente.");
      return;
    }

    if (!slotId) {
      setError("No se encontro el horario a reservar. Vuelve a seleccionar un espacio.");
      return;
    }

    if (!hasEnoughFunds) {
      setError("No tienes saldo suficiente para realizar esta reserva.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await bookSlot(user.id, slotId, subject);
      await refreshUser();

      navigate("/student/payment/success", { state: { slot, teacher } });
    } catch (err) {
      console.error("Error al confirmar reserva:", err);
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Hubo un problema al procesar tu reserva. Intenta de nuevo."
      );
    } finally {
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

        <div className={styles.teacherRow}>
          <img className={styles.teacherAvatar} src={teacher.avatar} alt={teacher.name} />
          <div>
            <span className={styles.teacherName}>{teacher.name}</span>
            <span className={styles.teacherRate}>{teacher.hourlyRate} creditos/hr</span>
          </div>
        </div>

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

        <div className={styles.conceptSection}>
          <label className={styles.detailLabel}>Concepto de la clase (Opcional)</label>
          <textarea
            className={styles.conceptInput}
            placeholder='Ej: "Ayuda con entrevista de trabajo", "Practica de conversacion"'
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            rows={2}
          />
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Tu saldo actual</span>
            <span className={userBalance < classPrice ? styles.insufficient : ""}>
              {Number(userBalance).toFixed(2)} creditos
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span>Costo de la clase</span>
            <span>{classPrice.toFixed(2)} creditos</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total a descontar</span>
            <span>{classPrice.toFixed(2)} creditos</span>
          </div>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.actions}>
          <Button
            variant="primary"
            fullWidth
            onClick={handleConfirmReservation}
            loading={loading}
            disabled={loading || !hasEnoughFunds}
          >
            {hasEnoughFunds ? "Confirmar Reserva" : "Saldo Insuficiente"}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate(-1)} disabled={loading}>
            Cancelar
          </Button>
        </div>

        <p className={styles.secureNote}>Esta reserva se descontara de tus creditos disponibles</p>
      </div>
    </GradientPage>
  );
};

export default CheckoutView;
