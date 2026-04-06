
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import Avatar from "../Avatar/Avatar";
import Badge from "../Badge/Badge";
import Input from "../Input/Input";
import PasswordInput from "../PasswordInput/PasswordInput";
import Button from "../Button/Button";
import styles from "./SettingsPanel.module.css";

const SettingsPanel = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [avatar, setAvatar]       = useState(null);

  const [profileForm, setProfileForm] = useState({
    fullName:       user?.name  ?? "",
    email:          user?.email ?? "",
    specialization: "",
    bio:            "",
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
  };

  const validateProfile = () => {
    const e = {};
    if (!profileForm.fullName.trim()) e.fullName = "El nombre es requerido.";
    if (!profileForm.email.trim())    e.email    = "El correo es requerido.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email))
      e.email = "Ingresa un correo válido.";
    return e;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setLoadingProfile(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoadingProfile(false);
    setSuccessProfile("Perfil actualizado correctamente.");
    setTimeout(() => setSuccessProfile(""), 3000);
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswordForm((p) => ({ ...p, [field]: e.target.value }));
    setPasswordErrors((p) => ({ ...p, [field]: "" }));
  };

  const validatePassword = () => {
    const e = {};
    if (!passwordForm.current)                e.current = "Ingresa tu contraseña actual.";
    if (!passwordForm.newPass)                e.newPass = "Ingresa la nueva contraseña.";
    else if (passwordForm.newPass.length < 6) e.newPass = "Mínimo 6 caracteres.";
    if (!passwordForm.confirm)                e.confirm = "Confirma tu contraseña.";
    else if (passwordForm.newPass !== passwordForm.confirm)
      e.confirm = "Las contraseñas no coinciden.";
    return e;
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length) { setPasswordErrors(errs); return; }
    setLoadingPassword(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoadingPassword(false);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setSuccessPassword("Contraseña actualizada correctamente.");
    setTimeout(() => setSuccessPassword(""), 3000);
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
              {avatar
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Perfil
              </button>
              <button
                className={`${styles.tab} ${activeTab === "password" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Contraseña
              </button>
            </div>

            <div className={styles.body}>

{activeTab === "profile" && (
  <form className={styles.form} onSubmit={handleProfileSave} noValidate>

    <div className={styles.avatarSection}>
      {avatar
        ? <img src={avatar} alt="avatar" className={styles.avatarPreview} />
        : <Avatar initials={initials} size="xl" />
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
      id="sp_email"
      label="Correo Electrónico"
      type="email"
      value={profileForm.email}
      onChange={handleProfileChange("email")}
      error={profileErrors.email}
      required
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

        <div className={styles.textareaField}>
          <label className={styles.textareaLabel}>Biografía</label>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Cuéntanos sobre ti..."
            value={profileForm.bio}
            onChange={handleProfileChange("bio")}
          />
        </div>
      </>
    )}

    {successProfile && (
      <p className={styles.successMsg}>{successProfile}</p>
    )}

    <Button
      type="submit"
      variant="primary"
      fullWidth
      loading={loadingProfile}
    >
      Guardar Cambios
    </Button>

  </form>
)}
              {activeTab === "password" && (
                <form className={styles.form} onSubmit={handlePasswordSave} noValidate>

                  <p className={styles.sectionLabel}>Cambiar Contraseña</p>

                  <PasswordInput
                    id="sp_current"
                    label="Contraseña Actual"
                    value={passwordForm.current}
                    onChange={handlePasswordChange("current")}
                    error={passwordErrors.current}
                    required
                  />

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

                  {successPassword && (
                    <p className={styles.successMsg}>{successPassword}</p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loadingPassword}
                  >
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