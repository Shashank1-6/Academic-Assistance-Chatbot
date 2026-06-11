import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ChatPage.css';

function ChatPage({ user, debugMode }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [k, setK] = useState(3);
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/chat-history', {
        params: { email: user.email }
      });
      
      // Convert history to messages format
      const formattedMessages = [];
      response.data.history.forEach(item => {
        formattedMessages.push({
          type: 'user',
          text: item.query,
          timestamp: item.timestamp
        });
        formattedMessages.push({
          type: 'bot',
          text: item.response,
          timestamp: item.timestamp,
          context: []
        });
      });
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      text: query,
      timestamp: new Date().toISOString()
    }]);

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        query,
        email: user.email,
        k,
        temperature,
        debugMode
      });

      setMessages(prev => [...prev, {
        type: 'bot',
        text: response.data.answer,
        timestamp: response.data.timestamp,
        context: response.data.context || []
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        text: error.response?.data?.error || 'Error sending message',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setQuery('');
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Clear chat history?')) {
      try {
        await axios.post('http://localhost:5000/api/chat-history/clear', {
          email: user.email
        });
        setMessages([]);
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div>
          <h1>💬 Chat with BMSIT Bot</h1>
          <p>Ask questions about timetable, exams, faculty, and more</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="chat-wrapper">
        {/* Chat Window */}
        <div className="chat-main">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🤖</div>
                <h2>Welcome to BMSIT Chatbot!</h2>
                <p>Ask me questions about:</p>
                <ul>
                  <li>📅 Class timetable and schedules</li>
                  <li>📝 Exam dates and information</li>
                  <li>👨‍🏫 Faculty contacts</li>
                  <li>📢 College notices and announcements</li>
                  <li>✓ Attendance information (for students)</li>
                  <li>🏢 Department information</li>
                </ul>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message message-${msg.type}`}>
                  <div className="message-avatar">
                    {msg.type === 'user' ? '👤' : msg.type === 'error' ? '⚠️' : '🤖'}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{msg.text}</div>
                    {msg.context && msg.context.length > 0 && (
                      <div className="message-context">
                        <button
                          className="btn-context-toggle"
                          onClick={() => {
                            const ctx = document.getElementById(`ctx-${idx}`);
                            ctx.classList.toggle('hidden');
                          }}
                        >
                          📚 Show Context ({msg.context.length} docs)
                        </button>
                        <div id={`ctx-${idx}`} className="context-items hidden">
                          {msg.context.map((doc, didx) => (
                            <div key={didx} className="context-item">
                              <div className="context-header">
                                <span className="context-source">{doc.source}</span>
                                <span className="context-score">{(doc.similarity * 100).toFixed(0)}% match</span>
                              </div>
                              <div className="context-text">{doc.text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="chat-input-area">
            <div className="input-wrapper">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your question here..."
                disabled={loading}
                className="chat-input"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-send"
              >
                {loading ? '⏳' : '📤'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="chat-sidebar">
          <button
            className="btn btn-secondary btn-block"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ Settings
          </button>

          {showSettings && (
            <div className="settings-panel">
              <h3>Configuration</h3>
              
              <div className="setting-group">
                <label>
                  Top-K Documents: <strong>{k}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={k}
                  onChange={(e) => setK(parseInt(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="setting-group">
                <label>
                  Temperature: <strong>{temperature.toFixed(2)}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="slider"
                />
                <small>Lower = more focused, Higher = more creative</small>
              </div>

              <button
                className="btn btn-danger btn-block"
                onClick={handleClearChat}
              >
                🗑️ Clear Chat History
              </button>

              <div className="debug-info">
                <p><strong>User Role:</strong> {user.role}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Debug Mode:</strong> {debugMode ? '✓ On' : '✗ Off'}</p>
              </div>
            </div>
          )}

          <div className="quick-queries">
            <h3>💡 Quick Queries</h3>
            <button
              className="quick-btn"
              onClick={() => setQuery('What is the timetable for this week?')}
            >
              📅 Show timetable
            </button>
            <button
              className="quick-btn"
              onClick={() => setQuery('When are the exams scheduled?')}
            >
              📝 Exam dates
            </button>
            <button
              className="quick-btn"
              onClick={() => setQuery('Who are the faculty members?')}
            >
              👨‍🏫 Faculty info
            </button>
            <button
              className="quick-btn"
              onClick={() => setQuery('Show me college notices')}
            >
              📢 Notices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
