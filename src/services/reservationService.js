import api from "./Api";

export const createSlot = (data) =>
  api.post('/reservations/slot', data);

export const getAvailableSlots = () =>
  api.get("/reservations/slots/available");


export const getSlotsByRange = (startDate, endDate, teacherId = null) => {
  const params = { startDate, endDate };
  if (teacherId) params.teacherId = teacherId;
  return api.get("/reservations/slots/filter", { params });
};

// ── Reservaciones ─────────────────────────────────────────────────

export const bookSlot = (studentId, slotId, subject = "") =>
  api.post("/reservations/book", { studentId, slotId, subject });


export const getMyReservations = (status = null) => {
  const params = status ? { status } : {};
  return api.get("/reservations/myClass", { params });
};

export const getStudentAgenda = () =>
  api.get("/reservations/myAgenda");

// AGENDADAS POR ROL

export const getTeacherAgenda = () =>
  api.get("/reservations/teacherAgenda");

export const completeReservation = (reservationId) =>
  api.put("/reservations/complete", { reservationId });

export const cancelReservation = (reservationId, actionType, reason, requesterId) =>
  api.post("/reservations/cancel", { reservationId, actionType, reason, requesterId });

//ADMIN
export const getAllReservations = () =>
  api.get("/reservations/all");