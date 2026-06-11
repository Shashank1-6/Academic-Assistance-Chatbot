import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [exams, setExams] = useState([]);
  const [notices, setNotices] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [timetableRes, examsRes, noticesRes, attendanceRes] = await Promise.all([
        axios.get('http://localhost:5000/api/get-timetable'),
        axios.get('http://localhost:5000/api/get-exams'),
        axios.get('http://localhost:5000/api/get-notices'),
        axios.get('http://localhost:5000/api/get-attendance', { params: { studentId: 'S001' } })
      ]);

      setTimetable(timetableRes.data.timetable);
      setExams(examsRes.data.exams);
      setNotices(noticesRes.data.notices);
      setAttendance(attendanceRes.data.attendance);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case 'student':
        return '👨‍🎓';
      case 'teacher':
        return '👨‍🏫';
      case 'parent':
        return '👨‍👩‍👧';
      default:
        return '👤';
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'student':
        return '#4CAF50';
      case 'teacher':
        return '#2196F3';
      case 'parent':
        return '#FF9800';
      default:
        return '#667eea';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>BMSIT Chatbot Portal</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="role-icon">{getRoleIcon()}</span>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => navigate('/chat')}
        >
          💬 Chat
        </button>
        <button
          className={`nav-tab ${activeTab === 'timetable' ? 'active' : ''}`}
          onClick={() => setActiveTab('timetable')}
        >
          📅 Timetable
        </button>
        <button
          className={`nav-tab ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          📝 Exams
        </button>
        {user.role === 'student' && (
          <button
            className={`nav-tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            ✓ Attendance
          </button>
        )}
        <button
          className={`nav-tab ${activeTab === 'notices' ? 'active' : ''}`}
          onClick={() => setActiveTab('notices')}
        >
          📢 Notices
        </button>
        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Welcome, {user.name}! 👋</h2>
            <div className="overview-cards">
              <div className="overview-card">
                <div className="card-icon">📚</div>
                <div className="card-content">
                  <h3>{timetable.length}</h3>
                  <p>Classes This Week</p>
                </div>
              </div>
              <div className="overview-card">
                <div className="card-icon">📝</div>
                <div className="card-content">
                  <h3>{exams.length}</h3>
                  <p>Upcoming Exams</p>
                </div>
              </div>
              <div className="overview-card">
                <div className="card-icon">📢</div>
                <div className="card-content">
                  <h3>{notices.length}</h3>
                  <p>New Notices</p>
                </div>
              </div>
              <div className="overview-card">
                <div className="card-icon">🤖</div>
                <div className="card-content">
                  <h3>AI Ready</h3>
                  <p>Chat Available</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <button className="btn btn-primary" onClick={() => navigate('/chat')}>
                💬 Ask the Chatbot
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
                ⚙️ Configure Settings
              </button>
            </div>
          </div>
        )}

        {/* Timetable Tab */}
        {activeTab === 'timetable' && (
          <div className="section">
            <h2>📅 Class Timetable</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Faculty</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.day}</td>
                      <td>{item.time}</td>
                      <td>{item.subject}</td>
                      <td>{item.faculty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="section">
            <h2>📝 Exam Schedule</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.subject}</td>
                      <td>{item.date}</td>
                      <td>{item.time}</td>
                      <td>{item.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && attendance && (
          <div className="section">
            <h2>✓ Attendance</h2>
            <div className="attendance-card">
              <h3>{attendance.name}</h3>
              <div className="attendance-grid">
                {Object.entries(attendance.attendance).map(([subject, percent]) => (
                  <div key={subject} className="attendance-item">
                    <div className="subject-name">{subject}</div>
                    <div className="attendance-bar">
                      <div
                        className="attendance-fill"
                        style={{
                          width: `${percent}%`,
                          background: percent >= 75 ? '#4CAF50' : percent >= 60 ? '#FF9800' : '#F44336'
                        }}
                      ></div>
                    </div>
                    <div className="attendance-percent">{percent}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <div className="section">
            <h2>📢 College Notices</h2>
            <div className="notices-list">
              {notices.map((notice, idx) => (
                <div key={idx} className="notice-item">
                  <div className="notice-number">#{notice.id}</div>
                  <div className="notice-text">{notice.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
