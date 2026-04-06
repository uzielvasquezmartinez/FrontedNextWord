
import { useState } from "react";
import Input from "../Input/Input";
import { IconEyeOpen, IconEyeClosed } from "../../Icons/Icons";
import styles from "./PasswordInput.module.css";

const PasswordInput = ({ showStrength = false, value = "", ...props }) => {
  const [show, setShow] = useState(false);

  const getStrength = () => {
    if (!value)             return { level: 0, label: "",       color: "" };
    if (value.length < 6)  return { level: 1, label: "Débil",  color: "#dc2626" };
    if (value.length < 10) return { level: 2, label: "Media",  color: "#f59e0b" };
    return                        { level: 3, label: "Fuerte", color: "#16a34a" };
  };

  const strength = getStrength();

  const eyeButton = (
    <button
      type="button"
      className={styles.eyeBtn}
      onClick={() => setShow((p) => !p)}
      aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
    >
      {show ? <IconEyeClosed /> : <IconEyeOpen />}
    </button>
  );

  return (
    <div className={styles.wrapper}>
      <Input
        {...props}
        value={value}
        type={show ? "text" : "password"}
        icon={eyeButton}
      />
      {showStrength && value && (
        <div className={styles.strengthRow}>
          <div className={styles.strengthBars}>
            {[1, 2, 3].map((l) => (
              <div
                key={l}
                className={styles.strengthBar}
                style={{ backgroundColor: l <= strength.level ? strength.color : "#e5e7eb" }}
              />
            ))}
          </div>
          <span
            className={styles.strengthLabel}
            style={{ color: strength.color }}
          >
            {strength.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;