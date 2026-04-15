import api from "./Api";

const adminService = {
    // GET /api/admin/dashboard/stats -> Devuelve AdminDashboardResponse
    getDashboardStats: () =>
        api.get("/admin/dashboard/stats"),

    // POST /api/admin/teachers -> Recibe CreateTeacherRequest
    createTeacher: (teacherData) =>
        api.post("/admin/teachers", teacherData),

    // PUT /api/admin/profile/{id} -> Recibe UpdateProfileRequest
    updateProfile: (id, profileData) =>
        api.put(`/admin/profile/${id}`, profileData),

};

export default adminService;