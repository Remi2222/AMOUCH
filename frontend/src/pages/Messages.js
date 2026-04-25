import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Messages.css';

const API_URL = process.env.REACT_APP_MESSAGES_API || 'http://localhost:3008';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = 1; // À remplacer par l'utilisateur connecté

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.contact_id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/messages/conversations/${currentUserId}`);
      setConversations(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const response = await axios.get(`${API_URL}/api/messages/conversation/${currentUserId}/${contactId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post(`${API_URL}/api/messages`, {
        sender_id: currentUserId,
        receiver_id: selectedConversation.contact_id,
        message: newMessage
      });
      
      setNewMessage('');
      fetchMessages(selectedConversation.contact_id);
      fetchConversations();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      adopter: '👤',
      shelter: '🏠',
      veterinarian: '👨‍⚕️',
      admin: '⚙️'
    };
    return icons[role] || '👤';
  };

  const getRoleLabel = (role) => {
    const labels = {
      adopter: 'Adoptant',
      shelter: 'Refuge',
      veterinarian: 'Vétérinaire',
      admin: 'Admin'
    };
    return labels[role] || role;
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Liste des conversations */}
        <div className="conversations-list">
          <div className="conversations-header">
            <h2>💬 Messages</h2>
          </div>
          <div className="conversations">
            {conversations.map(conv => (
              <div
                key={conv.contact_id}
                className={`conversation-item ${selectedConversation?.contact_id === conv.contact_id ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="conv-avatar">
                  {getRoleIcon(conv.contact_role)}
                </div>
                <div className="conv-info">
                  <div className="conv-header-info">
                    <h3>{conv.contact_name}</h3>
                    {conv.unread_count > 0 && (
                      <span className="unread-badge">{conv.unread_count}</span>
                    )}
                  </div>
                  <p className="conv-role">{getRoleLabel(conv.contact_role)}</p>
                  <p className="conv-last-message">{conv.last_message}</p>
                  <p className="conv-time">
                    {conv.last_message_date && new Date(conv.last_message_date).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="no-conversations">
                <p>Aucune conversation pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="contact-avatar">
                    {getRoleIcon(selectedConversation.contact_role)}
                  </div>
                  <div>
                    <h2>{selectedConversation.contact_name}</h2>
                    <p>{getRoleLabel(selectedConversation.contact_role)}</p>
                  </div>
                </div>
              </div>

              <div className="messages-area">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {msg.subject && <div className="message-subject">{msg.subject}</div>}
                      <p>{msg.message}</p>
                      <span className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form className="message-input" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                />
                <button type="submit" className="btn btn-primary">
                  Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <h2>💬</h2>
              <p>Sélectionnez une conversation pour commencer à discuter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;


