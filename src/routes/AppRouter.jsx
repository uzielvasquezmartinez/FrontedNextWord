import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute    from "../components/ProtectedRoute/ProtectedRoute";
import PageTransition    from "../components/PageTransition/PageTransition";
import LoginView         from "../views/Login/LoginView";
import RegisterView      from "../views/Register/RegisterView";
import AdminDashboard    from "../views/Admin/AdminDashboard";
import TeachersView      from "../views/Admin/TeachersView";
import ClassesView       from "../views/Admin/ClassesView";
import ReportsView       from "../views/Admin/ReportsView";
import ProfessorDashboard from "../views/Professor/ProfessorDashboard";
import ScheduleView from "../views/Professor/ScheduleView";
import ForgotPasswordView from "../views/ForgotPassword/ForgotPasswordView";
import VerifyCodeView     from "../views/ForgotPassword/VerifyCodeView";
import ResetPasswordView  from "../views/ForgotPassword/ResetPasswordView";
import MessagesView from "../views/Professor/MessagesView";

// AnimatePresence necesita leer la location, por eso se separa en un componente interno
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

       {/* ── Públicas ── */}
<Route path="/login" element={
  <PageTransition><LoginView /></PageTransition>
}/>
<Route path="/register" element={
  <PageTransition><RegisterView /></PageTransition>
}/>
   {/*Recuperación de contraseña */}
<Route path="/forgot-password" element={
  <PageTransition><ForgotPasswordView /></PageTransition>
} />
<Route path="/verify-code" element={
  <PageTransition><VerifyCodeView /></PageTransition>
} />
<Route path="/reset-password" element={
  <PageTransition><ResetPasswordView /></PageTransition>
} />
{/* ── Admin ── */}
<Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={["admin"]}>
    <PageTransition><AdminDashboard /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/admin/teachers" element={
  <ProtectedRoute allowedRoles={["admin"]}>
    <PageTransition><TeachersView /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/admin/classes" element={
  <ProtectedRoute allowedRoles={["admin"]}>
    <PageTransition><ClassesView /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/admin/reports" element={
  <ProtectedRoute allowedRoles={["admin"]}>
    <PageTransition><ReportsView /></PageTransition>
  </ProtectedRoute>
}/>

{/* ── Profesor ── */}
<Route path="/teacher/dashboard" element={
  <ProtectedRoute allowedRoles={["teacher"]}>
    <PageTransition><ProfessorDashboard /></PageTransition>
  </ProtectedRoute>
}/>

{/* Ruta de mensajeria */}
<Route path="/teacher/messages" element={
  <ProtectedRoute allowedRoles={["teacher"]}>
    <PageTransition><MessagesView /></PageTransition>
  </ProtectedRoute>
}/>
{/* ── Default ── */}
<Route path="*" element={<Navigate to="/login" replace />} />
<Route path="/teacher/dashboard" element={
  <ProtectedRoute allowedRoles={["teacher"]}>
    <ProfessorDashboard />
  </ProtectedRoute>
} />
<Route path="/teacher/schedule" element={
  <ProtectedRoute allowedRoles={["teacher"]}>
    <PageTransition><ScheduleView /></PageTransition>
  </ProtectedRoute>
}/>
      </Routes>
    </AnimatePresence>
  );
};

const AppRouter = () => (
  <BrowserRouter>
    <AuthProvider>
      <AnimatedRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default AppRouter;

