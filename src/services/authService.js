/*import api from "./api";

const authService = {
  // POST /api/auth/login
  // Body: { email, password }
  // Response: { token }
  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  // POST /api/auth/register/student
  // Body: { email, password, fullName, phoneNumber, dateOfBirth, tutorName, tutorContact }
  registerStudent: (data) =>
    api.post("/auth/register/student", data),

  // POST /api/auth/register/teacher
  // Body: { email, password, fullName, phoneNumber, specialization, yearsOfExperience, professionalDescription, certifications, hourlyRate }
  registerTeacher: (data) =>
    api.post("/auth/register/teacher", data),

  // POST /api/auth/forgotPassword
  // Body: { email }
  forgotPassword: (email) =>
    api.post("/auth/forgotPassword", { email }),

  // POST /api/auth/resetPassword
  // Body: { token, newPassword }
  resetPassword: (token, newPassword) =>
    api.post("/auth/resetPassword", { token, newPassword }),
};

export default authService;*/