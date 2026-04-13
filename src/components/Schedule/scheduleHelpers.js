export const DAYS_OF_WEEK   = ["LUN","MAR","MIE","JUE","VIE","SAB","DOM"];
export const DAYS_LABELS    = ["Lun","Mar","Mie","Jue","Vie","Sab","Dom"];
export const MONTHS         = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
export const HOURS          = Array.from({ length: 16 }, (_, i) => `${String(i + 7).padStart(2,"0")}:00`);
export const DURATIONS_WEEK = ["1 semana","2 semanas","4 semanas","8 semanas","3 meses"];
export const DURATIONS_MONTH= ["1 mes","2 meses","3 meses","6 meses"];

export const TEACHER_NAV = [
  { label: "Inicio",   path: "/teacher/dashboard" },
  { label: "Horario",  path: "/teacher/schedule"  },
  { label: "Clases",   path: "/teacher/classes"   },
  { label: "Mensajes", path: "/teacher/messages"  },
];
const generateMockSchedules = () => {
 const today = new Date();
const year  = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day   = String(today.getDate()).padStart(2, "0");

  return [
     { date: `${year}-${month}-${day}`, start: "09:00", end: "10:00", type: "Disponible",  label: "Horario disponible para reservar" },
    { date: `${year}-${month}-${day}`, start: "10:00", end: "11:00", type: "Reservado",   label: "Inglés Avanzado", minutes: 60 },
    { date: `${year}-${month}-${day}`, start: "12:00", end: "13:00", type: "Disponible",  label: "Horario disponible para reservar" },
    { date: `${year}-${month}-05`, start: "09:00", end: "10:00", type: "Disponible",  label: "Horario disponible para reservar" },
    { date: `${year}-${month}-05`, start: "10:00", end: "11:00", type: "Reservado",   label: "Entrevista Inglés", minutes: 60 },
    { date: `${year}-${month}-05`, start: "12:00", end: "13:00", type: "Disponible",  label: "Horario disponible para reservar" },
    { date: `${year}-${month}-10`, start: "09:00", end: "10:00", type: "Disponible",  label: "Horario disponible para reservar" },
    { date: `${year}-${month}-11`, start: "09:00", end: "10:00", type: "Disponible",  label: "Horario disponible para reservar" },
    { date: `${year}-${month}-11`, start: "11:00", end: "12:00", type: "Reservado",   label: "Inglés III", minutes: 60 },
    { date: `${year}-${month}-13`, start: "09:00", end: "10:00", type: "Disponible",  label: "Horario disponible para reservar" },
    { date: `${year}-${month}-13`, start: "13:00", end: "14:00", type: "Reservado",   label: "Matemáticas", minutes: 60 },
    { date: `${year}-${month}-14`, start: "11:00", end: "12:00", type: "Reservado",   label: "Inglés III", minutes: 60 },
    { date: `${year}-${month}-15`, start: "11:00", end: "12:00", type: "Reservado",   label: "Francés", minutes: 60 },
    { date: `${year}-${month}-16`, start: "11:00", end: "12:00", type: "Reservado",   label: "Física", minutes: 60 },
  ];
};
export const MOCK_SCHEDULES = generateMockSchedules();

export const getDaysInMonth     = (y, m) => new Date(y, m + 1, 0).getDate();
export const getFirstDayOfMonth = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

export const formatWeekRange = (weekStart) => {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return `${weekStart.getDate()}-${end.getDate()} de ${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
};

export const formatDayTitle = (date) => {
  const days = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  return `${days[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};