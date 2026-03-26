import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import styles from "./TeachersView.module.css";
import { IconEye, IconEdit, IconTrash, IconSearch, IconPlus } from "../../components/Icons/Icons";

const ADMIN_NAV = [
  { label: "Inicio",     path: "/admin/dashboard" },
  { label: "Profesores", path: "/admin/teachers"  },
  { label: "Clases",     path: "/admin/classes"   },
  { label: "Reportes",   path: "/admin/reports"   },
];

const INITIAL_TEACHERS = [
  { id: 1, name: "Erick Gomez Ñoño", email: "erickgome@Nextword.com", date: "09-01-2026", status: "Activo" },
  { id: 2, name: "Erick Gomez Ñoño", email: "erickgome@Nextword.com", date: "09-01-2026", status: "Activo" },
  { id: 3, name: "Erick Gomez Ñoño", email: "erickgome@Nextword.com", date: "09-01-2026", status: "Activo" },
  { id: 4, name: "Erick Gomez Ñoño", email: "erickgome@Nextword.com", date: "09-01-2026", status: "Inactivo" },
];

const INITIAL_STUDENTS = [
  { id: 1, name: "Laura Salsedo",    email: "laura@mail.com",   date: "10-01-2026", status: "Activo" },
  { id: 2, name: "Laura Dominguez",  email: "ldomin@mail.com",  date: "10-01-2026", status: "Activo" },
  { id: 3, name: "Mariana García",   email: "mariana@mail.com", date: "11-01-2026", status: "Inactivo" },
];

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

const TeachersView = () => {
  const [activeTab, setActiveTab] = useState("teachers");
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);

  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [newModal, setNewModal] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", email: "", status: "Activo" });

  const [formErrors, setFormErrors] = useState({});

  const data = activeTab === "teachers" ? teachers : students;

  const filtered = data.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  const openView = (person) => setViewModal(person);
  const openEdit = (person) => { 
    setEditModal(person); 
    setEditForm({ ...person }); 
    setFormErrors({});
  };
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
    const errors = {};
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!editForm.name.trim()) errors.name = "El nombre es requerido.";
    else if (!regexNombre.test(editForm.name.trim())) errors.name = "El nombre solo debe contener letras.";

    if (!editForm.email.trim()) errors.email = "El email es requerido.";
    else if (!editForm.email.endsWith("@nextword.com")) errors.email = "Debe ser un correo @nextword.com";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (activeTab === "teachers") {
      setTeachers((prev) => prev.map((p) => p.id === editModal.id ? { ...p, ...editForm } : p));
    } else {
      setStudents((prev) => prev.map((p) => p.id === editModal.id ? { ...p, ...editForm } : p));
    }
    setEditModal(null);
    setFormErrors({});
  };

  const handleNewSave = () => {
    const errors = {};
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!newForm.name.trim()) errors.name = "El nombre es requerido.";
    else if (!regexNombre.test(newForm.name.trim())) errors.name = "El nombre solo debe contener letras.";

    if (!newForm.email.trim()) errors.email = "El email es requerido.";
    else if (!newForm.email.endsWith("@nextword.com")) errors.email = "Debe ser un correo @nextword.com";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

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
    setFormErrors({});
  };

  return (
    <div className={styles.page}>
      <AppNavbar title="Panel de Administrador" navItems={ADMIN_NAV} activeItem="Profesores" />

      <main className={styles.main}>
        <p className={styles.sectionLabel}></p>

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
           
          <div className={styles.toolbarRight}>
            {activeTab === "teachers" && (
              <button className={styles.btnNew} onClick={() => { setNewModal(true); setFormErrors({}); }}>
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
        <Modal title="Editar" onClose={() => { setEditModal(null); setFormErrors({}); }}>
          <div className={styles.formGrid}>
            <label className={styles.formLabel}>Nombre</label>
            <div>
              <input 
                className={styles.formInput} 
                value={editForm.name} 
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, name: e.target.value }));
                  if (formErrors.name) setFormErrors(p => ({ ...p, name: null }));
                }} 
              />
              {formErrors.name && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.name}</div>}
            </div>

            <label className={styles.formLabel}>Email</label>
            <div>
              <input 
                className={styles.formInput} 
                value={editForm.email} 
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, email: e.target.value }));
                  if (formErrors.email) setFormErrors(p => ({ ...p, email: null }));
                }} 
              />
              {formErrors.email && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.email}</div>}
            </div>

            <label className={styles.formLabel}>Estado</label>
            <select className={styles.formInput} value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => { setEditModal(null); setFormErrors({}); }}>Cancelar</button>
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
        <Modal title="Nuevo Profesor" onClose={() => { setNewModal(false); setFormErrors({}); }}>
          <div className={styles.formGrid}>
            <label className={styles.formLabel}>Nombre</label>
            <div>
              <input 
                className={styles.formInput} 
                placeholder="Nombre completo" 
                value={newForm.name} 
                onChange={(e) => {
                  setNewForm((p) => ({ ...p, name: e.target.value }));
                  if (formErrors.name) setFormErrors(p => ({ ...p, name: null }));
                }} 
              />
              {formErrors.name && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.name}</div>}
            </div>

            <label className={styles.formLabel}>Email</label>
            <div>
              <input 
                className={styles.formInput} 
                placeholder="correo@nextword.com" 
                value={newForm.email} 
                onChange={(e) => {
                  setNewForm((p) => ({ ...p, email: e.target.value }));
                  if (formErrors.email) setFormErrors(p => ({ ...p, email: null }));
                }} 
              />
              {formErrors.email && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.email}</div>}
            </div>

            <label className={styles.formLabel}>Estado</label>
            <select className={styles.formInput} value={newForm.status} onChange={(e) => setNewForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => { setNewModal(false); setFormErrors({}); }}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleNewSave}>Agregar</button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default TeachersView;