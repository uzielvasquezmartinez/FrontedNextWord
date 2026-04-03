import { useNavigate } from "react-router-dom";
import GradientPage from "../../components/UI/GradientPage/GradientPage";
import Button from "../../components/UI/Button/Button";
import styles from "./PaymentResultView.module.css";

const PaymentFailureView = () => {
  const navigate = useNavigate();

  return (
    <GradientPage>
      <div className={styles.card}>
        <div className={styles.iconFailure}>✕</div>
        <h2 className={styles.title}>Pago Fallido</h2>
        <p className={styles.subtitle}>
          Ocurrió un error al procesar tu pago. Por favor intenta de nuevo.
        </p>
        <Button variant="primary" fullWidth onClick={() => navigate(-1)}>
          Intentar de nuevo
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate("/student/dashboard")}>
          Ir al Dashboard
        </Button>
      </div>
    </GradientPage>
  );
};

export default PaymentFailureView;