
import Api from "./Api";
const authService = {
  // POST /api/auth/login
  login: (email, password) =>
  Api.post("/auth/login", { email, password }),

verifyAccount: (email, code) =>
  Api.post("/auth/verify-email", { email, code }),

registerStudent: (data) =>
  Api.post("/auth/register/student", data),
  // POST /api/auth/register/teacher
  registerTeacher: (data) =>
    Api.post("/auth/register/teacher", data), 

  // POST /api/auth/forgotPassword
  forgotPassword: (email) =>
    Api.post("/auth/forgotPassword", { email }), 

  // POST /api/auth/verifyCode
  verifyCode: (email, code) =>
    Api.post("/auth/verify-email", { email, code }), 
 
  // POST /api/auth/resetPassword
  resetPassword: (email,token, newPassword) =>
    Api.post("/auth/resetPassword", { email,token, newPassword }), 
};


export default authService;