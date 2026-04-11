import { useState, useRef, useEffect } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Avatar from "../../components/UI/Avatar/Avatar";
import { IconSend } from "../../components/Icons/Icons";
import { useAuth } from "../../context/AuthContext";
import {
  getChatHistory,
  markAsRead,
  connectWebSocket,
  sendMessage,
  disconnectWebSocket,
} from "../../services/messageService";
import styles from "../Professor/MessagesView.module.css";

// ── Navegación ───────────────────────────────────────────────────
const STUDENT_NAV = [
  { label: "Inicio",   path: "/student/dashboard" },
  { label: "Horario",  path: "/student/schedule"  },
  { label: "Clases",   path: "/student/classes"   },
  { label: "Mensajes", path: "/student/messages"  },
];

// ── Helper: genera iniciales desde un ID o nombre ─────────────────
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

// ── Datos mock temporales (hasta que tengas tu endpoint de contactos) ──
const MOCK_TEACHERS = [
  {
    id: "1", // Asegúrate de que coincida con el ID real del Profesor Uzi en tu BD
    name: "Mario Moreno",
    initials: "MM",
    avatar: "https://i.pravatar.cc/150?img=33",
    preview: "Envía un mensaje para comenzar",
    online: true,
    unread: false,
  },
  {
    id: "2",
    name: "Carolina Bahena",
    initials: "CB",
    avatar: "https://i.pravatar.cc/150?img=44",
    preview: "",
    online: false,
    unread: false,
  }
];

// ── Componente principal ─────────────────────────────────────────
const StudentMessagesView = () => {
  const { user }                          = useAuth(); // Obtenemos el ID del alumno logueado
  const [contacts, setContacts]           = useState(MOCK_TEACHERS);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [newMessage, setNewMessage]       = useState("");
  const [loading, setLoading]             = useState(false);
  const messagesEndRef                    = useRef(null);

  // ── Conectar WebSocket al montar ────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const client = connectWebSocket(user.id, (incomingMessage) => {
      // Solo agrega el mensaje si pertenece a la conversación activa
      setActiveContact((prev) => {
        if (
          prev &&
          (incomingMessage.senderId === prev.id ||
            incomingMessage.receiverId === prev.id)
        ) {
          setMessages((msgs) => [...msgs, incomingMessage]);
        }
        return prev;
      });

      // Actualiza el preview del contacto
      setContacts((prev) =>
        prev.map((c) =>
          c.id === incomingMessage.senderId
            ? { ...c, preview: incomingMessage.body, unread: true }
            : c
        )
      );
    });

    return () => disconnectWebSocket();
  }, [user?.id]);

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

      // Quitar indicador de no leído en la lista local
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
      senderId:   user.id,
      receiverId: activeContact.id,
      body:       newMessage.trim(),
    };

    sendMessage(messageDto);

    // Optimistic UI — agrega el mensaje localmente
    const optimisticMessage = {
      id:         Date.now().toString(),
      senderId:   user.id,
      receiverId: activeContact.id,
      body:       newMessage.trim(),
      sentAt:     new Date().toISOString(),
      read:       "0",
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
      hour:   "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={STUDENT_NAV} activeItem="Mensajes" />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Mis Mensajes</h2>
        </div>

        <div className={styles.chatContainer}>

          {/* ── Lista de contactos (profesores) ── */}
          <div className={styles.contactList}>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`${styles.contactItem} ${activeContact?.id === contact.id ? styles.contactItemActive : ""}`}
                onClick={() => handleSelectContact(contact)}
              >
                <div className={styles.contactAvatar}>
                  <Avatar initials={contact.initials} size="md" />
                  {contact.online && <span className={styles.onlineDot} />}
                </div>
                <div className={styles.contactInfo}>
                  <span className={styles.contactName}>{contact.name}</span>
                  <span className={styles.contactPreview}>{contact.preview}</span>
                </div>
                {contact.unread && <span className={styles.unreadDot} />}
              </div>
            ))}
          </div>

          {/* ── Panel del chat ── */}
          {activeContact ? (
            <div className={styles.chatPanel}>

              <div className={styles.chatHeader}>
                <Avatar initials={activeContact.initials} size="md" />
                <div className={styles.chatHeaderInfo}>
                  <span className={styles.chatHeaderName}>{activeContact.name}</span>
                  <span className={`${styles.chatHeaderStatus} ${activeContact.online ? styles.statusOnline : styles.statusOffline}`}>
                    {activeContact.online ? "En línea" : "Desconectado"}
                  </span>
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

export default StudentMessagesView;