import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import adminService from "../../services/AdminService";
import styles from "./ReportsView.module.css";

const ADMIN_NAV = [
  { label: "Inicio", path: "/admin/dashboard" },
  { label: "Profesores", path: "/admin/teachers" },
  { label: "Clases", path: "/admin/classes" },
  { label: "Reportes", path: "/admin/reports" },
];

const ROLE_TEACHER = 2;

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const currency = (amount) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(toNumber(amount, 0));

const extractRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeTeacherId = (item) =>
  item.teacherId ??
  item.professorId ??
  item.teacher?.id ??
  item.teacher?.userId ??
  item.professor?.id ??
  item.professor?.userId ??
  null;

const normalizeTeacherName = (item) =>
  item.teacherName ||
  item.teacherFullName ||
  item.professorName ||
  item.teacher?.fullName ||
  item.teacher?.name ||
  item.professor?.fullName ||
  item.professor?.name ||
  "Profesor asignado";

const normalizeFinancialChartData = (payload) => {
  if (!Array.isArray(payload)) return [];
  return payload.map((item) => ({
    month: item.month ?? "-",
    amount: toNumber(item.amount, 0),
  }));
};

const normalizeRecentTransactions = (payload) => {
  if (!Array.isArray(payload)) return [];
  return payload.map((item, index) => ({
    id: item.transactionId ?? `tx-${index}`,
    topic: item.topic ?? "Clase",
    studentName: item.studentName ?? "Estudiante",
    date: item.date ?? "-",
    amount: toNumber(item.amount, 0),
  }));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{currency(payload[0]?.value ?? 0)}</p>
    </div>
  );
};

const exportExcel = (rows) => {
  const formattedRows = rows.map((teacher) => ({
    Profesor: teacher.name,
    "Clases registradas": teacher.classes,
  }));
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
  XLSX.writeFile(workbook, "reporte_clases_profesores.xlsx");
};

const exportPDF = (rows) => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Reporte de clases por profesor", 14, 18);
  autoTable(doc, {
    startY: 26,
    head: [["Profesor", "Clases registradas"]],
    body: rows.map((teacher) => [teacher.name, teacher.classes]),
    headStyles: { fillColor: [43, 88, 254] },
  });
  doc.save("reporte_clases_profesores.pdf");
};

const parseFilename = (contentDisposition) => {
  if (!contentDisposition) return `Reporte_NextWord_${Date.now()}.pdf`;
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const basicMatch = /filename="?([^"]+)"?/i.exec(contentDisposition);
  if (basicMatch?.[1]) return basicMatch[1];
  return `Reporte_NextWord_${Date.now()}.pdf`;
};

