import api from "./Api";

// ── REST ──────────────────────────────────────────────────────────

export const getInbox = () =>
  api.get("/messages/inbox");

export const getChatHistory = (user1, user2) =>
  api.get(`/messages/history/${user1}/${user2}`);

export const markAsRead = (messageId) =>
  api.put(`/messages/${messageId}/read`);

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


