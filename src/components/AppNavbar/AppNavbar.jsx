import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./AppNavbar.module.css";
import NextWordLogo from "../NextWordLogo/NextWordLogo";

const AppNavbar = ({ title, navItems, activeItem }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
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
        <span className={styles.navUserName}>
          Hola, {user?.name?.split(" ")[0] ?? "Usuario"}
        </span>
        <button className={styles.avatarBtn} onClick={logout} title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default AppNavbar;