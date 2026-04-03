import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import GradientPage from "../../components/UI/GradientPage/GradientPage";
import Button from "../../components/UI/Button/Button";
import { IconCalendar, IconClock } from "../../components/Icons/Icons";
import styles from "./CheckoutView.module.css";

const CheckoutView = async () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);

  const { slot, teacher } = location.state ?? {};

  // Si no hay datos redirige al horario
  if (!slot || !teacher) {
    navigate("/student/schedule");
    return null;
  }

  const handlePay = async () => {
    setLoading(true);
    // Mock — reemplazar con: paymentService.createPreference({ slot, teacher })
    // y redirigir a res.data.initPoint (URL de MercadoPago)
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    // Simula pago exitoso
    navigate("/student/payment/success", { state: { slot, teacher } });
  };
const res = await paymentService.createPreference({ slot, teacher });
window.location.href = res.data.initPoint;
  return (
    <GradientPage>
      <div className={styles.card}>

        <div className={styles.header}>
          <h2 className={styles.title}>Resumen de Pago</h2>
          <p className={styles.subtitle}>Revisa los detalles antes de pagar</p>
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

        {/* Resumen de pago */}
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Clase de 1 hora</span>
            <span>${teacher.hourlyRate}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Comisión de servicio</span>
            <span>$0</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total a pagar</span>
            <span>${teacher.hourlyRate}</span>
          </div>
        </div>

        {/* Botones */}
        <div className={styles.actions}>
          <Button variant="primary" fullWidth onClick={handlePay} disabled={loading}>
            {loading ? "Procesando..." : "Pagar con MercadoPago"}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>

        <p className={styles.secureNote}>🔒 Pago seguro procesado por MercadoPago</p>

      </div>
    </GradientPage>
  );
};

export default CheckoutView;