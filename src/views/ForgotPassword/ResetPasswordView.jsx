import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GradientPage from "../../components/UI/GradientPage/GradientPage";
import PageCard from "../../components/UI/PageCard/PageCard";
import { IconLock, IconEyeOpen, IconEyeClosed } from "../../components/Icons/Icons";
import styles from "./ResetPasswordView.module.css";

const ResetPasswordView = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = location.state?.token ?? "";
  const email     = location.state?.email ?? "";

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [errors,          setErrors]          = useState({});
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);

  const validate = () => {
    const e = {};
    if (!password)               e.password = "La contraseña es requerida.";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres.";
    if (!confirmPassword)        e.confirmPassword = "Confirma tu contraseña.";
    else if (password !== confirmPassword) e.confirmPassword = "Las contraseñas no coinciden.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  if (success) {
    return (
      <GradientPage>
        <PageCard>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title}>¡Contraseña actualizada!</h1>
          <p className={styles.subtitle}>
            Tu contraseña ha sido actualizada correctamente. Redirigiendo al inicio de sesión...
          </p>
        </PageCard>
      </GradientPage>
    );
  }

  return (
    <GradientPage>
      <PageCard>

        <button className={styles.backBtn} onClick={() => navigate("/verify-code", { state: { email } })}>
          ←
        </button>

        <div className={styles.iconWrapper}>
          <IconLock />
        </div>

        <h1 className={styles.title}>Nueva Contraseña</h1>
        <p className={styles.subtitle}>
          Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          <div className={styles.field}>
            <label className={styles.label}>Nueva Contraseña</label>
            <div className={`${styles.inputWrapper} ${errors.password ? styles.inputWrapperError : ""}`}>
              <span className={styles.inputIcon}><IconLock /></span>
              <input
                type={showPass ? "text" : "password"}
                className={styles.input}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((p) => !p)}>
                {showPass ? <IconEyeClosed /> : <IconEyeOpen />}
              </button>
            </div>
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirmar Contraseña</label>
            <div className={`${styles.inputWrapper} ${errors.confirmPassword ? styles.inputWrapperError : ""}`}>
              <span className={styles.inputIcon}><IconLock /></span>
              <input
                type={showConfirm ? "text" : "password"}
                className={styles.input}
                placeholder="Repite tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm((p) => !p)}>
                {showConfirm ? <IconEyeClosed /> : <IconEyeOpen />}
              </button>
            </div>
            {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </button>

        </form>

      </PageCard>
    </GradientPage>
  );
};

export default ResetPasswordView;