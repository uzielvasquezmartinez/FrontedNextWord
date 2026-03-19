import AppNavbar from "../../components/AppNavbar/AppNavbar";
import styles from "./AdminDashboard.module.css";

const ADMIN_NAV = [
  { label: "Inicio",     path: "/admin/dashboard" },
  { label: "Profesores", path: "/admin/teachers"  },
  { label: "Clases",     path: "/admin/classes"   },
  { label: "Reportes",   path: "/admin/reports"   },
];
const STATS = [
  {
    id: "teachers", label: "PROFESORES ACTIVOS", value: "4",
 
  },
  {
    id: "classes", label: "CLASES PROGRAMADAS HOY", value: "2",
  },
  {
    id: "income", label: "INGRESOS DEL MES", value: "$9,450",
  },
];

const ACTIVITY = [
  { id: 1, action: "Nuevo estudiante registrado", name: "Laura Salsedo",     time: "Hace 5 minutos" },
  { id: 2, action: "Nuevo estudiante registrado", name: "Laura Dominguez",   time: "Hace 5 minutos" },
  { id: 3, action: "Nuevo estudiante registrado", name: "Mariana García",    time: "Hace 5 minutos" },
  { id: 4, action: "Nuevo estudiante registrado", name: "Enrique Solano",    time: "Hace 5 minutos" },
  { id: 5, action: "Nuevo estudiante registrado", name: "Víctor Hernández",  time: "Hace 5 minutos" },
  { id: 6, action: "Nuevo estudiante registrado", name: "Emmanuel Rosales",  time: "Hace 5 minutos" },
];

const AdminDashboard = () => (
  <div className={styles.page}>
<AppNavbar title="Panel de Administrador" navItems={ADMIN_NAV} activeItem="Inicio" />  
  <main className={styles.main}>
      <section className={styles.statsGrid}>
        {STATS.map((stat) => (
          <div key={stat.id} className={styles.statCard}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
            <div className={styles.statIcon}>{stat.icon}</div>
          </div>
        ))}
      </section>
      <section className={styles.activityCard}>
        <h2 className={styles.activityTitle}>Actividad Reciente</h2>
        <ul className={styles.activityList}>
          {ACTIVITY.map((item, index) => (
            <li key={item.id} className={`${styles.activityItem} ${index === ACTIVITY.length - 1 ? styles.activityItemLast : ""}`}>
              <div className={styles.activityInfo}>
                <span className={styles.activityAction}>{item.action}</span>
                <span className={styles.activityName}>{item.name}</span>
              </div>
              <span className={styles.activityTime}>{item.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  </div>
);

export default AdminDashboard;
