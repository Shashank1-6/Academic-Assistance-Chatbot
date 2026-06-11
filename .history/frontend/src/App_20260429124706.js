import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [debugMode, setDebugMode] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/chat" element={user ? <ChatPage user={user} debugMode={debugMode} /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/settings" element={user ? <SettingsPage user={user} debugMode={debugMode} setDebugMode={setDebugMode} /> : <LoginPage onLogin={handleLogin} />} />
      </Routes>
    </Router>
  );
}

export default App;
