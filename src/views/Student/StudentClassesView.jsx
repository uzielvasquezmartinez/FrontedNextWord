import { useState } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Button from "../../components/UI/Button/Button";
import Badge from "../../components/UI/Badge/Badge";
import styles from "./StudentClassesView.module.css";

const STUDENT_NAV = [
  { label: "Inicio",    path: "/student/dashboard" },
  { label: "Horario",   path: "/student/schedule"  },
  { label: "Clases",    path: "/student/classes"   },
  { label: "Mensajes",  path: "/student/messages"  },
];

const STATUS_FILTERS = ["Próximas", "Completadas", "Canceladas"];

const CLASSES = [
  {
    id: 1,
    subject: "Inglés Avanzado",
    teacher: "Mario Moreno",
    date: "12 Abr 2026",
    time: "10:00 - 11:00",
    price: "$25",
    status: "Próximas",
    duration: "50 min",
  },
  {
    id: 2,
    subject: "Inglés Conversacional",
    teacher: "Alejandra Ortiz",
    date: "08 Abr 2026",
    time: "16:00 - 17:00",
    price: "$30",
    status: "Completadas",
    duration: "50 min",
  },
  {
    id: 3,
    subject: "Preparación TOEFL",
    teacher: "Brandon Moreno",
    date: "05 Abr 2026",
    time: "12:00 - 13:00",
    price: "$35",
    status: "Canceladas",
    duration: "50 min",
  },
  {
    id: 4,
    subject: "Inglés de Negocios",
    teacher: "Carolina Bahena",
    date: "14 Abr 2026",
    time: "09:00 - 10:00",
    price: "$28",
    status: "Próximas",
    duration: "50 min",
  },
];

const statusVariant = (status) => {
  if (status === "Próximas") return "programada";
  if (status === "Completadas") return "completada";
  if (status === "Canceladas") return "cancelada";
  return "default";
};

const StudentClassesView = () => {
  const [activeFilter, setActiveFilter] = useState("Próximas");

  const filteredClasses = CLASSES.filter((cls) => cls.status === activeFilter);

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={STUDENT_NAV} activeItem="Clases" />

      <main className={styles.main}>
        <section className={styles.headerCard}>
          <div>
            <h1 className={styles.subtitle}>Mis clases</h1>
            <p className={styles.heading}>Revisa tus clases con facilidad</p>
          </div>
        
        </section>

        <section className={styles.filterPanel}>
          <div className={styles.filterButtons}>
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                className={`${styles.filterBtn} ${activeFilter === filter ? styles.filterBtnActive : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.classesList}>
          {filteredClasses.length === 0 ? (
            <p className={styles.empty}>No hay clases en esta categoría todavía.</p>
          ) : (
            filteredClasses.map((cls) => (
              <article key={cls.id} className={styles.classCard}>
                <div className={styles.classInfo}>
                  <div>
                    <span className={styles.classTag}>{cls.subject}</span>
                    <h2 className={styles.classTitle}>{cls.teacher}</h2>
                    <p className={styles.classMeta}>{cls.date} · {cls.time}</p>
                    <p className={styles.classMeta}>{cls.duration} · {cls.price}</p>
                  </div>
                </div>

                <div className={styles.classFooter}>
                  <Badge label={cls.status} variant={statusVariant(cls.status)} />
                  <div className={styles.cardActions}>
                    {cls.status === "Próximas" ? (
                      <Button variant="primary" size="sm" onClick={() => window.alert("Unirse a la clase")}>Unirse</Button>
                    ) : cls.status === "Completadas" ? (
                      <Button variant="secondary" size="sm" onClick={() => window.alert("Ver resumen de clase")}>Resumen</Button>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => window.alert("Reprogramar clase")}>Reprogramar</Button>
                    )}
                  </div>
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
