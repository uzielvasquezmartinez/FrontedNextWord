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
import StudentDashboard from "../views/Student/StudentDashboardView";
import StudentScheduleView from "../views/Student/StudentScheduleView";
import StudentClassesView from "../views/Student/StudentClassesView";
import CheckoutView        from "../views/Student/CheckoutView";
import PaymentSuccessView  from "../views/Student/PaymentSuccessView";
import PaymentFailureView  from "../views/Student/PaymentFailureView";
import ForgotPasswordView from "../views/ForgotPassword/ForgotPasswordView";
import VerifyCodeView     from "../views/ForgotPassword/VerifyCodeView";
import ResetPasswordView  from "../views/ForgotPassword/ResetPasswordView";
import MessagesView from "../views/Professor/MessagesView";
import StudentMessagesView from "../views/Student/StudentMessagesView";

// AnimatePresence necesita leer la location, por eso se separa en un componente interno
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

  {/* ── Públicas ── */}
<Route path="/login" element={
  <PageTransition type="slideUp"><LoginView /></PageTransition>
}/>
<Route path="/register" element={
  <PageTransition type="slideUp"><RegisterView /></PageTransition>
}/>
<Route path="/forgot-password" element={
  <PageTransition type="scale"><ForgotPasswordView /></PageTransition>
}/>
<Route path="/verify-code" element={
  <PageTransition type="scale"><VerifyCodeView /></PageTransition>
}/>
<Route path="/reset-password" element={
  <PageTransition type="scale"><ResetPasswordView /></PageTransition>
}/>

{/* ── Admin ── */}
<Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={["admin"]}>
    <PageTransition type="slide"><AdminDashboard /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/admin/teachers" element={
  <ProtectedRoute allowedRoles={["admin"]}>
    <PageTransition type="slide"><TeachersView /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/admin/classes" element={
  <ProtectedRoute allowedRoles={["admin"]}>
    <PageTransition type="slide"><ClassesView /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/admin/reports" element={
  <ProtectedRoute allowedRoles={["admin"]}>
    <PageTransition type="slide"><ReportsView /></PageTransition>
  </ProtectedRoute>
}/>

{/* ── Profesor ── */}

<Route path="/teacher/dashboard" element={
  <ProtectedRoute allowedRoles={["teacher"]}>
    <PageTransition type="slide"><ProfessorDashboard /></PageTransition>
  </ProtectedRoute>
} />
<Route path="/teacher/schedule" element={
  <ProtectedRoute allowedRoles={["teacher"]}>
    <PageTransition type="slide"><ScheduleView /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/teacher/messages" element={
  <ProtectedRoute allowedRoles={["teacher"]}>
    <PageTransition type="slide"><MessagesView /></PageTransition>
  </ProtectedRoute>
}/>

{/* ── Alumno ── */}
<Route path="/student/dashboard" element={
  <ProtectedRoute allowedRoles={["student"]}>
    <PageTransition type="slide"><StudentDashboard /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/student/schedule" element={
  <ProtectedRoute allowedRoles={["student"]}>
    <PageTransition type="slide"><StudentScheduleView /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/student/classes" element={
  <ProtectedRoute allowedRoles={["student"]}>
    <PageTransition type="slide"><StudentClassesView /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/student/checkout" element={
  <ProtectedRoute allowedRoles={["student"]}>
    <PageTransition type="slideUp"><CheckoutView /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/student/payment/success" element={
  <ProtectedRoute allowedRoles={["student"]}>
    <PageTransition type="scale"><PaymentSuccessView /></PageTransition>
  </ProtectedRoute>
}/>
<Route path="/student/payment/failure" element={
  <ProtectedRoute allowedRoles={["student"]}>
    <PageTransition type="scale"><PaymentFailureView /></PageTransition>
  </ProtectedRoute>
}/>

<Route path="/student/messages" element={
  <ProtectedRoute allowedRoles={["student"]}>
    <PageTransition type="slide"><StudentMessagesView /></PageTransition>
  </ProtectedRoute>
}/>




{/* ── Default ── */}
<Route path="*" element={<Navigate to="/login" replace />} />
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

