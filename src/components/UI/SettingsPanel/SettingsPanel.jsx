
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import Avatar from "../Avatar/Avatar";
import Badge from "../Badge/Badge";
import Input from "../Input/Input";
import PasswordInput from "../PasswordInput/PasswordInput";
import Button from "../Button/Button";
import styles from "./SettingsPanel.module.css";
import userService from "../../../services/userService";
import teacherService from "../../../services/teacherService";

const SettingsPanel = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [avatar, setAvatar]       = useState(null);

  const [profileForm, setProfileForm] = useState({
   ullName:                user?.name ?? "",
  email:                   user?.email ?? "",
  phoneNumber:             "",
  specialization:          "",
  yearsOfExperience:       "",
  bio:                     "",
  certifications:          "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

   const [profileErrors,   setProfileErrors]   = useState({});
  const [passwordErrors,  setPasswordErrors]  = useState({});
  const [loadingProfile,  setLoadingProfile]  = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [successProfile,  setSuccessProfile]  = useState("");
  const [successPassword, setSuccessPassword] = useState("");
  const [errorProfile,    setErrorProfile]    = useState("");
  const [errorPassword,   setErrorPassword]   = useState("");
  const initials = user?.name
    ?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "U";

  const roleLabel = user?.role === "teacher" ? "Profesor"
    : user?.role === "student" ? "Alumno" : "Admin";

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleProfileChange = (field) => (e) => {
    setProfileForm((p) => ({ ...p, [field]: e.target.value }));
    setProfileErrors((p) => ({ ...p, [field]: "" }));
    setErrorProfile("");
  };

   const validateProfile = () => {
    const e = {};
    if (!profileForm.fullName.trim()) e.fullName = "El nombre es requerido.";
    return e;
  };

  const handleProfileSave = async (e) => {
  e.preventDefault();
  const errs = validateProfile();
  if (Object.keys(errs).length) { setProfileErrors(errs); return; }

  setLoadingProfile(true);
  setErrorProfile("");

  try {
    if (user?.role === "teacher") {
      // Endpoint específico para profesores
      await teacherService.updateProfile({
        specialization:          profileForm.specialization        || "",
        yearsOfExperience:       parseInt(profileForm.yearsOfExperience) || 0,
        professionalDescription: profileForm.bio                  || "",
        certifications:          profileForm.certifications       || "",
      });
    } else {
      // Endpoint para estudiantes
      await userService.updateProfile({
        fullName:       profileForm.fullName    || null,
        phoneNumber:    profileForm.phoneNumber || null,
        profilePicture: avatar                  || null,
        newPassword:    null,
      });
    }

    setSuccessProfile("Perfil actualizado correctamente.");
    setTimeout(() => setSuccessProfile(""), 3000);

  } catch (error) {
    const msg =
      error.response?.data?.error ??
      error.response?.data?.message ??
      "Error al actualizar el perfil.";
    setErrorProfile(msg);
  } finally {
    setLoadingProfile(false);
  }
};

  // ── Contraseña ────────────────────────────────────────────────
  const handlePasswordChange = (field) => (e) => {
    setPasswordForm((p) => ({ ...p, [field]: e.target.value }));
    setPasswordErrors((p) => ({ ...p, [field]: "" }));
    setErrorPassword("");
  };

  const validatePassword = () => {
    const e = {};
    if (!passwordForm.newPass)                e.newPass = "Ingresa la nueva contraseña.";
    else if (passwordForm.newPass.length < 8) e.newPass = "Mínimo 8 caracteres.";
    if (!passwordForm.confirm)                e.confirm = "Confirma tu contraseña.";
    else if (passwordForm.newPass !== passwordForm.confirm)
      e.confirm = "Las contraseñas no coinciden.";
    return e;
  };

 const handlePasswordSave = async (e) => {
  e.preventDefault();
  console.log("handlePasswordSave llamado"); // ← agrega esto
  const errs = validatePassword();
  console.log("errores:", errs); // ← y esto
  if (Object.keys(errs).length) { setPasswordErrors(errs); return; }

    setLoadingPassword(true);
    setErrorPassword("");
  console.log("body que se envía:", { newPassword: passwordForm.newPass }); // ← agrega esto

    try {
      // Solo manda newPassword — el backend lo encripta y actualiza
      await userService.updateProfile({
        newPassword: passwordForm.newPass,
      });

      setPasswordForm({ newPass: "", confirm: "" });
      setSuccessPassword("Contraseña actualizada correctamente.");
      setTimeout(() => setSuccessPassword(""), 3000);

    } catch (error) {
      console.log("error completo:", error); // ← y esto
  console.log("error response:", error.response); // ← y esto
      const msg =
        error.response?.data?.message ??
        error.response?.data ??
        "Error al actualizar la contraseña.";
      setErrorPassword(msg);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            className={styles.panel}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className={styles.header}>
              <h2 className={styles.headerTitle}>Configuración</h2>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
            </div>

            <div className={styles.profileSummary}>
            {avatar && avatar !== ""
  ? <img src={avatar} alt="avatar" className={styles.summaryAvatarImg} />
  : <Avatar initials={initials} size="md" />
}
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{user?.name ?? "Usuario"}</span>
                <span className={styles.profileEmail}>{user?.email ?? ""}</span>
                <Badge label={roleLabel} variant="default" />
              </div>
            </div>

            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "profile" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Perfil
              </button>
              <button
                className={`${styles.tab} ${activeTab === "password" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("password")}
              >
                Contraseña
              </button>
            </div>

            <div className={styles.body}>

              {/* ── Pestaña Perfil ── */}
              {activeTab === "profile" && (
                <form className={styles.form} onSubmit={handleProfileSave} noValidate>

                  <div className={styles.avatarSection}>
                  {avatar && avatar !== ""
  ? <img src={avatar} alt="avatar" className={styles.summaryAvatarImg} />
  : <Avatar initials={initials} size="md" />
}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className={styles.fileInput}
                      onChange={handleAvatarChange}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Cambiar foto
                    </Button>
                  </div>

                  <p className={styles.sectionLabel}>Información Básica</p>

                  <Input
                    id="sp_fullName"
                    label="Nombre Completo"
                    value={profileForm.fullName}
                    onChange={handleProfileChange("fullName")}
                    error={profileErrors.fullName}
                    required
                  />

                  <Input
                    id="sp_phoneNumber"
                    label="Teléfono"
                    value={profileForm.phoneNumber}
                    onChange={handleProfileChange("phoneNumber")}
                    placeholder="10 dígitos"
                  />

                 {user?.role === "teacher" && (
  <>
    <p className={styles.sectionLabel}>Información Profesional</p>
    <Input
      id="sp_specialization"
      label="Especialización"
      value={profileForm.specialization}
      onChange={handleProfileChange("specialization")}
      placeholder="Ej. Inglés, Matemáticas..."
    />
    <Input
      id="sp_yearsOfExperience"
      label="Años de Experiencia"
      type="number"
      value={profileForm.yearsOfExperience}
      onChange={handleProfileChange("yearsOfExperience")}
      placeholder="Ej. 5"
    />
    <div className={styles.textareaField}>
      <label className={styles.textareaLabel}>Descripción Profesional</label>
      <textarea
        className={styles.textarea}
        rows={3}
        placeholder="Cuéntanos sobre ti..."
        value={profileForm.bio}
        onChange={handleProfileChange("bio")}
      />
    </div>
    <div className={styles.textareaField}>
      <label className={styles.textareaLabel}>Certificaciones</label>
      <textarea
        className={styles.textarea}
        rows={2}
        placeholder="Ej. TOEFL, Cambridge..."
        value={profileForm.certifications}
        onChange={handleProfileChange("certifications")}
      />
    </div>
  </>
)}

                  {errorProfile   && <p className={styles.errorMsg}>{errorProfile}</p>}
                  {successProfile && <p className={styles.successMsg}>{successProfile}</p>}

                  <Button type="submit" variant="primary" fullWidth loading={loadingProfile}>
                    Guardar Cambios
                  </Button>

                </form>
              )}

              {/* ── Pestaña Contraseña ── */}
              {activeTab === "password" && (
                <form className={styles.form} onSubmit={handlePasswordSave} noValidate>

                  <p className={styles.sectionLabel}>Cambiar Contraseña</p>

                  <PasswordInput
                    id="sp_newPass"
                    label="Nueva Contraseña"
                    value={passwordForm.newPass}
                    onChange={handlePasswordChange("newPass")}
                    error={passwordErrors.newPass}
                    showStrength
                    required
                  />

                  <PasswordInput
                    id="sp_confirm"
                    label="Confirmar Contraseña"
                    value={passwordForm.confirm}
                    onChange={handlePasswordChange("confirm")}
                    error={passwordErrors.confirm}
                    required
                  />

                  {errorPassword   && <p className={styles.errorMsg}>{errorPassword}</p>}
                  {successPassword && <p className={styles.successMsg}>{successPassword}</p>}

                  <Button type="submit" variant="primary" fullWidth loading={loadingPassword}>
                    Actualizar Contraseña
                  </Button>

                </form>
              )}

            </div>

            <div className={styles.footer}>
              <Button variant="danger" fullWidth onClick={logout}>
                Cerrar Sesión
              </Button>
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;