// src/views/Register/RegisterView.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NextWordLogo from "../../components/NextWordLogo/NextWordLogo";
import { IconEyeOpen, IconEyeClosed } from "../../components/Icons/Icons";
import TutorModal from "./TutorModal";
import { calcularEdad, validarFormulario, getMaxBirthDate } from "./registerValidations";
import styles from "./RegisterView.module.css";

const RegisterView = () => {
  const navigate            = useNavigate();
  const { registerStudent } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "", email: "", birthDate: "",  phoneNumber:"",password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors]                           = useState({});
  const [globalError, setGlobalError]                 = useState("");
  const [loading, setLoading]                         = useState(false);
  const [showTutorModal, setShowTutorModal]           = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGlobalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validarFormulario(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const edad = calcularEdad(formData.birthDate);
    if (edad < 18) {
      setShowTutorModal(true);
      return;
    }

    await registrar(formData, null);
  };

  const handleTutorConfirm = async (tutorData) => {
    setShowTutorModal(false);
    await registrar(formData, tutorData);
  };

  const registrar = async (student, tutor) => {
    setLoading(true);
    setGlobalError("");

    const body = {
      email:       student.email,
      password:    student.password,
      fullname:    student.fullName,
      dateOfBirth: student.birthDate,
     phoneNumber: student.phoneNumber,
      ...(tutor && {
        tutorName:  tutor.tutorName,
        tutorEmail: tutor.tutorEmail,
        tutorPhone: tutor.tutorPhone,
      }),
    };

    const result = await registerStudent(body);
    setLoading(false);

    if (!result.success) {
      setGlobalError(result.message);
      return;
    }

navigate("/verify-code", { state: { email: student.email, mode: "register" } });
  };

  return (
    <div className={styles.layout}>

      <aside className={styles.branding}>
        <div className={styles.brandingContent}>
          <NextWordLogo size="md" />
          <p className={styles.tagline}>
            Transforma tu aprendizaje con clases personalizadas y profesores expertos
          </p>
          <ul className={styles.featureList}>
            <li>Profesores certificados y experimentados</li>
            <li>Horarios flexibles adaptados a ti</li>
            <li>Comunidad de aprendizaje activa</li>
          </ul>
        </div>
      </aside>

      <main className={styles.formSide}>
        <div className={styles.formContainer}>

          <div className={styles.formHeader}>
            <h1 className={styles.title}>Registro de Usuarios</h1>
            <p className={styles.subtitle}>Crea tu cuenta para comenzar a aprender</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>INFORMACIÓN PERSONAL</legend>

              <div className={styles.row2col}>
                <div className={styles.field}>
                  <label htmlFor="fullName" className={styles.label}>
                    Nombre Completo<span className={styles.required}>*</span>
                  </label>
                  <input id="fullName" name="fullName" type="text"
                    className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
                    value={formData.fullName} onChange={handleChange} autoComplete="name" />
                  {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>
                    Email<span className={styles.required}>*</span>
                  </label>
                  <input id="email" name="email" type="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    value={formData.email} onChange={handleChange} autoComplete="email" />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>
              </div>

                      <div className={styles.field}>
  <label htmlFor="phoneNumber" className={styles.label}>
    Teléfono<span className={styles.required}>*</span>
  </label>
  <input
    id="phoneNumber"
    name="phoneNumber"
    type="tel"
    placeholder="10 dígitos"
    className={`${styles.input} ${errors.phoneNumber ? styles.inputError : ""}`}
    value={formData.phoneNumber}
    onChange={handleChange}
  />
  {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
</div>

              <div className={styles.field}>
                <label htmlFor="birthDate" className={styles.label}>
                  Fecha Nacimiento<span className={styles.required}>*</span>
                </label>
                <input id="birthDate" name="birthDate" type="date"
                  className={`${styles.input} ${styles.inputDate} ${errors.birthDate ? styles.inputError : ""}`}
                  value={formData.birthDate} onChange={handleChange}
                  min="1900-01-01"
                  max={getMaxBirthDate()} />
                {errors.birthDate && <span className={styles.errorText}>{errors.birthDate}</span>}
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>SEGURIDAD</legend>

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>
                  Contraseña<span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input id="password" name="password"
                    type={showPassword ? "text" : "password"}
                    className={`${styles.input} ${styles.inputWithIcon} ${errors.password ? styles.inputError : ""}`}
                    value={formData.password} onChange={handleChange} autoComplete="new-password" />
                  <button type="button" className={styles.eyeButton}
                    onClick={() => setShowPassword((p) => !p)}>
                    {showPassword ? <IconEyeClosed /> : <IconEyeOpen />}
                  </button>
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirmar Contraseña<span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input id="confirmPassword" name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${styles.input} ${styles.inputWithIcon} ${errors.confirmPassword ? styles.inputError : ""}`}
                    value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                  <button type="button" className={styles.eyeButton}
                    onClick={() => setShowConfirmPassword((p) => !p)}>
                    {showConfirmPassword ? <IconEyeClosed /> : <IconEyeOpen />}
                  </button>
                </div>
                {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
              </div>
            </fieldset>

          {globalError && (
  <p className={styles.errorText} role="alert" style={{ textAlign: "center" }}>
    {globalError}
  </p>
)}
            <div className={styles.buttonRow}>
              <button type="button" className={styles.cancelButton} onClick={() => navigate("/login")}>
                Cancelar
              </button>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </div>

          </form>
        </div>
      </main>

      {showTutorModal && (
        <TutorModal
          onConfirm={handleTutorConfirm}
          onClose={() => setShowTutorModal(false)}
        />
      )}

    </div>
  );
};

export default RegisterView;
