import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../UI/Avatar/Avatar";
import SettingsPanel from "../UI/SettingsPanel/SettingsPanel";
import NextWordLogo from "../NextWordLogo/NextWordLogo";
import styles from "./AppNavbar.module.css";

const AppNavbar = ({ navItems, activeItem }) => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);

  const initials = user?.name
    ?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "U";

const pingBackend = async () => {
    try {
      const response = await fetch("https://unpoetically-interramal-loren.ngrok-free.dev", {
        headers: {
          "ngrok-skip-browser-warning": "true" // Para que ngrok no bloquee la prueba
        }
      });
      const data = await response.text();
      console.log("Respuesta del servidor:", data);
      alert("¡Petición enviada! Dile a tu amigo que revise su consola.");
    } catch (error) {
      console.error("Error al conectar:", error);
      alert("No se pudo conectar al ngrok.");
    }
  };
  return (
    <>
      <header className={styles.navbar}>

        <div className={styles.navBrand}>
          <NextWordLogo size="sm" />
        </div>

        <nav className={styles.navLinks}>
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`${styles.navItem} ${activeItem === item.label ? styles.navItemActive : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.navUser}>

<button 
            onClick={pingBackend}
            style={{
              background: '#00d084',
              color: 'white',
              border: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '1rem'
            }}
          >
            🔌 Ping Ngrok
          </button>


          <span className={styles.navUserName}>
            Hola, {user?.name?.split(" ")[0] ?? "Usuario"}
          </span>
          <button
            className={styles.avatarBtn}
            onClick={() => setPanelOpen(true)}
            title="Configuración"
          >
            <Avatar initials={initials} size="sm" />
          </button>
        </div>

      </header>

      <SettingsPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
};

export default AppNavbar;