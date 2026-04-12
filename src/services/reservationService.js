import api from "./Api";

export const createSlot = (data) =>
api.post('/reservations/slots/available', data)
/**
 * GET /api/reservations/slots/available
 * Devuelve todos los slots disponibles
 */
export const getAvailableSlots = () =>
  api.get("/reservations/slots/available");

/**
 * GET /api/reservations/slots/filter
 * Filtra slots por rango de fechas y opcionalmente por profesor
 * @param {string} startDate - formato YYYY-MM-DD
 * @param {string} endDate   - formato YYYY-MM-DD
 * @param {string} teacherId - opcional
 */
export const getSlotsByRange = (startDate, endDate, teacherId = null) => {
  const params = { startDate, endDate };
  if (teacherId) params.teacherId = teacherId;
  return api.get("/reservations/slots/filter", { params });
};

// ── Reservaciones ─────────────────────────────────────────────────

/**
 * POST /api/reservations/book
 * Reserva un slot (estudiante)
 * Body: { studentId, slotId }
 */
export const bookSlot = (studentId, slotId) =>
  api.post("/reservations/book", { studentId, slotId });

/**
 * GET /api/reservations/myClass
 * Devuelve las reservaciones del estudiante autenticado
 * @param {string} status - opcional: "PENDING", "COMPLETED", "CANCELLED"
 */
export const getMyReservations = (status = null) => {
  const params = status ? { status } : {};
  return api.get("/reservations/myClass", { params });
};

/**
 * GET /api/reservations/teacherAgenda
 * Devuelve la agenda del profesor autenticado
 */
export const getTeacherAgenda = () =>
  api.get("/reservations/teacherAgenda");

/**
 * GET /api/reservations/myAgenda
 * Devuelve la agenda del estudiante autenticado
 */
export const getStudentAgenda = () =>
  api.get("/reservations/myAgenda");

/**
 * PUT /api/reservations/complete
 * Marca una clase como completada
 * Body: { reservationId }
 */
export const completeReservation = (reservationId) =>
  api.put("/reservations/complete", { reservationId });

/**
 * POST /api/reservations/cancel
 * Cancela una reservación
 * Body: { reservaId, actionType, reason, requesterId }
 */
export const cancelReservation = (reservaId, actionType, reason, requesterId) =>
  api.post("/reservations/cancel", { reservaId, actionType, reason, requesterId });