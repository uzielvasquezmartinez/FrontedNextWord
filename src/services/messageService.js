import api from "./Api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// ── REST ──────────────────────────────────────────────────────────

/**
 * GET /api/messages/history/{user1}/{user2}
 * Devuelve el historial de mensajes entre dos usuarios
 */
export const getChatHistory = (user1, user2) =>
  api.get(`/messages/history/${user1}/${user2}`);

/**
 * PUT /api/messages/{id}/read
 * Marca un mensaje como leído
 */
export const markAsRead = (messageId) =>
  api.put(`/messages/${messageId}/read`);

// ── WebSocket (STOMP) ─────────────────────────────────────────────

let stompClient = null;

/**
 * Conecta al WebSocket y se suscribe a /topic/messages
 * @param {Function} onMessage - callback que recibe cada mensaje nuevo
 * @param {string|number} userId
 * @returns {Client} instancia del cliente STOMP
 */
export const connectWebSocket = (userId, onMessage) => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    reconnectDelay: 5000,
    onConnect: () => {
console.log(`✅ WebSocket conectado para el usuario: ${userId}`);
stompClient.subscribe(`/user/${userId}/queue/messages`, (frame) => { 
const message = JSON.parse(frame.body);
        onMessage(message);
      });
    },
    onDisconnect: () => {
      console.log("❌ WebSocket desconectado");
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame);
    },
  });

  stompClient.activate();
  return stompClient;
};

/**
 * Envía un mensaje por WebSocket
 * @param {{ senderId, receiverId, body }} messageDto
 */
export const sendMessage = (messageDto) => {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: "/app/chat",
      body: JSON.stringify(messageDto),
    });
  } else {
    console.warn("WebSocket no conectado");
  }
};

/**
 * Desconecta el WebSocket
 */
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};


