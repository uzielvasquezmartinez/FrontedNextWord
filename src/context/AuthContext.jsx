import { createContext, useContext, useState } from "react";
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
  admin:   "/admin/dashboard",
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

  // ── Login ──────────────────────────────────────────────────────
  const login = async (email, password) => {
    if (!email || !password)
      return { success: false, message: "Completa todos los campos." };

    try {
      // 1. Obtiene el token
      const res   = await authService.login(email, password);
      const token = res.data.token;

      // 2. Guarda el token para que el interceptor lo use
      localStorage.setItem("token", token);

      // 3. Llama a /users/me para obtener rol y nombre
      const meRes  = await userService.getMe();
      const me     = meRes.data;
      const role   = ROLE_MAP[me.roleId] ?? "student";
      const name   = me.fullName ?? email;

      // 4. Persiste el usuario completo
      const loggedUser = { token, email: me.email, role, name, id: me.id };
      localStorage.setItem("user", JSON.stringify(loggedUser));
      setUser(loggedUser);

      // 5. Redirige según el rol
      navigate(ROLE_REDIRECTS[role] ?? "/login");
      return { success: true };

    } catch (error) {
      // Limpia el token si algo falla
      localStorage.removeItem("token");
      const message = error.response?.data?.message
        ?? error.response?.data
        ?? "Credenciales incorrectas.";
      return { success: false, message };
    }
  };




  // ── Registro Estudiante ────────────────────────────────────────
  const registerStudent = async (data) => {
    try {
      await authService.registerStudent(data);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message
        ?? error.response?.data
        ?? "Error al registrar estudiante.";
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
  try {
    await authService.verifyCode(email, code);
    return { success: true, token: code };
  } catch (error) {
    const message =
      error.response?.data?.message ??
      error.response?.data ??
      "Código incorrecto o expirado.";
    return { success: false, message };
  }
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
  const resetPassword = async (token, newPassword) => {
    try {
      await authService.resetPassword(token, newPassword);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message
        ?? error.response?.data
        ?? "Error al restablecer la contraseña.";
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