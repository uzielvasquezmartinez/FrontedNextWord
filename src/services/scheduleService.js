import api from './Api'; // Tu instancia de Axios apuntando a localhost:8080

const getSchedulesByTeacher = (teacherId) => {
  // Llama al nuevo endpoint que acabas de agregar en tu ReservationController
  return api.get(`/reservations/teacher/${teacherId}`);
};

const scheduleService = {
  getSchedulesByTeacher
};

export default scheduleService;