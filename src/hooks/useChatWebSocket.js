import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import api from "../services/Api";

export const useChatWebSocket = (userId, onMessageReceived) => {
  const stompClientRef = useRef(null);

  const getWebSocketUrl = useCallback(() => {
    let baseURL = api.defaults.baseURL || "http://localhost:8080/api";
    
    // Si la URL es relativa (ej: /api), la convertimos en absoluta usando el host actual
    if (baseURL.startsWith("/")) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      baseURL = `${protocol}//${host}${baseURL}`;
    } else {
      baseURL = baseURL.replace("http", "ws");
    }

    const wsBase = baseURL.replace("/api", "");
    const token = localStorage.getItem("token") || "";
    return `${wsBase}/ws?token=${token}`;
  }, []);

  const connect = useCallback(() => {
    if (stompClientRef.current) return;

    const client = new Client({
      brokerURL: getWebSocketUrl(),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(`✅ WebSocket conectado para el usuario: ${userId}`);
        client.subscribe(`/topic/messages`, (frame) => {
          const message = JSON.parse(frame.body);
          if (onMessageReceived) onMessageReceived(message);
        });
      },
      onDisconnect: () => console.log("❌ WebSocket desconectado"),
      onStompError: (frame) => console.error("STOMP error:", frame),
    });

    client.activate();
    stompClientRef.current = client;
  }, [userId, getWebSocketUrl, onMessageReceived]);

  const disconnect = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((messageDto) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: "/app/chat",
        body: JSON.stringify(messageDto),
      });
    } else {
      console.warn("WebSocket no conectado");
    }
  }, []);

  // Control automático del ciclo de vida del socket
  useEffect(() => {
    if (userId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return { sendMessage, connect, disconnect };
};
