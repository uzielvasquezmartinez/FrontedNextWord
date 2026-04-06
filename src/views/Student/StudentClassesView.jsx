import { useState } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Button from "../../components/UI/Button/Button";
import Badge from "../../components/UI/Badge/Badge";
import styles from "./StudentClassesView.module.css";

// ── Navegación ───────────────────────────────────────────────────
const STUDENT_NAV = [
  { label: "Inicio",   path: "/student/dashboard" },
  { label: "Horario",  path: "/student/schedule"  },
  { label: "Clases",   path: "/student/classes"   },
  { label: "Mensajes", path: "/student/messages"  },
];

const STATUS_FILTERS = ["Próximas", "Completadas", "Canceladas"];

// ── Mapa de colores por filtro ───────────────────────────────────
const FILTER_STYLES = {
  Próximas:   { idle: styles.filterIdleProximas,   active: styles.filterActiveProximas   },
  Completadas:{ idle: styles.filterIdleCompletadas, active: styles.filterActiveCompletadas },
  Canceladas: { idle: styles.filterIdleCanceladas,  active: styles.filterActiveCanceladas  },
};

// ── Mapa de variantes para Badge ─────────────────────────────────
const statusVariant = (status) => {
  if (status === "Próximas")    return "programada";
  if (status === "Completadas") return "completada";
  if (status === "Canceladas")  return "cancelada";
  return "default";
};

// ── Datos mock ───────────────────────────────────────────────────
const CLASSES = [
  {
    id: 1, subject: "Inglés Avanzado",        teacher: "Mario Moreno",
    teacherAvatar: "https://i.pravatar.cc/150?img=33",
    date: "12 Abr 2026", time: "10:00 - 11:00",
    price: "$25", status: "Próximas", duration: "50 min",
    meetUrl: "https://meet.google.com",
  },
  {
    id: 2, subject: "Inglés Avanzado",        teacher: "Maximiliano Carsi Castrejon",
    teacherAvatar: "https://i.pravatar.cc/150?img=12",
    date: "14 Abr 2026", time: "09:00 - 10:00",
    price: "$28", status: "Próximas", duration: "50 min",
    meetUrl: "https://meet.google.com",
  },
  {
    id: 3, subject: "Inglés Avanzado",        teacher: "Brandon Moreno",
    teacherAvatar: "https://i.pravatar.cc/150?img=22",
    date: "16 Abr 2026", time: "15:00 - 16:00",
    price: "$30", status: "Próximas", duration: "50 min",
    meetUrl: "https://meet.google.com",
  },
  {
    id: 4, subject: "Inglés Conversacional",  teacher: "Alejandra Ortiz",
    teacherAvatar: "https://i.pravatar.cc/150?img=44",
    date: "08 Abr 2026", time: "16:00 - 17:00",
    price: "$30", status: "Completadas", duration: "50 min",
    meetUrl: null,
  },
  {
    id: 5, subject: "Preparación TOEFL",      teacher: "Brandon Moreno",
    teacherAvatar: "https://i.pravatar.cc/150?img=22",
    date: "05 Abr 2026", time: "12:00 - 13:00",
    price: "$35", status: "Canceladas", duration: "50 min",
    meetUrl: null,
  },
];

// ── Componente principal ─────────────────────────────────────────
const StudentClassesView = () => {
  const [activeFilter, setActiveFilter] = useState("Próximas");

  const filteredClasses = CLASSES.filter((cls) => cls.status === activeFilter);

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={STUDENT_NAV} activeItem="Clases" />

      <main className={styles.main}>

        {/* ── Header ── */}
        <section className={styles.headerCard}>
          <div>
            <h1 className={styles.subtitle}>Mis clases</h1>
            <p className={styles.heading}>Revisa tus clases con facilidad</p>
          </div>
        </section>

        {/* ── Filtros ── */}
        <section className={styles.filterPanel}>
          <div className={styles.filterButtons}>
            {STATUS_FILTERS.map((filter) => {
              const colorClass = activeFilter === filter
                ? FILTER_STYLES[filter].active
                : FILTER_STYLES[filter].idle;
              return (
                <button
                  key={filter}
                  className={`${styles.filterBtn} ${colorClass}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Lista de clases ── */}
        <section className={styles.classesList}>
          {filteredClasses.length === 0 ? (
            <p className={styles.empty}>No hay clases en esta categoría todavía.</p>
          ) : (
            filteredClasses.map((cls) => (
              <article
                key={cls.id}
                className={`${styles.classCard} ${styles[`card${cls.status.replace("ó","o").replace("é","e")}`]}`}
              >
                {/* Foto del profesor */}
                <img
                  className={styles.teacherAvatar}
                  src={cls.teacherAvatar}
                  alt={cls.teacher}
                />

                {/* Info de la clase */}
                <div className={styles.classInfo}>
                  <span className={styles.classSubject}>{cls.subject}</span>
                  <p className={styles.classTeacher}>Docente: {cls.teacher}</p>
                  <p className={styles.classMeta}>Duración: {cls.duration}</p>
                  <p className={styles.classMeta}>{cls.date} · {cls.time} · {cls.price}</p>
                </div>

                {/* Acciones */}
                <div className={styles.classActions}>
                  {cls.status === "Próximas" && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => window.open(cls.meetUrl, "_blank")}
                      >
                        Unirse
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => alert("Clase cancelada")}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  {cls.status === "Completadas" && (
                    <Button
                      variant="secondary"
                      onClick={() => alert("Ver resumen")}
                    >
                      Resumen
                    </Button>
                  )}
                  {cls.status === "Canceladas" && (
                    <Button
                      variant="secondary"
                      onClick={() => alert("Reprogramar clase")}
                    >
                      Reprogramar
                    </Button>
                  )}
                </div>

              </article>
            ))
          )}
        </section>

      </main>
    </div>
  );
};

export default StudentClassesView;