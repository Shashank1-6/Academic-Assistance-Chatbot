const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Configuration
const PORT = process.env.PORT || 5000;
const PYTHON_RAG_URL = process.env.PYTHON_RAG_URL || 'http://localhost:5001';

// User database (hardcoded for demo)
const USERS = {
  'student@test.com': { password: 'student123', role: 'student', name: 'Student User' },
  'teacher@test.com': { password: 'teacher123', role: 'teacher', name: 'Teacher User' },
  'parent@test.com': { password: 'parent123', role: 'parent', name: 'Parent User' }
};

// In-memory storage
const chatHistories = {};
const analytics = { totalQueries: 0, queriesByRole: {} };

// ==================== AUTHENTICATION ====================

/**
 * Login endpoint
 */
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = USERS[email];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Initialize chat history
    if (!chatHistories[email]) {
      chatHistories[email] = [];
    }

    res.json({
      success: true,
      role: user.role,
      email: email,
      name: user.name,
      message: `Welcome ${user.role}!`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHATBOT ENDPOINTS ====================

/**
 * Chat endpoint - Main chatbot query
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { query, email, k = 3, temperature = 0.7, debugMode = false } = req.body;

    if (!query || !email) {
      return res.status(400).json({ error: 'Query and email required' });
    }

    const user = USERS[email];
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Call Python RAG backend
    const ragResponse = await fetch(`${PYTHON_RAG_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        email,
        k,
        temperature,
        use_ollama: true
      })
    });

    let chatData = {};
    if (ragResponse.ok) {
      chatData = await ragResponse.json();
    } else {
      // Fallback response if RAG backend is not available
      chatData = {
        success: true,
        answer: `I'm processing your query: "${query}". Please ensure the Python RAG backend is running.`,
        context: [],
        query
      };
    }

    // Store in chat history
    if (!chatHistories[email]) {
      chatHistories[email] = [];
    }

    chatHistories[email].push({
      timestamp: new Date().toISOString(),
      query,
      response: chatData.answer,
      role: user.role
    });

    // Update analytics
    analytics.totalQueries++;
    analytics.queriesByRole[user.role] = (analytics.queriesByRole[user.role] || 0) + 1;

    res.json({
      success: true,
      answer: chatData.answer,
      context: debugMode ? (chatData.context || []) : [],
      query,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get chat history
 */
app.get('/api/chat-history', (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const history = chatHistories[email] || [];

    res.json({
      success: true,
      history,
      totalMessages: history.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clear chat history
 */
app.post('/api/chat-history/clear', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    chatHistories[email] = [];

    res.json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DATA RETRIEVAL ENDPOINTS ====================

/**
 * Get timetable
 */
app.get('/api/get-timetable', (req, res) => {
  try {
    const timetable = [
      { day: 'Monday', time: '9:00-10:00', subject: 'Mathematics', faculty: 'Dr. Smith' },
      { day: 'Monday', time: '10:00-11:00', subject: 'Physics', faculty: 'Dr. Johnson' },
      { day: 'Tuesday', time: '9:00-10:00', subject: 'Computer Science', faculty: 'Dr. Davis' },
      { day: 'Wednesday', time: '9:00-10:00', subject: 'Chemistry', faculty: 'Dr. Brown' }
    ];

    res.json({
      success: true,
      timetable
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get exam schedule
 */
app.get('/api/get-exams', (req, res) => {
  try {
    const exams = [
      { subject: 'Mathematics', date: '2024-05-15', time: '10:00 AM', room: 'Room 101' },
      { subject: 'Physics', date: '2024-05-17', time: '10:00 AM', room: 'Room 102' },
      { subject: 'Chemistry', date: '2024-05-20', time: '10:00 AM', room: 'Room 103' },
      { subject: 'Computer Science', date: '2024-05-22', time: '10:00 AM', room: 'Room 104' }
    ];

    res.json({
      success: true,
      exams
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get student attendance
 */
app.get('/api/get-attendance', (req, res) => {
  try {
    const { studentId = 'S001' } = req.query;

    const students = {
      'S001': {
        id: 'S001',
        name: 'Alice Johnson',
        attendance: {
          'Mathematics': 85,
          'Physics': 90,
          'Chemistry': 78,
          'Computer Science': 92
        }
      },
      'S002': {
        id: 'S002',
        name: 'Bob Smith',
        attendance: {
          'Mathematics': 75,
          'Physics': 82,
          'Chemistry': 85,
          'Computer Science': 88
        }
      }
    };

    const student = students[studentId];
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      attendance: student
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get faculty information
 */
app.get('/api/get-faculty', (req, res) => {
  try {
    const faculty = [
      { name: 'Dr. Smith', subject: 'Mathematics', email: 'smith@bmsit.edu', phone: '123-456-7890' },
      { name: 'Dr. Johnson', subject: 'Physics', email: 'johnson@bmsit.edu', phone: '123-456-7891' },
      { name: 'Dr. Brown', subject: 'Chemistry', email: 'brown@bmsit.edu', phone: '123-456-7892' },
      { name: 'Dr. Davis', subject: 'Computer Science', email: 'davis@bmsit.edu', phone: '123-456-7893' }
    ];

    res.json({
      success: true,
      faculty
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get college notices
 */
app.get('/api/get-notices', (req, res) => {
  try {
    const notices = [
      'Semester exams will start from May 15, 2024. All students must check their exam schedules.',
      'Library will be closed for maintenance on May 10, 2024.',
      'Sports day is scheduled for May 25, 2024. All students are encouraged to participate.',
      'New computer lab is now open in Block C, Room 201.',
      'Parent-teacher meeting will be held on May 30, 2024 at 2:00 PM.',
      'WiFi password has been changed. Contact IT department for new password.'
    ];

    res.json({
      success: true,
      notices: notices.map((text, idx) => ({ id: idx + 1, text }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get department information
 */
app.get('/api/get-department-info', (req, res) => {
  try {
    const info = {
      name: 'BMS Institute of Technology',
      location: 'Bangalore, Karnataka, India',
      established: 2002,
      facilities: [
        'Modern classrooms with smart boards',
        'Well-equipped laboratories',
        'Library with extensive collection',
        'Sports complex',
        'Hostel accommodation',
        'Cafeteria'
      ],
      contact: {
        phone: '+91-80-26622130-35',
        email: 'info@bmsit.in',
        website: 'www.bmsit.in'
      }
    };

    res.json({
      success: true,
      info
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ANALYTICS ====================

/**
 * Get analytics
 */
app.get('/api/analytics', (req, res) => {
  try {
    res.json({
      totalQueries: analytics.totalQueries,
      queriesByRole: analytics.queriesByRole,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
  console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
});
