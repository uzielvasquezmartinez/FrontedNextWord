import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

// credenciales por rol
const MOCK_USERS = [
  { email: "admin@nextword.com",    password: "admin123",    role: "admin",   name: "Administrador", redirect: "/admin/dashboard"   },
  { email: "profesor@nextword.com", password: "profesor123", role: "teacher", name: "Profesor Uzi",  redirect: "/teacher/dashboard" },
  { email: "Uzielito@nextword.com", password: "Uzielito123", role: "student", name: "Uzielito",  redirect: "/student/dashboard" }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: "Completa todos los campos." };
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) {
      return { success: false, message: "Credenciales incorrectas." };
    }

    const mockUser = { email: found.email, role: found.role, name: found.name };
    setUser(mockUser);
    navigate(found.redirect);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};