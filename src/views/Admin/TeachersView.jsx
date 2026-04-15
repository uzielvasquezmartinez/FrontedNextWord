import { useState, useEffect } from "react";
import adminService from "../../services/AdminService"; // AsegÃºrate de que la ruta sea correcta
// Importa tus Ã­conos, componentes (AppNavbar, IconSearch, etc.) y estilos (styles) aquÃ­
import AppNavbar from "../../components/AppNavbar/AppNavbar"; import styles from "./TeachersView.module.css";
import { IconEye, IconEdit, IconTrash, IconSearch, IconPlus } from "../../components/Icons/Icons";
const ADMIN_NAV = [
  { label: "Inicio", path: "/admin/dashboard" },
  { label: "Profesores", path: "/admin/teachers" },
  { label: "Clases", path: "/admin/classes" },
  { label: "Reportes", path: "/admin/reports" },
];

const ROLE_STUDENT = 1;
const ROLE_TEACHER = 2;

const Modal = ({ title, onClose, children }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <button className={styles.modalClose} onClick={onClose} type="button">X</button>
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
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de los Modales
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newModal, setNewModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // El administrador solo captura los datos base de acceso del profesor.
  const [newForm, setNewForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const loadDirectory = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getUserDirectory();

      const rows = Array.isArray(res.data) ? res.data : [];
      const mappedUsers = rows.map((u) => ({
        id: u.userId,
        name: u.fullName,
        email: u.email,
        roleId: u.roleId,
        date: u.registrationDate
          ? new Date(u.registrationDate).toLocaleDateString("es-MX").replaceAll("/", "-")
          : "Sin fecha",
        status: u.status || "Activo",
      }));

      setTeachers(mappedUsers.filter((u) => u.roleId === ROLE_TEACHER));
      setStudents(mappedUsers.filter((u) => u.roleId === ROLE_STUDENT));
    } catch (error) {
      console.error("Error al cargar directorio de usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);
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
    // AquÃ­ a futuro agregarÃ¡s la llamada await adminService.deleteUser(deleteConfirm)
    if (activeTab === "teachers") {
      setTeachers((prev) => prev.filter((p) => p.id !== deleteConfirm));
    } else {
      setStudents((prev) => prev.filter((p) => p.id !== deleteConfirm));
    }
    setDeleteConfirm(null);
  };

  const handleEditSave = async () => {
    const errors = {};
    const regexNombre = /^[a-zA-ZÃ¡Ã©Ã­Ã³ÃºÃÃ‰ÃÃ“ÃšÃ±Ã‘\s]+$/;

    if (!editForm.name.trim()) errors.name = "El nombre es requerido.";
    else if (!regexNombre.test(editForm.name.trim())) errors.name = "El nombre solo debe contener letras.";

    if (!editForm.email.trim()) errors.email = "El email es requerido.";
    else if (!editForm.email.endsWith("@nextword.com.mx")) errors.email = "Debe ser un correo @nextword.com.mx";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (activeTab === "teachers") {
        await adminService.updateProfile(editModal.id, {
          fullName: editForm.name?.trim() || "",
          phoneNumber: editForm.phoneNumber?.trim() || "",
          profilePicture: editForm.profilePicture?.trim() || "",
        });
        setTeachers((prev) => prev.map((p) => p.id === editModal.id ? { ...p, ...editForm } : p));
      } else {
        setStudents((prev) => prev.map((p) => p.id === editModal.id ? { ...p, ...editForm } : p));
      }

      setEditModal(null);
      setFormErrors({});
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setFormErrors((prev) => ({
        ...prev,
        general: "No se pudo actualizar el perfil. Intenta nuevamente.",
      }));
    }
  };
  const handleNewSave = async () => {
    const errors = {};
    const regexNombre = /^[a-zA-ZÃ¡Ã©Ã­Ã³ÃºÃÃ‰ÃÃ“ÃšÃ±Ã‘\s]+$/;

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
      errors.password = "Maximo 6 caracteres.";
    }

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

      await loadDirectory(); // Recargar la tabla

      setNewModal(false);
      // Limpiar el formulario solo con los campos base
      setNewForm({ fullName: "", email: "", password: "" });
      setFormErrors({});
    } catch (error) {
      console.error("Error al crear profesor:", error);
      // Opcional: Si el backend devuelve un 400 porque el correo ya existe
      if (error.response?.status === 400) {
        setFormErrors({ email: "Este correo ya estÃ¡ registrado en el sistema." });
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* Asumiendo que tus componentes AppNavbar y los iconos estÃ¡n importados arriba */}
      <AppNavbar title="Panel de Administrador" navItems={ADMIN_NAV} activeItem="Profesores" />

      <main className={styles.main}>
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
                        <button className={styles.btnAction} onClick={() => openView(person)} title="Ver detalle"><IconEye /></button>
                        {activeTab === "teachers" && (
                          <>
                            <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => openEdit(person)} title="Editar"><IconEdit /></button>
                            <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => openDelete(person.id)} title="Eliminar"><IconTrash /></button>
                          </>
                        )}
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
            {formErrors.general && <div style={{ color: '#dc3545', fontSize: '0.85rem' }}>{formErrors.general}</div>}
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => { setEditModal(null); setFormErrors({}); }}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleEditSave}>Guardar</button>
          </div>
        </Modal>
      )}

      {/* MODAL: NUEVO PROFESOR (CONECTADO AL BACKEND Y DTO) */}
      {newModal && (
        <Modal
          title="Nuevo Profesor"
          onClose={() => {
            setNewModal(false);
            setFormErrors({});
            setNewForm({ fullName: "", email: "", password: "" });
          }}
        >
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
                placeholder="correo@nextword.com.mx"
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
                placeholder="MÃ­nimo 6 caracteres"
                value={newForm.password}
                onChange={(e) => {
                  setNewForm((p) => ({ ...p, password: e.target.value }));
                  if (formErrors.password) setFormErrors(p => ({ ...p, password: null }));
                }}
              />
              {formErrors.password && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.password}</div>}
            </div>

          </div>
          <div className={styles.modalFooter}>
            <button
              className={styles.btnSecondary}
              onClick={() => {
                setNewModal(false);
                setFormErrors({});
                setNewForm({ fullName: "", email: "", password: "" });
              }}
            >
              Cancelar
            </button>
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

