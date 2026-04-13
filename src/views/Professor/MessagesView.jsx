// src/views/Professor/MessagesView.jsx
import { useState, useRef, useEffect } from "react";
import { useCallback } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Avatar from "../../components/UI/Avatar/Avatar";
import { IconSend } from "../../components/Icons/Icons";
import { useAuth } from "../../context/AuthContext";
import { getInbox, getChatHistory, markAsRead } from "../../services/messageService";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import styles from "./MessagesView.module.css";

const TEACHER_NAV = [
  { label: "Inicio", path: "/teacher/dashboard" },
  { label: "Horario", path: "/teacher/schedule" },
  { label: "Clases", path: "/teacher/classes" },
  { label: "Mensajes", path: "/teacher/messages" },
];

// ── Helper: genera iniciales desde un ID o nombre ─────────────────
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const MessagesView = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const activeContactRef = useRef(null); // 👈 Referencia para leerlo dentro del websocket sin desatar re-renders
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ── Cargar Inbox al montar ────────────────────────────────────────
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await getInbox();
        const mappedContacts = res.data.map(dto => ({
          id: dto.contactId,
          name: dto.name,            // Sincronizado con InboxDto.java (CAMBIADO)
          preview: dto.lastMessage,  // Sincronizado con InboxDto.java (CAMBIADO)
          avatar: dto.photoPerfil,   // Sincronizado con InboxDto.java (CAMBIADO)
          unread: dto.unreadCount > 0,
          online: false
        }));
        setContacts(mappedContacts);
      } catch (error) {
        console.error("Error cargando bandeja de entrada:", error);
      }
    };
    if (user?.id) fetchInbox();
  }, [user?.id]);

  // Sincroniza el estado hacia la referencia
  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  // ── Inicializar Hook de WebSocket ───────────────────────────────
  const handleIncomingMessage = useCallback((incomingMessage) => {
    const currentContact = activeContactRef.current;

    // 1. Ignorar si el mensaje fue enviado por el usuario actual
    if (incomingMessage.senderId === user.id) return;

    // 2. Si recibimos una actualización de estado de lectura (read="1")
    if (incomingMessage.read === "1") {
      setMessages((msgs) =>
        msgs.map((m) => (m.id === incomingMessage.id ? { ...m, read: "1" } : m))
      );
      return;
    }

    if (
      currentContact &&
      (incomingMessage.senderId === currentContact.id ||
        incomingMessage.receiverId === currentContact.id)
    ) {
      setMessages((msgs) => [...msgs, incomingMessage]);
    }

    // Actualiza el preview del contacto
    setContacts((prev) =>
      prev.map((c) =>
        c.id === incomingMessage.senderId
          ? { ...c, preview: incomingMessage.body, unread: true }
          : c
      )
    );
  }, []);

  const { sendMessage } = useChatWebSocket(user.id, handleIncomingMessage);

  // ── Scroll al último mensaje ─────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Cargar historial al seleccionar un contacto ──────────────────
  const handleSelectContact = async (contact) => {
    setActiveContact(contact);
    setLoading(true);

    try {
      const res = await getChatHistory(user.id, contact.id);
      setMessages(res.data);

      // Marcar mensajes no leídos como leídos
      res.data
        .filter((m) => m.read === "0" && m.receiverId === user.id)
        .forEach((m) => markAsRead(m.id));

      // Quitar indicador de no leído
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? { ...c, unread: false } : c))
      );
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Enviar mensaje ───────────────────────────────────────────────
  const handleSend = () => {
    if (!newMessage.trim() || !activeContact) return;

    const messageDto = {
      senderId: user.id,
      receiverId: activeContact.id,
      body: newMessage.trim(),
    };

    sendMessage(messageDto);

    // Optimistic UI — agrega el mensaje localmente antes de que llegue por WS
    const optimisticMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: activeContact.id,
      body: newMessage.trim(),
      sentAt: new Date().toISOString(),
      read: "0",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContact.id
          ? { ...c, preview: newMessage.trim() }
          : c
      )
    );
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Helper: formatea la hora de sentAt ───────────────────────────
  const formatTime = (sentAt) => {
    if (!sentAt) return "";
    return new Date(sentAt).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={TEACHER_NAV} activeItem="Mensajes" />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Mis Mensajes</h2>
        </div>

        <div className={styles.chatContainer}>

          {/* ── Lista de contactos ── */}
          <div className={styles.contactList}>
            {contacts.length === 0 ? (
              <p style={{ padding: "1rem", color: "#9ca3af", fontSize: "14px" }}>
                No tienes conversaciones aún
              </p>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`${styles.contactItem} ${activeContact?.id === contact.id ? styles.contactItemActive : ""}`}
                  onClick={() => handleSelectContact(contact)}
                >
                  <div className={styles.contactAvatar}>
                    <Avatar initials={getInitials(contact.name)} size="md" />
                    {contact.online && <span className={styles.onlineDot} />}
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactName}>{contact.name}</span>
                    <span className={styles.contactPreview}>{contact.preview}</span>
                  </div>
                  {contact.unread && <span className={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>

          {/* ── Panel de chat ── */}
          {activeContact ? (
            <div className={styles.chatPanel}>

              <div className={styles.chatHeader}>
                <Avatar initials={getInitials(activeContact.name)} size="md" />
                <div className={styles.chatHeaderInfo}>
                  <span className={styles.chatHeaderName}>{activeContact.name}</span>
                </div>
              </div>

              <div className={styles.messagesList}>
                {loading ? (
                  <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>
                    Cargando mensajes...
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.messageBubbleWrapper} ${msg.senderId === user.id ? styles.messageBubbleWrapperSent : ""}`}
                    >
                      <div className={`${styles.messageBubble} ${msg.senderId === user.id ? styles.messageBubbleSent : styles.messageBubbleReceived}`}>
                        <p className={styles.messageText}>{msg.body}</p>
                        <span className={styles.messageTime}>{formatTime(msg.sentAt)}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.chatInputRow}>
                <input
                  type="text"
                  className={styles.chatInput}
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className={styles.sendBtn}
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                >
                  <IconSend />
                </button>
              </div>

            </div>
          ) : (
            <div className={styles.emptyChat}>
              <p>Selecciona una conversación para comenzar</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default MessagesView;