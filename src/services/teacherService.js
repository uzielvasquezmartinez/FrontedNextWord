import api from './Api'; // Importa tu configuración de Axios (la que apunta a tu backend/ngrok)

const getTeachers = () => {
  // Llama exactamente al endpoint que creamos en UserController
  return api.get('/users/teachers');
};

const teacherService = {
  getTeachers
};

export default teacherService;