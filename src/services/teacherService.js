import api from './Api';

const teacherService = {
  // GET /api/users/teachers
  getTeachers: () =>
    api.get('/users/teachers'),

  // GET /api/teachers/me
  getMyProfile: () =>
    api.get('/teachers/me'),

  // PUT /api/teachers/profile
  updateProfile: (data) =>
    api.put('/teachers/profile', data),
};

export default teacherService;