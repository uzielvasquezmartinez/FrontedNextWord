// src/views/Register/TutorModal.jsx
import { useState } from "react";
import { IconEyeOpen, IconEyeClosed } from "../../components/Icons/Icons";
import { validarTutor } from "./registerValidations";
import styles from "./RegisterView.module.css";

const TutorModal = ({ onConfirm, onClose }) => {
  const [tutorData, setTutorData] = useState({
    tutorName: "", tutorEmail: "", tutorPhone: "",
    tutorPassword: "", tutorConfirmPassword: "",
  });
  const [showPass, setShowPass]               = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errors, setErrors]                   = useState({});

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
              <input name="tutorName" type="text" placeholder="Nombre completo del tutor"
                className={`${styles.input} ${errors.tutorName ? styles.inputError : ""}`}
                value={tutorData.tutorName} onChange={handleChange} />
              {errors.tutorName && <span className={styles.errorText}>{errors.tutorName}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Email del tutor<span className={styles.required}>*</span>
              </label>
              <input name="tutorEmail" type="email" placeholder="tutor@email.com"
                className={`${styles.input} ${errors.tutorEmail ? styles.inputError : ""}`}
                value={tutorData.tutorEmail} onChange={handleChange} />
              {errors.tutorEmail && <span className={styles.errorText}>{errors.tutorEmail}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Teléfono del tutor<span className={styles.required}>*</span>
              </label>
              <input name="tutorPhone" type="tel" placeholder="10 dígitos"
                className={`${styles.input} ${errors.tutorPhone ? styles.inputError : ""}`}
                value={tutorData.tutorPhone} onChange={handleChange} />
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
                <input name="tutorPassword" type={showPass ? "text" : "password"}
                  className={`${styles.input} ${styles.inputWithIcon} ${errors.tutorPassword ? styles.inputError : ""}`}
                  value={tutorData.tutorPassword} onChange={handleChange} />
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
                <input name="tutorConfirmPassword" type={showConfirmPass ? "text" : "password"}
                  className={`${styles.input} ${styles.inputWithIcon} ${errors.tutorConfirmPassword ? styles.inputError : ""}`}
                  value={tutorData.tutorConfirmPassword} onChange={handleChange} />
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

export default TutorModal;
