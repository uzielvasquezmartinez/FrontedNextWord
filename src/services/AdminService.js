import api from "./Api";

const adminService = {
    // GET /api/admin/da
    // shboard/stats -> Devuelve AdminDashboardResponse
    getDashboardStats: () =>
        api.get("/admin/dashboard/stats"),

    // GET /api/admin/users -> Devuelve List<UserDirectoryResponse>
    getUserDirectory: () =>
        api.get("/admin/users"),

    // Alias para compatibilidad con código existente
    getTeachers: () =>
        api.get("/admin/users"),

    // POST /api/admin/teachers -> Recibe CreateTeacherRequest
    createTeacher: (teacherData) =>
        api.post("/admin/teachers", teacherData),

    // PUT /api/admin/profile/{id} -> Recibe UpdateProfileRequest
    updateProfile: (id, profileData) =>
        api.put(`/admin/profile/${id}`, profileData),

    // PUT /api/admin/teachers/{id}/status?status=ACTIVE|INACTIVE
    toggleTeacherStatus: (id, status) =>
        api.put(`/admin/teachers/${id}/status`, null, { params: { status } }),

    // GET /api/admin/reports/financial
    getFinancialReports: () =>
        api.get("/admin/reports/financial"),

    // GET /api/admin/reports/export/pdf
    exportFinancialReportPdf: () =>
        api.get("/admin/reports/export/pdf", { responseType: "blob" }),

    // GET /api/admin/classes/history -> Historial de clases para admin
    getClassHistory: () =>
        api.get("/admin/classes/history"),

};

export default adminService;
