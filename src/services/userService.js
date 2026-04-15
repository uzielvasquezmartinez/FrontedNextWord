import api from "./Api";

const userService = {
  // GET /api/users/me
  getUserAuth: () => api.get("/users/me"),

  // Alias semántico para perfil autenticado (admin/teacher/student)
  getMe: () => api.get("/users/me"),

  // Perfiles específicos por rol
  getStudentProfile: () => api.get("/students/me"),
  getTeacherProfile: () => api.get("/teachers/me"),

  // Gestión de usuario
  create: (data) => api.post("/users", data),
  updateProfile: (data) => api.put("/users/profile", data),
};

export default userService;
