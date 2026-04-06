
import Api from "./Api";

const authService = {
  // POST /api/auth/login
  // Body: { email, password }
  // Response: { token }
  login: (email, password) =>
    Api.post("/auth/login", { email, password }),

  // POST /api/auth/verifyAccount
  // Body: { email, code }
  // Verifica el código enviado al email para activar la cuenta
  verifyAccount: (email, code) =>
    Api.post("/auth/verify-email", { email, code }),
  // POST /api/auth/register/student
  // Registra un nuevo estudiante
  registerStudent: (data) =>
    Api.post("/auth/register/student", data),

  // POST /api/auth/register/teacher
  // Registra un nuevo profesor
  registerTeacher: (data) =>
    Api.post("/auth/register/teacher", data),

  // POST /api/auth/forgotPassword
  // Contraseña olvidada: envía un email con un código de verificación
  forgotPassword: (email) =>
    Api.post("/auth/forgotPassword", { email }),

  // POST /api/auth/verifyCode
  // Body: { email, code }
  // Response (caso A): { token }  ← backend devuelve un token separado
  // Response (caso B): { valid: true } ← el código mismo ES el token
  verifyCode: (email, code) =>
    Api.post("/auth/verifyCode", { email, code }),
 
  // POST /api/auth/resetPassword
  // Recuperación de contraseña: recibe el token (o código) y la nueva contraseña
  resetPassword: (token, newPassword) =>
    Api.post("/auth/resetPassword", { token, newPassword }),
};

export default authService;