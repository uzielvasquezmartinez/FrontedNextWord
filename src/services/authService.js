
import Api from "./Api";

const authService = {
  // POST /api/auth/login
  // Body: { email, password }
  // Response: { token }
  login: (email, password) =>
    Api.post("/auth/login", { email, password }),

  // POST /api/auth/register/student
  // Body: { email, password, fullName, phoneNumber, dateOfBirth, tutorName, tutorContact }
  registerStudent: (data) =>
    Api.post("/auth/register/student", data),

  // POST /api/auth/register/teacher
  // Body: { email, password, fullName, phoneNumber, specialization, yearsOfExperience, professionalDescription, certifications, hourlyRate }
  registerTeacher: (data) =>
    Api.post("/auth/register/teacher", data),

  // POST /api/auth/forgotPassword
  // Body: { email }
  forgotPassword: (email) =>
    Api.post("/auth/forgotPassword", { email }),

  // POST /api/auth/verifyCode
  // Body: { email, code }
  // Response (caso A): { token }  ← backend devuelve un token separado
  // Response (caso B): { valid: true } ← el código mismo ES el token
  verifyCode: (email, code) =>
    Api.post("/auth/verifyCode", { email, code }),
 
  // POST /api/auth/resetPassword
  // Body: { token, newPassword }
  resetPassword: (token, newPassword) =>
    Api.post("/auth/resetPassword", { token, newPassword }),
};

export default authService;