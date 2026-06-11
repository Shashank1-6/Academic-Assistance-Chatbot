import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });

      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    const demoUsers = {
      student: 'student@test.com',
      teacher: 'teacher@test.com',
      parent: 'parent@test.com'
    };

    setEmail(demoUsers[role]);
    setPassword(role === 'student' ? 'student123' : role === 'teacher' ? 'teacher123' : 'parent123');

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email: demoUsers[role],
        password: role === 'student' ? 'student123' : role === 'teacher' ? 'teacher123' : 'parent123'
      });

      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎓 BMSIT Chatbot Portal</h1>
          <p>Your AI-powered college assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="message-error">{error}</div>}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">OR</div>

        <div className="demo-buttons">
          <button
            type="button"
            className="btn btn-demo demo-student"
            onClick={() => handleDemoLogin('student')}
            disabled={loading}
          >
            👨‍🎓 Student Demo
          </button>
          <button
            type="button"
            className="btn btn-demo demo-teacher"
            onClick={() => handleDemoLogin('teacher')}
            disabled={loading}
          >
            👨‍🏫 Teacher Demo
          </button>
          <button
            type="button"
            className="btn btn-demo demo-parent"
            onClick={() => handleDemoLogin('parent')}
            disabled={loading}
          >
            👨‍👩‍👧 Parent Demo
          </button>
        </div>

        <div className="login-footer">
          <p><strong>Demo Credentials:</strong></p>
          <ul>
            <li><strong>Student:</strong> student@test.com / student123</li>
            <li><strong>Teacher:</strong> teacher@test.com / teacher123</li>
            <li><strong>Parent:</strong> parent@test.com / parent123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
