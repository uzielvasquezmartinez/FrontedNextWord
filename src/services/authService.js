
import api from "./Api";
const authService = {
  // POST /api/auth/login
  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  verifyAccount: (email, code) =>
    api.post("/auth/verify-email", { email, code }),

  registerStudent: (data) =>
    api.post("/auth/register/student", data),
  // POST /api/auth/register/teacher
  registerTeacher: (data) =>
    api.post("/auth/register/teacher", data),

  // POST /api/auth/forgotPassword
  forgotPassword: (email) =>
    api.post("/auth/forgotPassword", { email }),

  // POST /api/auth/verifyCode
  verifyCode: (email, code) =>
    api.post("/auth/verify-email", { email, code }),

  // POST /api/auth/resetPassword
  resetPassword: (email, token, newPassword) =>
    api.post("/auth/resetPassword", { email, token, newPassword }),
};


export default authService;
