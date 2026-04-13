import api from './Api';

const teacherService = {
  // GET /api/teachers
  getTeachers: () =>
    api.get('/teachers'),

  // GET /api/teachers/me
  getMyProfile: () =>
    api.get('/teachers/me'),

  // PUT /api/teachers/profile
  updateProfile: (data) =>
    api.put('/teachers/profile', data),
};

export default teacherService;