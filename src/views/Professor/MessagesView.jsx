import { useState, useRef, useEffect } from "react";
import AppNavbar from "../../components/AppNavbar/AppNavbar";
import Avatar from "../../components/UI/Avatar/Avatar";
import styles from "./MessagesView.module.css";
import { IconSend } from "../../components/Icons/Icons";

const TEACHER_NAV = [
  { label: "Inicio",   path: "/teacher/dashboard" },
  { label: "Horario",  path: "/teacher/schedule"  },
  { label: "Mensajes", path: "/teacher/messages"  },
];

<IconSend />
const MOCK_CONTACTS = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    initials: "CR",
    preview: "Puede ayudarme con un exámen",
    online: true,
    unread: true,
    messages: [
      { id: 1, text: "¿Puede ayudarme con un exámen?",          time: "11:30 a.m.", sent: false },
      { id: 2, text: "Claro, lo revisamos en la próxima sesión", time: "11:32 a.m.", sent: true  },
    ],
  },
  {
    id: 2,
    name: "Javier Muñoz",
    initials: "JM",
    preview: "Necesito una asesoría para una visa",
    online: false,
    unread: true,
    messages: [
      { id: 1, text: "Necesito una asesoría para una visa", time: "10:15 a.m.", sent: false },
    ],
  },
  {
    id: 3,
    name: "Carlos Belcast",
    initials: "CB",
    preview: "Puede ayudarme con un exámen",
    online: false,
    unread: true,
    messages: [
      { id: 1, text: "Puede ayudarme con un exámen", time: "09:45 a.m.", sent: false },
    ],
  },
];

const MessagesView = () => {
  const [contacts, setContacts]         = useState(MOCK_CONTACTS);
  const [activeContact, setActiveContact] = useState(MOCK_CONTACTS[0]);
  const [newMessage, setNewMessage]     = useState("");
  const messagesEndRef                  = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContact?.messages]);

  const handleSelectContact = (contact) => {
    setContacts((prev) =>
      prev.map((c) => c.id === contact.id ? { ...c, unread: false } : c)
    );
    setActiveContact({ ...contact, unread: false });
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      sent: true,
    };

    const updatedContacts = contacts.map((c) =>
      c.id === activeContact.id
        ? { ...c, messages: [...c.messages, message], preview: newMessage.trim() }
        : c
    );

    setContacts(updatedContacts);
    setActiveContact((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
      preview: newMessage.trim(),
    }));
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.page}>
      <AppNavbar title="NextWord" navItems={TEACHER_NAV} activeItem="Mensajes" />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Mis Mensajes</h2>
        </div>

        <div className={styles.chatContainer}>

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
                {activeContact.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.messageBubbleWrapper} ${msg.sent ? styles.messageBubbleWrapperSent : ""}`}
                  >
                    <div className={`${styles.messageBubble} ${msg.sent ? styles.messageBubbleSent : styles.messageBubbleReceived}`}>
                      <p className={styles.messageText}>{msg.text}</p>
                      <span className={styles.messageTime}>{msg.time}</span>
                    </div>
                  </div>
                ))}
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