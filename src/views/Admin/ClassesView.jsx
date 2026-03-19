import { useState } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import styles from "./ClassesView.module.css";

const ADMIN_NAV = [
  { label: "Inicio",     path: "/admin/dashboard" },
  { label: "Profesores", path: "/admin/teachers"  },
  { label: "Clases",     path: "/admin/classes"   },
  { label: "Reportes",   path: "/admin/reports"   },
];
// ── Datos mock ───────────────────────────────────────────────────
const CLASSES = [
  { id: 1, subject: "Inglés",      student: "Uziel Redondo",    teacher: "Miguel Gomez",  date: "20/02/2026", time: "11-12", price: "$25", status: "Programada"  },
  { id: 2, subject: "Matemáticas", student: "Laura Salsedo",    teacher: "Ana Torres",    date: "20/02/2026", time: "13-14", price: "$30", status: "Cancelada"   },
  { id: 3, subject: "Inglés",      student: "Mariana García",   teacher: "Miguel Gomez",  date: "21/02/2026", time: "10-11", price: "$35", status: "Programada"  },
  { id: 4, subject: "Francés",     student: "Enrique Solano",   teacher: "Sophie Blanc",  date: "21/02/2026", time: "15-16", price: "$40", status: "Programada"  },
  { id: 5, subject: "Física",      student: "Víctor Hernández", teacher: "Carlos Ruiz",   date: "22/02/2026", time: "09-10", price: "$28", status: "Cancelada"   },
  { id: 6, subject: "Historia",    student: "Emmanuel Rosales", teacher: "Diana Flores",  date: "22/02/2026", time: "16-17", price: "$22", status: "Programada"  },
  { id: 7, subject: "Química",     student: "Laura Dominguez",  teacher: "Carlos Ruiz",   date: "23/02/2026", time: "11-12", price: "$32", status: "Programada"  },
  { id: 8, subject: "Química",     student: "Uchi Mamardo",     teacher: "Celin Santos",  date: "13/02/2026", time: "11-12", price: "$32", status: "PreAgendada" },
  { id: 9, subject: "DSM",         student: "Sizasbro",         teacher: "Celin Santos",  date: "14/02/2026", time: "11-12", price: "$32", status: "Completada"  },
];

const FILTERS = ["Todos", "Programada", "Cancelada", "PreAgendada", "Completada"];

// ── Mapa de estilos por filtro ───────────────────────────────────
const FILTER_STYLES = {
  Todos:       { idle: "",                          active: styles.filterActiveDefault    },
  Programada:  { idle: styles.filterIdleProgramada, active: styles.filterActiveProgramada },
  Cancelada:   { idle: styles.filterIdleCancelada,  active: styles.filterActiveCancelada  },
  PreAgendada: { idle: styles.filterIdlePreagendada,active: styles.filterActivePreagendada },
  Completada:  { idle: styles.filterIdleCompletada, active: styles.filterActiveCompletada  },
};

// ── Mapa de estilos para badges en tarjetas ──────────────────────
const BADGE_STYLES = {
  Programada:  styles.badgeProgramada,
  Cancelada:   styles.badgeCancelada,
  PreAgendada: styles.badgePreagendada,
  Completada:  styles.badgeCompletada,
};

// ── Avatar placeholder ───────────────────────────────────────────
const AvatarPlaceholder = () => (
  <div className={styles.avatar}>
    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className={styles.avatarSvg}>
      <rect width="60" height="60" fill="#e5e7eb"/>
      <line x1="0" y1="0" x2="60" y2="60" stroke="#9ca3af" strokeWidth="1.5"/>
      <line x1="60" y1="0" x2="0" y2="60" stroke="#9ca3af" strokeWidth="1.5"/>
    </svg>
  </div>
);

// ── Modal ────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
      </div>
      <div className={styles.modalBody}>{children}</div>
    </div>
  </div>
);

// ── Componente principal ─────────────────────────────────────────
const ClassesView = () => {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [detailModal, setDetailModal]   = useState(null);

  const filtered = activeFilter === "Todos"
    ? CLASSES
    : CLASSES.filter((c) => c.status === activeFilter);

  return (
    <div className={styles.page}>
<AppNavbar title="Panel de Administrador" navItems={ADMIN_NAV} activeItem="Clases" />

      <main className={styles.main}>

        {/* ── Filtros ── */}
        <div className={styles.filtersRow}>
          <span className={styles.filterLabel}>FILTRAR:</span>
          {FILTERS.map((f) => {
            const colorClass = activeFilter === f
              ? FILTER_STYLES[f].active
              : FILTER_STYLES[f].idle;

            return (
              <button
                key={f}
                className={`${styles.filterBtn} ${colorClass}`}
                onClick={() => setActiveFilter(f)}
              >
                {f !== "Todos" && <span className={styles.filterDot} />}
                {f}
              </button>
            );
          })}
        </div>

        {/* ── Tarjetas ── */}
        <div className={styles.cardList}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>Sin clases para este filtro.</p>
          ) : (
            filtered.map((cls) => (
              <div
                key={cls.id}
                className={styles.card}
                onClick={() => setDetailModal(cls)}
              >
                <AvatarPlaceholder />

                <div className={styles.cardInfo}>
                  <p className={styles.cardSubject}>Materia: {cls.subject}</p>
                  <p className={styles.cardMeta}><strong>Estudiante:</strong> {cls.student}</p>
                  <p className={styles.cardMeta}><strong>Profesor:</strong> {cls.teacher}</p>
                  <span className={styles.cardDate}>{cls.date} &nbsp; {cls.time}</span>
                </div>

                <div className={styles.cardRight}>
                  <span className={`${styles.badge} ${BADGE_STYLES[cls.status] ?? ""}`}>
                    {cls.status}
                  </span>
                  <span className={styles.cardPrice}>{cls.price}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      {/* ════ MODAL: VER DETALLE ════ */}
      {detailModal && (
        <Modal title="Detalle de Clase" onClose={() => setDetailModal(null)}>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Materia</span>
            <span className={styles.detailValue}>{detailModal.subject}</span>
            <span className={styles.detailLabel}>Estudiante</span>
            <span className={styles.detailValue}>{detailModal.student}</span>
            <span className={styles.detailLabel}>Profesor</span>
            <span className={styles.detailValue}>{detailModal.teacher}</span>
            <span className={styles.detailLabel}>Fecha</span>
            <span className={styles.detailValue}>{detailModal.date}</span>
            <span className={styles.detailLabel}>Horario</span>
            <span className={styles.detailValue}>{detailModal.time}</span>
            <span className={styles.detailLabel}>Precio</span>
            <span className={styles.detailValue}>{detailModal.price}</span>
            <span className={styles.detailLabel}>Estado</span>
            <span className={`${styles.badge} ${BADGE_STYLES[detailModal.status] ?? ""}`}>
              {detailModal.status}
            </span>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => setDetailModal(null)}>Cerrar</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClassesView;