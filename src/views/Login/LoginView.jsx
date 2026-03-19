import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NextWordLogo from "../../components/NextWordLogo/NextWordLogo";
import styles from "./LoginView.module.css";

const LoginView = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
      setLoading(false);
    }
    
  };

  return (
    <div className={styles.layout}>

      <aside className={styles.branding}>
        <div className={styles.brandingContent}>
<h1 className={styles.welcome}>Transforma tu futuro dominando el ingles
hoy </h1>
          <NextWordLogo />


          <p className={styles.tagline}>
  
            Transforma tu aprendizaje con clases personalizadas
            y profesores expertos
          </p>

        </div>
      </aside>

      <main className={styles.formSide}>
        <div className={styles.formContainer}>

          <h1 className={styles.title}>INICIO SESIÓN</h1>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>


            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {/* Fila: Recordarme + ¿Olvidaste tu contraseña? */}
            <div className={styles.rowOptions}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Recordarme
              </label>
           <button
  type="button"
  className={styles.forgotLink}
  onClick={() => navigate("/forgot-password")}
>
  ¿Olvidaste tu contraseña?
</button>
            </div>

            {error && (
              <p className={styles.errorMessage} role="alert">
                {error}
              </p>
            )}

            {/* Botón principal */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>

          </form>

        <p className={styles.registerText}>
  ¿No tienes una cuenta?{" "}
  <button
    type="button"
    className={styles.registerLink}
    onClick={() => navigate("/register")}
  >
    Registrarse
  </button>
</p>

        </div>
      </main>

    </div>
  );
};

export default LoginView;
