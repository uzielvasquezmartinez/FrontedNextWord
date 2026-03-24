import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import styles from "./TeachersView.module.css";

const ADMIN_NAV = [
  { label: "Inicio",     path: "/admin/dashboard" },
  { label: "Profesores", path: "/admin/teachers"  },
  { label: "Clases",     path: "/admin/classes"   },
  { label: "Reportes",   path: "/admin/reports"   },
];
const INITIAL_TEACHERS = [
  { id: 1, name: "Erick Gomez Ñoño", email: "erickgome@sist.com", date: "09-01-2026", status: "Activo" },
  { id: 2, name: "Erick Gomez Ñoño", email: "erickgome@sist.com", date: "09-01-2026", status: "Activo" },
  { id: 3, name: "Erick Gomez Ñoño", email: "erickgome@sist.com", date: "09-01-2026", status: "Activo" },
  { id: 4, name: "Erick Gomez Ñoño", email: "erickgome@sist.com", date: "09-01-2026", status: "Inactivo" },
];

const INITIAL_STUDENTS = [
  { id: 1, name: "Laura Salsedo",    email: "laura@mail.com",   date: "10-01-2026", status: "Activo" },
  { id: 2, name: "Laura Dominguez",  email: "ldomin@mail.com",  date: "10-01-2026", status: "Activo" },
  { id: 3, name: "Mariana García",   email: "mariana@mail.com", date: "11-01-2026", status: "Inactivo" },
];

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

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
const TeachersView = () => {
  const [activeTab, setActiveTab]     = useState("teachers"); // "teachers" | "students"
  const [search, setSearch]           = useState("");
  const [teachers, setTeachers]       = useState(INITIAL_TEACHERS);
  const [students, setStudents]       = useState(INITIAL_STUDENTS);

  // Modales
  const [viewModal, setViewModal]     = useState(null);  // persona seleccionada
  const [editModal, setEditModal]     = useState(null);  // persona seleccionada
  const [editForm, setEditForm]       = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id a eliminar

  // Modal nuevo profesor
  const [newModal, setNewModal]       = useState(false);
  const [newForm, setNewForm]         = useState({ name: "", email: "", status: "Activo" });

  const data = activeTab === "teachers" ? teachers : students;

  const filtered = data.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Handlers ──────────────────────────────────────────────────

  const openView = (person) => setViewModal(person);
  const openEdit = (person) => { setEditModal(person); setEditForm({ ...person }); };
  const openDelete = (id) => setDeleteConfirm(id);

  const handleDelete = () => {
    if (activeTab === "teachers") {
      setTeachers((prev) => prev.filter((p) => p.id !== deleteConfirm));
    } else {
      setStudents((prev) => prev.filter((p) => p.id !== deleteConfirm));
    }
    setDeleteConfirm(null);
  };

  const handleEditSave = () => {
    if (activeTab === "teachers") {
      setTeachers((prev) => prev.map((p) => p.id === editModal.id ? { ...p, ...editForm } : p));
    } else {
      setStudents((prev) => prev.map((p) => p.id === editModal.id ? { ...p, ...editForm } : p));
    }
    setEditModal(null);
  };

  const handleNewSave = () => {
    if (!newForm.name || !newForm.email) return;
    const newPerson = {
      id: Date.now(),
      name: newForm.name,
      email: newForm.email,
      date: new Date().toLocaleDateString("es-MX").replaceAll("/", "-"),
      status: newForm.status,
    };
    setTeachers((prev) => [...prev, newPerson]);
    setNewModal(false);
    setNewForm({ name: "", email: "", status: "Activo" });
  };

  return (
    <div className={styles.page}>

<AppNavbar title="Panel de Administrador" navItems={ADMIN_NAV} activeItem="Profesores" />

      {/* ════ CONTENIDO ════ */}
      <main className={styles.main}>
        <p className={styles.sectionLabel}></p>

        {/* Barra de herramientas */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><IconSearch /></span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
           
        {/* Modal del profesor/estudiante*/}
<div className={styles.toolbarRight}>
  {activeTab === "teachers" && (
    <button className={styles.btnNew} onClick={() => setNewModal(true)}>
      <IconPlus /> Nuevo Profesor
    </button>
  )}
            <div className={styles.toggle}>
              <button
                className={`${styles.toggleBtn} ${activeTab === "teachers" ? styles.toggleActive : ""}`}
                onClick={() => setActiveTab("teachers")}
              >
                Profesores
              </button>
              <button
                className={`${styles.toggleBtn} ${activeTab === "students" ? styles.toggleActive : ""}`}
                onClick={() => setActiveTab("students")}
              >
                Estudiantes
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Nombre</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Registro</th>
                <th className={styles.th}>Estado</th>
                <th className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>Sin resultados</td>
                </tr>
              ) : (
                filtered.map((person) => (
                  <tr key={person.id} className={styles.tr}>
                    <td className={styles.td}>{person.name}</td>
                    <td className={styles.td}>{person.email}</td>
                    <td className={styles.td}>{person.date}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${person.status === "Activo" ? styles.badgeActive : styles.badgeInactive}`}>
                        {person.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <button className={styles.btnAction} onClick={() => openView(person)} title="Ver detalle">
                          <IconEye />
                        </button>
                        <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => openEdit(person)} title="Editar">
                          <IconEdit />
                        </button>
                        <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => openDelete(person.id)} title="Eliminar">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {viewModal && (
        <Modal title="Detalle" onClose={() => setViewModal(null)}>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Nombre</span>
            <span className={styles.detailValue}>{viewModal.name}</span>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{viewModal.email}</span>
            <span className={styles.detailLabel}>Registro</span>
            <span className={styles.detailValue}>{viewModal.date}</span>
            <span className={styles.detailLabel}>Estado</span>
            <span className={`${styles.badge} ${viewModal.status === "Activo" ? styles.badgeActive : styles.badgeInactive}`}>
              {viewModal.status}
            </span>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => setViewModal(null)}>Cerrar</button>
          </div>
        </Modal>
      )}

      {editModal && (
        <Modal title="Editar" onClose={() => setEditModal(null)}>
          <div className={styles.formGrid}>
            <label className={styles.formLabel}>Nombre</label>
            <input className={styles.formInput} value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
            <label className={styles.formLabel}>Email</label>
            <input className={styles.formInput} value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
            <label className={styles.formLabel}>Estado</label>
            <select className={styles.formInput} value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => setEditModal(null)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleEditSave}>Guardar</button>
          </div>
        </Modal>
      )}

      {deleteConfirm !== null && (
        <Modal title="Confirmar eliminación" onClose={() => setDeleteConfirm(null)}>
          <p className={styles.deleteMsg}>¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
            <button className={styles.btnDanger} onClick={handleDelete}>Eliminar</button>
          </div>
        </Modal>
      )}

      {newModal && (
        <Modal title="Nuevo Profesor" onClose={() => setNewModal(false)}>
          <div className={styles.formGrid}>
            <label className={styles.formLabel}>Nombre</label>
            <input className={styles.formInput} placeholder="Nombre completo" value={newForm.name} onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))} />
            <label className={styles.formLabel}>Email</label>
            <input className={styles.formInput} placeholder="correo@ejemplo.com" value={newForm.email} onChange={(e) => setNewForm((p) => ({ ...p, email: e.target.value }))} />
            <label className={styles.formLabel}>Estado</label>
            <select className={styles.formInput} value={newForm.status} onChange={(e) => setNewForm((p) => ({ ...p, status: e.target.value }))}>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => setNewModal(false)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleNewSave}>Agregar</button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default TeachersView;
