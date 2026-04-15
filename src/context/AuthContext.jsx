import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import userService from "../services/userService";
const AuthContext = createContext(null);

// ── Mapa de roleId a nombre de rol ───────────────────────────────
const ROLE_MAP = {
  1: "student",
  2: "teacher",
  3: "admin",
};

// ── Mapa de roles a rutas ────────────────────────────────────────
const ROLE_REDIRECTS = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Persiste sesión si hay datos en localStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── Helper: Procesa y guarda los datos del usuario ──────────────
  const saveUserProfile = useCallback((me, tokenArg) => {
    const token = tokenArg || localStorage.getItem("token");
    const role = ROLE_MAP[me.roleId] ?? "student";
    const name = me.fullName ?? me.email;
    const loggedUser = {
      token,
      email: me.email,
      role,
      name,
      id: me.id,
      photo: me.profilePicture, // Opcional: añadir foto si el sidebar la usa
      walletBalance: me.walletBalance ?? me.saldoFavor ?? me.saldo_favor ?? 0
    };
    localStorage.setItem("user", JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  }, []);

  // ── Sincronizar datos con el servidor (Refresh) ──────────────────
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const meRes = await userService.getUserAuth();
      saveUserProfile(meRes.data, token);
    } catch (error) {
      console.error("Error sincronizando perfil:", error);
      // Si el error es de autenticación (401), cerramos sesión
      if (error.response?.status === 401) {
        logout();
      }
    }
  }, [saveUserProfile]);

  // Sincronización automática al cargar la app o refrescar la página
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refreshUser();
    }
  }, []); // Solo al montar

  // ── Login ──────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      // 1. Obtener Token
      const res = await authService.login(email, password);
      const token = res.data.token;
      localStorage.setItem("token", token);

      // 2. Obtener datos de la cuenta (UserController -> /api/users/me)
      const meRes = await userService.getUserAuth();
      const rawData = meRes.data; // { id, email, fullName, roleId }

      // 3. Traducir roleId usando tu mapa
      const userRole = ROLE_MAP[rawData.roleId]; // resultará en "admin", "teacher" o "student"

      // 4. Cargar perfil extendido (Evita el 404 al filtrar por rol)
      let profileData = {};
      if (userRole === "student") {
        const studRes = await userService.getStudentProfile();
        profileData = studRes.data;
      } else if (userRole === "teacher") {
        const teachRes = await userService.getTeacherProfile();
        profileData = teachRes.data;
      }
      // Si es "admin", no entra a ninguno y no dispara peticiones innecesarias

      // 5. Consolidar el usuario y guardar
      const finalUser = {
        ...rawData,
        ...profileData,
        role: userRole
      };

      saveUserProfile(finalUser, token); // Función que guarda en state y localStorage

      // 6. Redirigir usando tu ROLE_REDIRECTS
      const path = ROLE_REDIRECTS[userRole] || "/login";
      navigate(path);

      return { success: true };

    } catch (error) {
      console.error("Error en el login centralizado:", error);
      localStorage.removeItem("token");
      return { success: false, message: "No se pudo iniciar sesión." };
    }
  };


  // ── Registro Estudiante ────────────────────────────────────────
  const registerStudent = async (data) => {
    try {
      await authService.registerStudent(data);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ??
        error.response?.data?.error ??
        (typeof error.response?.data === "string"
          ? error.response.data
          : "Error al registrar estudiante.");
      return { success: false, message };
    }
  };

  // ── Registro Profesor ──────────────────────────────────────────
  const registerTeacher = async (data) => {
    try {
      await authService.registerTeacher(data);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message
        ?? error.response?.data
        ?? "Error al registrar profesor.";
      return { success: false, message };
    }
  };

  // ── Forgot Password ────────────────────────────────────────────
  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message
        ?? error.response?.data
        ?? "Error al enviar el correo.";
      return { success: false, message };
    }
  };

  // ── Verify Code (Forgot Password) ─────────────────────────────
  const verifyCode = async (email, code) => {

    return { success: true, token: code };
  };

  const verifyAccount = async (email, code) => {
    try {
      const res = await authService.verifyAccount(email, code);
      return { success: true, message: res.data };
    } catch (error) {
      const message =
        error.response?.data?.message ??
        error.response?.data ??
        "Código incorrecto o expirado.";
      return { success: false, message };
    }
  };

  // ── Reset Password ─────────────────────────────────────────────
  const resetPassword = async (email, token, newPassword) => {
    try {
      // 1. Delegamos la petición a tu servicio
      await authService.resetPassword(email, token, newPassword);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message
        ?? error.response?.data?.error // <-- Agrega esta línea para buscar la llave 'error'
        ?? (typeof error.response?.data === 'string' ? error.response.data : "Error al restablecer la contraseña.");
      return { success: false, message };
    }
  };

  // ── Logout ─────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      refreshUser,
      registerStudent,
      registerTeacher,
      forgotPassword,
      verifyCode,
      verifyAccount,
      resetPassword,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};