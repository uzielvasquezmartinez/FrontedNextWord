import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RegisterView.module.css";
import NextWordLogo from "../../components/NextWordLogo/NextWordLogo";


// ── Iconos SVG extraídos como componentes ────────────────────────
const IconEyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeClosed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ── Helper: calcular edad ────────────────────────────────────────
const calcularEdad = (birthDate) => {
  if (!birthDate) return null;
  const hoy   = new Date();
  const nac   = new Date(birthDate);
  let edad    = hoy.getFullYear() - nac.getFullYear();
  const mes   = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

// ── Validación del formulario principal ─────────────────────────
const validarFormulario = (formData) => {
  const errors = {};
  if (!formData.fullName.trim())
    errors.fullName = "El nombre es requerido.";
  if (!formData.email.trim())
    errors.email = "El email es requerido.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
    errors.email = "Ingresa un email válido.";
  if (!formData.birthDate)
    errors.birthDate = "La fecha de nacimiento es requerida.";
  if (!formData.password)
    errors.password = "La contraseña es requerida.";
  else if (formData.password.length < 6)
    errors.password = "Mínimo 6 caracteres.";
  if (!formData.confirmPassword)
    errors.confirmPassword = "Confirma tu contraseña.";
  else if (formData.password !== formData.confirmPassword)
    errors.confirmPassword = "Las contraseñas no coinciden.";
  return errors;
};

// ── Validación del formulario del tutor ─────────────────────────
const validarTutor = (tutorData) => {
  const errors = {};
  if (!tutorData.tutorName.trim())
    errors.tutorName = "El nombre del tutor es requerido.";
  if (!tutorData.tutorEmail.trim())
    errors.tutorEmail = "El email del tutor es requerido.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutorData.tutorEmail))
    errors.tutorEmail = "Ingresa un email válido.";
  if (!tutorData.tutorPhone.trim())
    errors.tutorPhone = "El teléfono es requerido.";
  if (!tutorData.tutorPassword)
    errors.tutorPassword = "La contraseña es requerida.";
  else if (tutorData.tutorPassword.length < 6)
    errors.tutorPassword = "Mínimo 6 caracteres.";
  if (!tutorData.tutorConfirmPassword)
    errors.tutorConfirmPassword = "Confirma la contraseña.";
  else if (tutorData.tutorPassword !== tutorData.tutorConfirmPassword)
    errors.tutorConfirmPassword = "Las contraseñas no coinciden.";
  return errors;
};

// ── Modal Tutor ──────────────────────────────────────────────────
const TutorModal = ({ onConfirm, onClose }) => {
  const [tutorData, setTutorData] = useState({
    tutorName: "", tutorEmail: "", tutorPhone: "",
    tutorPassword: "", tutorConfirmPassword: "",
  });
  const [showPass, setShowPass]         = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errors, setErrors]             = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTutorData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = () => {
    const validationErrors = validarTutor(tutorData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onConfirm(tutorData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>

        <div className={styles.modalHeader}>
          <div className={styles.modalIconWrapper}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <h3 className={styles.modalTitle}>Registro de Tutor</h3>
            <p className={styles.modalSubtitle}>
              El usuario es menor de edad. Se requieren los datos del tutor para completar el registro.
            </p>
          </div>
        </div>

        <div className={styles.modalBody}>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>INFORMACIÓN PADRE O TUTOR</legend>

            <div className={styles.field}>
              <label className={styles.label}>
                Nombre del Tutor<span className={styles.required}>*</span>
              </label>
              <input
                name="tutorName"
                type="text"
                placeholder="Nombre completo del tutor"
                className={`${styles.input} ${errors.tutorName ? styles.inputError : ""}`}
                value={tutorData.tutorName}
                onChange={handleChange}
              />
              {errors.tutorName && <span className={styles.errorText}>{errors.tutorName}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Email del tutor<span className={styles.required}>*</span>
              </label>
              <input
                name="tutorEmail"
                type="email"
                placeholder="tutor@email.com"
                className={`${styles.input} ${errors.tutorEmail ? styles.inputError : ""}`}
                value={tutorData.tutorEmail}
                onChange={handleChange}
              />
              {errors.tutorEmail && <span className={styles.errorText}>{errors.tutorEmail}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Teléfono del tutor</label>
              <input
                name="tutorPhone"
                type="tel"
                placeholder="+1 234 567 8900"
                className={`${styles.input} ${errors.tutorPhone ? styles.inputError : ""}`}
                value={tutorData.tutorPhone}
                onChange={handleChange}
              />
              {errors.tutorPhone && <span className={styles.errorText}>{errors.tutorPhone}</span>}
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>SEGURIDAD</legend>

            <div className={styles.field}>
              <label className={styles.label}>
                Contraseña<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  name="tutorPassword"
                  type={showPass ? "text" : "password"}
                  className={`${styles.input} ${styles.inputWithIcon} ${errors.tutorPassword ? styles.inputError : ""}`}
                  value={tutorData.tutorPassword}
                  onChange={handleChange}
                />
                <button type="button" className={styles.eyeButton} onClick={() => setShowPass((p) => !p)}>
                  {showPass ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </div>
              {errors.tutorPassword && <span className={styles.errorText}>{errors.tutorPassword}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Confirmar contraseña<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  name="tutorConfirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  className={`${styles.input} ${styles.inputWithIcon} ${errors.tutorConfirmPassword ? styles.inputError : ""}`}
                  value={tutorData.tutorConfirmPassword}
                  onChange={handleChange}
                />
                <button type="button" className={styles.eyeButton} onClick={() => setShowConfirmPass((p) => !p)}>
                  {showConfirmPass ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </div>
              {errors.tutorConfirmPassword && <span className={styles.errorText}>{errors.tutorConfirmPassword}</span>}
            </div>
          </fieldset>

        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>Cancelar</button>
          <button className={styles.submitButton} onClick={handleSubmit}>Registrarse</button>
        </div>

      </div>
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────
const RegisterView = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "", email: "", birthDate: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword]             = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors]                         = useState({});
  const [loading, setLoading]                       = useState(false);
  const [showTutorModal, setShowTutorModal]         = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validarFormulario(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // ── Verificar si es menor de edad ──
    const edad = calcularEdad(formData.birthDate);
    if (edad < 18) {
      setShowTutorModal(true);
      return;
    }

    await registrar({ student: formData });
  };

  const handleTutorConfirm = async (tutorData) => {
    setShowTutorModal(false);
    await registrar({ student: formData, tutor: tutorData });
  };

  const registrar = async (payload) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Registro completo:", payload);
    setLoading(false);
    navigate("/login");
  };

  return (
    <div className={styles.layout}>

      {/* ── Branding ── */}
      <aside className={styles.branding}>
        <div className={styles.brandingContent}>
        
           <NextWordLogo  size="md"/>
          
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

      {/* ── Formulario ── */}
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
                    value={formData.fullName} onChange={handleChange} autoComplete="name"
                  />
                  {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>
                    Email<span className={styles.required}>*</span>
                  </label>
                  <input id="email" name="email" type="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    value={formData.email} onChange={handleChange} autoComplete="email"
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="birthDate" className={styles.label}>
                  Fecha Nacimiento<span className={styles.required}>*</span>
                </label>
                <input id="birthDate" name="birthDate" type="date"
                  className={`${styles.input} ${styles.inputDate} ${errors.birthDate ? styles.inputError : ""}`}
                  value={formData.birthDate} onChange={handleChange}
                />
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
                    value={formData.password} onChange={handleChange} autoComplete="new-password"
                  />
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
                    value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password"
                  />
                  <button type="button" className={styles.eyeButton}
                    onClick={() => setShowConfirmPassword((p) => !p)}>
                    {showConfirmPassword ? <IconEyeClosed /> : <IconEyeOpen />}
                  </button>
                </div>
                {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
              </div>
            </fieldset>

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

      {/* ── Modal Tutor ── */}
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