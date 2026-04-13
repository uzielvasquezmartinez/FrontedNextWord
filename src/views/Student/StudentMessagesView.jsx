import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Avatar from "../../components/UI/Avatar/Avatar";
import { IconSend } from "../../components/Icons/Icons";
import { useAuth } from "../../context/AuthContext";
import {
  getInbox,
  getChatHistory,
  markAsRead,
} from "../../services/messageService";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
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

// ── Componente principal ─────────────────────────────────────────
const StudentMessagesView = () => {
  const { user }                          = useAuth(); // Obtenemos el ID del alumno logueado
  const [contacts, setContacts]           = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const activeContactRef                  = useRef(null);
  const [messages, setMessages]           = useState([]);
  const [newMessage, setNewMessage]       = useState("");
  const [loading, setLoading]             = useState(false);
  const [hasFetchedInbox, setHasFetchedInbox] = useState(false); 
  const messagesEndRef                    = useRef(null);

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
      } finally {
        setHasFetchedInbox(true);
      }
    };
    if (user?.id) fetchInbox();
  }, [user?.id]);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  // ── Auto-selección desde el estado de navegación ────────────────
  const location = useLocation();
  useEffect(() => {
    // Solo procedemos si ya intentamos cargar el inbox y tenemos un profesor seleccionado del estado
    if (hasFetchedInbox && location.state?.selectedTeacher) {
      const teacher = location.state.selectedTeacher;
      // Buscamos si el profesor YA está en la lista de contactos
      const existing = contacts.find(c => c.id === teacher.id);

      if (existing) {
        handleSelectContact(existing);
      } else {
        // Si no está, lo agregamos como un contacto temporal al inicio de la lista
        const tempContact = {
          id:      teacher.id,
          name:    teacher.name,
          preview: "Nuevo chat...",
          avatar:  teacher.avatar,
          unread:  false,
          online:  false,
          initials: getInitials(teacher.name)
        };
        setContacts((prev) => [tempContact, ...prev]);
        setActiveContact(tempContact);
      }
      // Limpiar el estado para evitar re-selecciones infinitas
      window.history.replaceState({}, document.title);
    }
  }, [hasFetchedInbox, location.state, contacts.length]);

  // ── Inicializar Hook de WebSocket ───────────────────────────────
  const handleIncomingMessage = useCallback((incomingMessage) => {
    const currentContact = activeContactRef.current;

    // 1. Ignorar si el mensaje fue enviado por el usuario actual 
    // (ya lo mostramos en pantalla vía Optimistic UI)
    if (incomingMessage.senderId === user.id) return;

    // 2. Si recibimos una actualización de estado de lectura (read="1")
    if (incomingMessage.read === "1") {
      setMessages((msgs) =>
        msgs.map((m) => (m.id === incomingMessage.id ? { ...m, read: "1" } : m))
      );
      return;
    }

    // Solo agrega el mensaje si pertenece a la conversación activa
    if (
      currentContact &&
      (incomingMessage.senderId === currentContact.id ||
        incomingMessage.receiverId === currentContact.id)
    ) {
      setMessages((msgs) => [...msgs, incomingMessage]);
    }
    
    // ... resto del código de preview ...
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