const ReportsView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [teachersReport, setTeachersReport] = useState([]);
  const [financialChart, setFinancialChart] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalClasses: 0,
    activeTeachers: 0,
    monthIncome: 0,
  });

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError("");

      try {
        const [dashboardRes, usersRes, reservationsRes, financialRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getUserDirectory(),
          adminService.getClassHistory(),
          adminService.getFinancialReports().catch(() => null),
        ]);

        const dashboard = dashboardRes?.data ?? {};
        const financial = financialRes?.data ?? null;
        const financialChartRows = normalizeFinancialChartData(financial?.chartData);
        const recentTxRows = normalizeRecentTransactions(financial?.recentTransactions);
        const users = extractRows(usersRes?.data);
        const reservations = extractRows(reservationsRes?.data);

        const teacherDirectory = users
          .filter((user) => user.roleId === ROLE_TEACHER)
          .map((user) => ({
            id: user.userId ?? user.id,
            name: user.fullName ?? user.name ?? "Profesor",
          }));

        const classesByTeacher = new Map();
        teacherDirectory.forEach((teacher) => {
          classesByTeacher.set(String(teacher.id), {
            id: teacher.id,
            name: teacher.name,
            classes: 0,
          });
        });

        reservations.forEach((reservation) => {
          const teacherId = normalizeTeacherId(reservation);
          const teacherName = normalizeTeacherName(reservation);

          if (teacherId !== null && teacherId !== undefined) {
            const key = String(teacherId);
            const current = classesByTeacher.get(key) ?? { id: teacherId, name: teacherName, classes: 0 };
            classesByTeacher.set(key, {
              ...current,
              name: current.name || teacherName,
              classes: current.classes + 1,
            });
            return;
          }

          const fallbackKey = `name:${teacherName}`;
          const current = classesByTeacher.get(fallbackKey) ?? { id: fallbackKey, name: teacherName, classes: 0 };
          classesByTeacher.set(fallbackKey, { ...current, classes: current.classes + 1 });
        });

        const teacherRows = [...classesByTeacher.values()]
          .filter((teacher) => teacher.classes > 0)
          .sort((a, b) => b.classes - a.classes);

        setTeachersReport(teacherRows);
        setFinancialChart(financialChartRows);
        setRecentTransactions(recentTxRows);
        setSummary({
          totalClasses: reservations.length,
          activeTeachers: teacherRows.length,
          monthIncome: toNumber(
            financialChartRows.reduce((sum, row) => sum + row.amount, 0) ||
            dashboard.monthlyIncome ||
            dashboard.monthIncome ||
            dashboard.incomeMonth,
            0
          ),
        });
      } catch (loadError) {
        console.error("Error cargando reportes del administrador:", loadError);
        setTeachersReport([]);
        setFinancialChart([]);
        setRecentTransactions([]);
        setSummary({ totalClasses: 0, activeTeachers: 0, monthIncome: 0 });
        setError("No se pudieron cargar los reportes.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const response = await adminService.exportFinancialReportPdf();
      const file = new Blob([response.data], { type: "application/pdf" });
      const filename = parseFilename(response.headers?.["content-disposition"]);
      const url = window.URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error("Error exportando PDF financiero desde backend:", exportError);
      exportPDF(teachersReport);
    } finally {
      setExportingPdf(false);
    }
  };

  const incomeChartData = useMemo(
    () =>
      financialChart.map((row) => ({
        month: row.month,
        amount: row.amount,
      })),
    [financialChart]
  );

  return (
    <div className={styles.page}>
      <AppNavbar title="Panel de Administrador" navItems={ADMIN_NAV} activeItem="Reportes" />

      <main className={styles.main}>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}></span>
            <div>
              <p className={styles.summaryValue}>{loading ? "..." : summary.totalClasses}</p>
              <p className={styles.summaryLabel}>Clases registradas</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}></span>
            <div>
              <p className={styles.summaryValue}>{loading ? "..." : summary.activeTeachers}</p>
              <p className={styles.summaryLabel}>Profesores con clases</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}></span>
            <div>
              <p className={styles.summaryValue}>{loading ? "..." : currency(summary.monthIncome)}</p>
              <p className={styles.summaryLabel}>Ingresos del mes</p>
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.tableCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Clases por profesor</h2>
              </div>
              <div className={styles.exportBtns}>
                <button className={styles.btnPdf} onClick={handleExportPdf} type="button" disabled={exportingPdf}>
                  {exportingPdf ? "Exportando..." : "PDF"}
                </button>
              </div>
            </div>

            {loading ? (
              <p className={styles.empty}>Cargando reportes...</p>
            ) : error ? (
              <p className={styles.empty}>{error}</p>
            ) : teachersReport.length === 0 ? (
              <p className={styles.empty}>No hay clases registradas para generar el reporte.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Profesor</th>
                    <th className={styles.th}>Clases</th>
                  </tr>
                </thead>
                <tbody>
                  {teachersReport.map((teacher) => (
                    <tr key={teacher.id} className={styles.tr}>
                      <td className={styles.td}>{teacher.name}</td>
                      <td className={styles.tdCenter}>
                        <span className={styles.classBadge}>{teacher.classes} clases</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.chartCard}>
            <h2 className={styles.cardTitle}>Ingresos por mes</h2>
            <p className={styles.chartSubtitle}>{loading ? "Cargando..." : "Datos financieros de los ultimos meses"}</p>
            {loading ? (
              <p className={styles.empty}>Cargando grafica...</p>
            ) : error ? (
              <p className={styles.empty}>{error}</p>
            ) : incomeChartData.length === 0 ? (
              <p className={styles.empty}>Sin datos para mostrar en la grafica.</p>
            ) : (
              <>
                <div className={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={incomeChartData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="amount" fill="var(--bar-clases)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.legend}>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDotBlue} /> Ingresos
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Ultimas transacciones</h2>
          </div>
          {loading ? (
            <p className={styles.empty}>Cargando transacciones...</p>
          ) : recentTransactions.length === 0 ? (
            <p className={styles.empty}>No hay transacciones recientes.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Tema</th>
                  <th className={styles.th}>Estudiante</th>
                  <th className={styles.th}>Fecha</th>
                  <th className={styles.th}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className={styles.tr}>
                    <td className={styles.td}>{tx.topic}</td>
                    <td className={styles.td}>{tx.studentName}</td>
                    <td className={styles.td}>{tx.date}</td>
                    <td className={styles.tdCenter}>
                      <span className={styles.incomeBadge}>+{currency(tx.amount)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportsView;
