import api from "./Api";

/**
 * Servicio para gestionar los pagos y recargas del monedero virtual.
 */
const paymentService = {
  /**
   * Permite al alumno reclamar un pago realizado mediante el link estático de Mercado Pago.
   * @param {string|number} paymentId - El ID de operación de Mercado Pago.
   */
  claimPayment: async (paymentId) => {
    return await api.post(`/payments/claim-payment?paymentId=${paymentId}`);
  },
};

export default paymentService;
