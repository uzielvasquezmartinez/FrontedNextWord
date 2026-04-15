import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import adminService from "../../services/AdminService";
import styles from "./AdminDashboard.module.css";
import {
  Users,
  CalendarDays,
  DollarSign,
  ArrowRight,
  UserRound,
  ReceiptText,
  ChartColumn,
} from "lucide-react";

const ADMIN_NAV = [
  { label: "Inicio", path: "/admin/dashboard" },
  { label: "Profesores", path: "/admin/teachers" },
  { label: "Clases", path: "/admin/classes" },
  { label: "Reportes", path: "/admin/reports" },
];

const QUICK_LINKS = [
  {
    id: "teachers",
    title: "Directorio de usuarios",
    description: "Gestionar lista de profesores",
    path: "/admin/teachers",
    icon: <UserRound size={20} />,
  },
  {
    id: "classes",
    title: "Historial de clases",
    description: "Revisar clases programadas",
    path: "/admin/classes",
    icon: <ReceiptText size={20} />,
  },
  {
    id: "reports",
    title: "Reportes financieros",
    description: "Ingresos y estadisticas",
    path: "/admin/reports",
    icon: <ChartColumn size={20} />,
  },
];

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
};

const currency = (amount) => {
  const value = toNumber(amount, 0);
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeTeachers: 4,
    classesToday: 2,
    monthIncome: 9450,
    weekNewStudents: 0,
    weekCompletedClasses: 0,
    weekCanceledClasses: 0,
    weekIncome: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        const data = res?.data ?? {};
        const weekSummary =
          data.weekSummary ??
          data.summaryWeek ??
          data.week ??
          data.summary?.week ??
          {};

        setStats((prev) => ({
          ...prev,
          activeTeachers: toNumber(
            data.activeProfessors ?? data.activeTeachers ?? data.teachersActive,
            prev.activeTeachers
          ),
          classesToday: toNumber(data.classesToday ?? data.scheduledToday ?? data.todayClasses, prev.classesToday),
          monthIncome: toNumber(data.monthlyIncome ?? data.monthIncome ?? data.incomeMonth, prev.monthIncome),
          weekNewStudents: toNumber(
            weekSummary.weekNewStudents ??
              data.newStudentsThisWeek ??
              weekSummary.newStudents ??
              weekSummary.studentsNew ??
              data.weekNewStudents ??
              data.newStudentsWeek ??
              data.newStudents,
            prev.weekNewStudents
          ),
          weekCompletedClasses: toNumber(
            weekSummary.weekCompletedClasses ??
              data.completedClassesThisWeek ??
              weekSummary.completedClasses ??
              weekSummary.classesCompleted ??
              data.weekCompletedClasses ??
              data.completedClassesWeek ??
              data.completedClasses,
            prev.weekCompletedClasses
          ),
          weekCanceledClasses: toNumber(
            weekSummary.weekCanceledClasses ??
              data.cancelledClassesThisWeek ??
              weekSummary.canceledClasses ??
              weekSummary.cancelledClasses ??
              weekSummary.classesCanceled ??
              data.weekCanceledClasses ??
              data.canceledClassesWeek ??
              data.cancelledClasses,
            prev.weekCanceledClasses
          ),
          weekIncome: toNumber(
            data.weeklyIncome ??
            weekSummary.weekIncome ??
              weekSummary.income ??
              weekSummary.totalIncome ??
              data.weekIncome ??
              data.incomeWeek,
            prev.weekIncome
          ),
        }));
      } catch (error) {
        console.error("Error cargando estadisticas del admin:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const topStats = useMemo(
    () => [
      {
        id: "teachers",
        label: "PROFESORES ACTIVOS",
        value: stats.activeTeachers,
        icon: <Users size={24} />,
      },
      {
        id: "classes",
        label: "CLASES HOY",
        value: stats.classesToday,
        icon: <CalendarDays size={24} />,
      },
      {
        id: "income",
        label: "INGRESOS DEL MES",
        value: currency(stats.monthIncome),
        icon: <DollarSign size={24} />,
      },
    ],
    [stats]
  );

  return (
    <div className={styles.page}>
      <AppNavbar navItems={ADMIN_NAV} activeItem="Inicio" />

      <main className={styles.main}>
        <section className={styles.statsGrid}>
          {topStats.map((stat) => (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{loading ? "..." : stat.value}</span>
              </div>
              <div className={styles.statIcon}>{stat.icon}</div>
            </div>
          ))}
        </section>

        <section className={styles.bottomGrid}>
          <article className={styles.panelCard}>
            <h2 className={styles.panelTitle}>Accesos directos</h2>
            <div className={styles.quickLinks}>
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  className={styles.quickLinkItem}
                  onClick={() => navigate(link.path)}
                >
                  <span className={styles.quickLinkIcon}>{link.icon}</span>
                  <span className={styles.quickLinkText}>
                    <span className={styles.quickLinkTitle}>{link.title}</span>
                    <span className={styles.quickLinkDescription}>{link.description}</span>
                  </span>
                  <ArrowRight size={18} className={styles.quickLinkArrow} />
                </button>
              ))}
            </div>
          </article>

          <article className={styles.panelCard}>
            <h2 className={styles.panelTitle}>Resumen de la semana</h2>
            <ul className={styles.summaryList}>
              <li className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Alumnos nuevos</span>
                <span className={styles.summaryValue}>{loading ? "..." : stats.weekNewStudents}</span>
              </li>
              <li className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Clases completadas</span>
                <span className={styles.summaryValue}>{loading ? "..." : stats.weekCompletedClasses}</span>
              </li>
              <li className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Clases canceladas</span>
                <span className={styles.summaryValue}>{loading ? "..." : stats.weekCanceledClasses}</span>
              </li>
              <li className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Ingresos</span>
                <span className={styles.summaryValue}>{loading ? "..." : currency(stats.weekIncome)}</span>
              </li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
