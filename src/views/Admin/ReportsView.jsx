import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import styles from "./ReportsView.module.css";

const ADMIN_NAV = [
  { label: "Inicio",     path: "/admin/dashboard" },
  { label: "Profesores", path: "/admin/teachers"  },
  { label: "Clases",     path: "/admin/classes"   },
  { label: "Reportes",   path: "/admin/reports"   },
];



const TEACHERS_DATA = [
  { id: 1, name: "Miguel Gomez Martinez",    classes: 150, income: 3750 },
  { id: 2, name: "Marina Estrada Estrada",   classes: 60,  income: 1500 },
  { id: 3, name: "Valeria Dominguez Medina", classes: 123, income: 3075 },
  { id: 4, name: "David Martines Roman",     classes: 45,  income: 1125 },
];

const totalClasses = TEACHERS_DATA.reduce((s, t) => s + t.classes, 0);
const totalIncome  = TEACHERS_DATA.reduce((s, t) => s + t.income,  0);
const topTeacher   = [...TEACHERS_DATA].sort((a, b) => b.classes - a.classes)[0];

const fmt = (n) => `$${n.toLocaleString("es-MX")}`;

const exportExcel = () => {
  const rows = TEACHERS_DATA.map((t) => ({
    Nombre:            t.name,
    "Clases impartidas": t.classes,
    "Ingresos generados": fmt(t.income),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, "reporte_profesores.xlsx");
};

const exportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Reporte de Clases por Profesor", 14, 18);
  autoTable(doc, {
    startY: 26,
    head: [["Nombre", "Clases impartidas", "Ingresos generados"]],
    body: TEACHERS_DATA.map((t) => [t.name, t.classes, fmt(t.income)]),
    headStyles: { fillColor: [43, 88, 254] },
  });
  doc.save("reporte_profesores.pdf");
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value} clases</p>
      <p className={styles.tooltipIncome}>{fmt(payload[1]?.value ?? 0)}</p>
    </div>
  );
};

const ReportsView = () => {
  const [activeBar, setActiveBar] = useState(null);

  const chartData = TEACHERS_DATA.map((t) => ({
    name:    t.name.split(" ")[0],       
    clases:  t.classes,
    ingresos: t.income,
  }));

  return (
    <div className={styles.page}>
<AppNavbar title="Panel de Administrador" navItems={ADMIN_NAV} activeItem="Reportes" />

      <main className={styles.main}>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}></span>
            <div>
              <p className={styles.summaryValue}>{totalClasses}</p>
              <p className={styles.summaryLabel}>Clases impartidas</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}></span>
            <div>
              <p className={styles.summaryValue}>{fmt(totalIncome)}</p>
              <p className={styles.summaryLabel}>Ingresos del mes</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}></span>
            <div>
              <p className={styles.summaryValue}>{topTeacher.name.split(" ")[0]}</p>
              <p className={styles.summaryLabel}>Profesor más activo</p>
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>

          <div className={styles.tableCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Clases por Profesor</h2>
              <div className={styles.exportBtns}>
                <button className={styles.btnExcel} onClick={exportExcel}>
                  ↓ Excel
                </button>
                <button className={styles.btnPdf} onClick={exportPDF}>
                  ↓ PDF
                </button>
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Nombre</th>
                  <th className={styles.th}>Clases</th>
                  <th className={styles.th}>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {TEACHERS_DATA.map((t) => (
                  <tr key={t.id} className={styles.tr}>
                    <td className={styles.td}>{t.name}</td>
                    <td className={styles.tdCenter}>
                      <span className={styles.classBadge}>{t.classes} clases</span>
                    </td>
                    <td className={styles.tdCenter}>
                      <span className={styles.incomeBadge}>{fmt(t.income)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.chartCard}>
            <h2 className={styles.cardTitle}>Actividad visual</h2>
            <p className={styles.chartSubtitle}>Clases e ingresos por profesor</p>
           <div className={styles.chartWrapper}>
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={chartData} barGap={4}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
      <XAxis
        dataKey="name"
        tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="clases"   fill="var(--bar-clases)"   radius={[4,4,0,0]} maxBarSize={32} />
      <Bar dataKey="ingresos" fill="var(--bar-ingresos)" radius={[4,4,0,0]} maxBarSize={32} />
    </BarChart>
  </ResponsiveContainer>
</div>

            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDotBlue} /> Clases
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDotPurple} /> Ingresos
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ReportsView;