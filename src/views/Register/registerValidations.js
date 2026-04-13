// src/views/Register/registerValidations.js

export const calcularEdad = (birthDate) => {
  if (!birthDate) return null;
  const hoy = new Date();
  const nac = new Date(birthDate);
  let edad  = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

export const validarFormulario = (formData) => {
  const errors      = {};
  const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s-]+$/;

  if (!formData.fullName.trim()) {
    errors.fullName = "El nombre es requerido.";
  } else if (!regexNombre.test(formData.fullName.trim())) {
    errors.fullName = "El nombre solo debe contener letras, espacios y guiones.";
  }

  if (!formData.email.trim()) {
    errors.email = "El email es requerido.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Ingresa un email válido.";
  }

if (!formData.phoneNumber.trim()) {
  errors.phoneNumber = "El teléfono es requerido.";
} else if (!/^\d{10}$/.test(formData.phoneNumber)) {
  errors.phoneNumber = "El teléfono debe tener exactamente 10 dígitos.";
}

  if (!formData.birthDate) {
    errors.birthDate = "La fecha de nacimiento es requerida.";
  } else {
    const hoy   = new Date();
    const fecha = new Date(formData.birthDate);
    if (fecha >= hoy) {
      errors.birthDate = "La fecha de nacimiento no puede ser una fecha futura.";
    } else if (calcularEdad(formData.birthDate) > 120) {
      errors.birthDate = "Ingresa una fecha de nacimiento válida.";
    }
  }

  if (!formData.password) {
    errors.password = "La contraseña es requerida.";
  } else if (formData.password.length < 8) {
    errors.password = "Mínimo 8 caracteres.";
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(formData.password)) {
    errors.password = "La contraseña debe incluir al menos una letra y un número.";
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña.";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return errors;
};

export const validarTutor = (tutorData, studentEmail) => {
  const errors = {};

  if (!tutorData.tutorName.trim())
    errors.tutorName = "El nombre del tutor es requerido.";

  if (!tutorData.tutorEmail.trim()) {
    errors.tutorEmail = "El email del tutor es requerido.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutorData.tutorEmail)) {
    errors.tutorEmail = "Ingresa un email válido.";
  } else if (studentEmail && tutorData.tutorEmail.trim().toLowerCase() === studentEmail.trim().toLowerCase()) {
    errors.tutorEmail = "El correo del tutor no puede ser el mismo que el del alumno.";
  }

  if (!tutorData.tutorPhone.trim())
    errors.tutorPhone = "El teléfono es requerido.";
  else if (!/^\d{10}$/.test(tutorData.tutorPhone))
    errors.tutorPhone = "El teléfono debe tener exactamente 10 dígitos.";

  return errors;
};

// Calcula el max del input date (ayer)
export const getMaxBirthDate = () => {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  return ayer.toISOString().split("T")[0];
};
