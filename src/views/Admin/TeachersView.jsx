import { useState, useEffect } from "react";
import adminService from "../../services/adminService"; // Asegúrate de que la ruta sea correcta
// Importa tus íconos, componentes (AppNavbar, IconSearch, etc.) y estilos (styles) aquí
import { useAuth } from "../../context/AuthContext";
import AppNavbar from "../../components/AppNavbar/AppNavbar"; import styles from "./TeachersView.module.css";
import { IconEye, IconEdit, IconTrash, IconSearch, IconPlus } from "../../components/Icons/Icons";
const ADMIN_NAV = [
  { label: "Inicio", path: "/admin/dashboard" },
  { label: "Profesores", path: "/admin/teachers" },
  { label: "Clases", path: "/admin/classes" },
  { label: "Reportes", path: "/admin/reports" },
];

// Mantenemos los estudiantes de prueba por ahora (hasta que conectes su endpoint)
const INITIAL_STUDENTS = [
  { id: 1, name: "Laura Salsedo", email: "laura@mail.com", date: "10-01-2026", status: "Activo" },
  { id: 2, name: "Laura Dominguez", email: "ldomin@mail.com", date: "10-01-2026", status: "Activo" },
  { id: 3, name: "Mariana García", email: "mariana@mail.com", date: "11-01-2026", status: "Inactivo" },
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

  // Estados para la data
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de los Modales
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newModal, setNewModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // El payload exacto para el CreateTeacherRequest de tu backend
  const [newForm, setNewForm] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
    yearsOfExperience: 0
  });
  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getTeachers();

      // Mapeamos lo que llega de UserDirectoryResponse a lo que tu tabla espera
      const mappedTeachers = res.data.map(t => ({
        id: t.userId,           // Coincide con 'userId' del record
        name: t.fullName,       // Coincide con 'fullName' del record
        email: t.email,         // Coincide con 'email' del record
        // Formateamos la ZonedDateTime a algo legible (dd-mm-yyyy)
        date: t.registrationDate ?
          new Date(t.registrationDate).toLocaleDateString("es-MX").replaceAll("/", "-") :
          "Sin fecha",
        status: t.status || "Activo"
      }));

      setTeachers(mappedTeachers);
    } catch (error) {
      console.error("Error al cargar profesores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /*
  useEffect(() => {
    loadTeachers();
  }, []);
*/
  // Preparar datos para la tabla
  const data = activeTab === "teachers" ? teachers : students;
  const filtered = data.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  // Controladores de Modales
  const openView = (person) => setViewModal(person);
  const openEdit = (person) => {
    setEditModal(person);
    setEditForm({ ...person });
    setFormErrors({});
  };
  const openDelete = (id) => setDeleteConfirm(id);

  const handleDelete = () => {
    // Aquí a futuro agregarás la llamada await adminService.deleteUser(deleteConfirm)
    if (activeTab === "teachers") {
      setTeachers((prev) => prev.filter((p) => p.id !== deleteConfirm));
    } else {
      setStudents((prev) => prev.filter((p) => p.id !== deleteConfirm));
    }
    setDeleteConfirm(null);
  };

  const handleEditSave = () => {
    // Aquí a futuro agregarás await adminService.updateProfile(...)
    const errors = {};
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!editForm.name.trim()) errors.name = "El nombre es requerido.";
    else if (!regexNombre.test(editForm.name.trim())) errors.name = "El nombre solo debe contener letras.";

    if (!editForm.email.trim()) errors.email = "El email es requerido.";
    else if (!editForm.email.endsWith("@nextword.com.mx")) errors.email = "Debe ser un correo @nextword.com.mx";

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
  const handleNewSave = async () => {
    const errors = {};
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    // 1. Validar Nombre
    if (!newForm.fullName.trim()) errors.fullName = "El nombre es requerido.";
    else if (!regexNombre.test(newForm.fullName.trim())) errors.fullName = "El nombre solo debe contener letras.";

    // 2. Validar Email con dominio .com.mx
    if (!newForm.email.trim()) errors.email = "El email es requerido.";
    else if (!newForm.email.endsWith("@nextword.com.mx")) {
      errors.email = "Debe ser un correo @nextword.com.mx";
    }

    // 3. Validar Password
    if (!newForm.password.trim() || newForm.password.length < 6) {
      errors.password = "Mínimo 6 caracteres.";
    }

    // NOTA: Eliminamos las validaciones de specialization y yearsOfExperience 
    // porque el usuario ya no los ve en el modal.

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Enviamos solo fullName, email y password
      await adminService.createTeacher({
        fullName: newForm.fullName,
        email: newForm.email,
        password: newForm.password
      });

      await loadTeachers(); // Recargar la tabla

      setNewModal(false);
      // Limpiar el formulario solo con los campos base
      setNewForm({ fullName: "", email: "", password: "" });
      setFormErrors({});
    } catch (error) {
      console.error("Error al crear profesor:", error);
      // Opcional: Si el backend devuelve un 400 porque el correo ya existe
      if (error.response?.status === 400) {
        setFormErrors({ email: "Este correo ya está registrado en el sistema." });
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* Asumiendo que tus componentes AppNavbar y los iconos están importados arriba */}
      <AppNavbar title="Panel de Administrador" navItems={ADMIN_NAV} activeItem="Profesores" />

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span> {/* Cambia por tu <IconSearch /> */}
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
                + Nuevo Profesor {/* Cambia por tu <IconPlus /> */}
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
              {isLoading ? (
                <tr><td colSpan={5} className={styles.emptyRow}>Cargando datos...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className={styles.emptyRow}>Sin resultados</td></tr>
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
                        <button className={styles.btnAction} onClick={() => openView(person)} title="Ver detalle">👁️</button>
                        <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => openEdit(person)} title="Editar">✏️</button>
                        <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => openDelete(person.id)} title="Eliminar">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL: VER */}
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

      {/* MODAL: EDITAR */}
      {editModal && (
        <Modal title="Editar" onClose={() => { setEditModal(null); setFormErrors({}); }}>
          {/* El modal de editar se mantiene intacto para tu tabla local */}
          <div className={styles.formGrid}>
            <label className={styles.formLabel}>Nombre</label>
            <div>
              <input className={styles.formInput} value={editForm.name} onChange={(e) => { setEditForm((p) => ({ ...p, name: e.target.value })); if (formErrors.name) setFormErrors(p => ({ ...p, name: null })); }} />
              {formErrors.name && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.name}</div>}
            </div>
            <label className={styles.formLabel}>Email</label>
            <div>
              <input className={styles.formInput} value={editForm.email} onChange={(e) => { setEditForm((p) => ({ ...p, email: e.target.value })); if (formErrors.email) setFormErrors(p => ({ ...p, email: null })); }} />
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

      {/* MODAL: NUEVO PROFESOR (CONECTADO AL BACKEND Y DTO) */}
      {newModal && (
        <Modal title="Nuevo Profesor" onClose={() => { setNewModal(false); setFormErrors({}); }}>
          <div className={styles.formGrid}>
            <label className={styles.formLabel}>Nombre</label>
            <div>
              <input
                className={styles.formInput}
                placeholder="Nombre completo"
                value={newForm.fullName}
                onChange={(e) => {
                  setNewForm((p) => ({ ...p, fullName: e.target.value }));
                  if (formErrors.fullName) setFormErrors(p => ({ ...p, fullName: null }));
                }}
              />
              {formErrors.fullName && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.fullName}</div>}
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

            <label className={styles.formLabel}>Contraseña</label>
            <div>
              <input
                type="password"
                className={styles.formInput}
                placeholder="Mínimo 6 caracteres"
                value={newForm.password}
                onChange={(e) => {
                  setNewForm((p) => ({ ...p, password: e.target.value }));
                  if (formErrors.password) setFormErrors(p => ({ ...p, password: null }));
                }}
              />
              {formErrors.password && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.password}</div>}
            </div>

            <label className={styles.formLabel}>Especialidad</label>
            <div>
              <input
                className={styles.formInput}
                placeholder="Ej. Gramática, Conversación..."
                value={newForm.specialization}
                onChange={(e) => {
                  setNewForm((p) => ({ ...p, specialization: e.target.value }));
                  if (formErrors.specialization) setFormErrors(p => ({ ...p, specialization: null }));
                }}
              />
              {formErrors.specialization && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.specialization}</div>}
            </div>

            <label className={styles.formLabel}>Experiencia</label>
            <div>
              <input
                type="number"
                min="0"
                className={styles.formInput}
                placeholder="Años"
                value={newForm.yearsOfExperience}
                onChange={(e) => {
                  setNewForm((p) => ({ ...p, yearsOfExperience: Number(e.target.value) }));
                  if (formErrors.yearsOfExperience) setFormErrors(p => ({ ...p, yearsOfExperience: null }));
                }}
              />
              {formErrors.yearsOfExperience && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.yearsOfExperience}</div>}
            </div>

            {/* Ocultamos el 'Estado' en la creación ya que tu Java AdminService siempre lo pone 'Activo' por defecto */}
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => { setNewModal(false); setFormErrors({}); }}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleNewSave}>Agregar Profesor</button>
          </div>
        </Modal>
      )}

      {/* MODAL: ELIMINAR */}
      {deleteConfirm !== null && (
        <Modal title="Confirmar eliminación" onClose={() => setDeleteConfirm(null)}>
          <p className={styles.deleteMsg}>¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
            <button className={styles.btnDanger} onClick={handleDelete}>Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeachersView;