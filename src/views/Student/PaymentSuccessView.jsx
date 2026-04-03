import { useLocation, useNavigate } from "react-router-dom";
import GradientPage from "../../components/UI/GradientPage/GradientPage";
import Button from "../../components/UI/Button/Button";
import styles from "./PaymentResultView.module.css";

const PaymentSuccessView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teacher, slot } = location.state ?? {};

  return (
    <GradientPage>
      <div className={styles.card}>
        <div className={styles.iconSuccess}>✓</div>
        <h2 className={styles.title}>¡Pago Exitoso!</h2>
        <p className={styles.subtitle}>
          Tu clase ha sido reservada correctamente.
        </p>
        {teacher && slot && (
          <div className={styles.summary}>
            <p><strong>{teacher.name}</strong></p>
            <p>{slot.date} · {slot.start} - {slot.end}</p>
          </div>
        )}
        <Button variant="primary" fullWidth onClick={() => navigate("/student/dashboard")}>
          Ir al Dashboard
        </Button>
      </div>
    </GradientPage>
  );
};

export default PaymentSuccessView;