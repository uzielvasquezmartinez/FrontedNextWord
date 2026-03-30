import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GradientPage from "../../components/UI/GradientPage/GradientPage";
import PageCard from "../../components/UI/PageCard/PageCard";
import { IconShield } from "../../components/Icons/Icons";
import styles from "./VerifyCodeView.module.css";

const DIGITS = 6;

const VerifyCodeView = () => {
  const navigate           = useNavigate();
  const location           = useLocation();
  const { forgotPassword } = useAuth();
  const email              = location.state?.email ?? "";
  const inputsRef          = useRef([]);

  const [code,    setCode]    = useState(Array(DIGITS).fill(""));
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [resent,  setResent]  = useState(false);

  useEffect(() => { inputsRef.current[0]?.focus(); }, []);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");
    if (value && index < DIGITS - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITS);
    if (pasted.length === DIGITS) {
      setCode(pasted.split(""));
      inputsRef.current[DIGITS - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < DIGITS) {
      setError("Por favor ingresa el código completo de 6 dígitos.");
      return;
    }
    setLoading(true);
    // El código es válido, navega a reset password
    // La verificación real la hace el backend en /resetPassword
    setLoading(false);
    navigate("/reset-password", { state: { email, token: fullCode } });
  };

  const handleResend = async () => {
    setResent(true);
    setCode(Array(DIGITS).fill(""));
    inputsRef.current[0]?.focus();
    await forgotPassword(email);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <GradientPage>
      <PageCard>
        <button className={styles.backBtn} onClick={() => navigate("/forgot-password")}>←</button>
        <div className={styles.iconWrapper}>
          <IconShield />
        </div>
        <h1 className={styles.title}>Verificar Código</h1>
        <p className={styles.subtitle}>
          Ingresa el código de 6 dígitos que enviamos a{" "}
          <strong>{email || "tu correo"}</strong>
        </p>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.codeInputs} onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`${styles.digitInput} ${digit ? styles.digitInputFilled : ""} ${error ? styles.digitInputError : ""}`}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>
          {error && <span className={styles.errorText}>{error}</span>}
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? "Verificando..." : "Verificar Código"}
          </button>
        </form>
        <button className={styles.resendBtn} onClick={handleResend} disabled={resent}>
          {resent ? "✓ Código reenviado" : "Reenviar Código"}
        </button>
      </PageCard>
    </GradientPage>
  );
};

export default VerifyCodeView;