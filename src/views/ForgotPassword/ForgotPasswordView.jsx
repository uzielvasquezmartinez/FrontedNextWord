import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GradientPage from "../../components/UI/GradientPage/GradientPage";
import PageCard from "../../components/UI/PageCard/PageCard";
import { IconMail } from "../../components/Icons/Icons";
import styles from "./ForgotPasswordView.module.css";

const ForgotPasswordView = () => {
  const navigate          = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Por favor ingresa tu correo electrónico."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Ingresa un correo electrónico válido."); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate("/verify-code", { state: { email } });
  };

  return (
    <GradientPage>
      <PageCard>

        <div className={styles.iconWrapper}>
          <IconMail />
        </div>

        <h1 className={styles.title}>¿Olvidaste tu contraseña?</h1>
        <p className={styles.subtitle}>
          Ingresa tu correo electrónico y te enviaremos un código de verificación
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Correo Electrónico</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><IconMail /></span>
              <input
                type="email"
                className={styles.input}
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                autoComplete="email"
              />
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? "Enviando..." : "Enviar Código de Verificación"}
          </button>
        </form>

        <button className={styles.backLink} onClick={() => navigate("/login")}>
          ← Volver al inicio
        </button>

      </PageCard>
    </GradientPage>
  );
};

export default ForgotPasswordView;