# BMSIT College Chatbot Portal 🎓

A complete Retrieval-Augmented Generation (RAG) powered College FAQ Chatbot Web Application with role-based access control.

## 🎯 Features

- **RAG-Powered Chatbot** - Retrieval-Augmented Generation using ChromaDB and Embeddings
- **Role-Based Access** - Student, Teacher, and Parent login with specific features
- **Multiple Data Views** - Timetable, Exam Schedule, Faculty Info, Attendance, Notices
- **Configurable RAG** - Change embedding models, top-k retrieval, and temperature
- **Chat History** - Persistent chat history for each user
- **Analytics Dashboard** - Track queries by role and user
- **Debug Mode** - Show retrieved context documents
- **Open-Source LLM** - Uses Ollama (Mistral) or HuggingFace models

## 📁 Project Structure

```
chatBot/
├── backend/
│   ├── server.js                 # Node.js Express API server
│   ├── package.json              # Backend dependencies
│   ├── .env                       # Environment variables
│   └── rag_system/
│       ├── app.py                # Flask RAG application
│       ├── rag_pipeline.py       # RAG pipeline implementation
│       └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html            # HTML template
│   ├── src/
│   │   ├── index.js              # React entry point
│   │   ├── index.css             # Global styles
│   │   ├── App.js                # Main App component
│   │   ├── App.css               # App styles
│   │   └── pages/
│   │       ├── LoginPage.js       # Login component
│   │       ├── LoginPage.css
│   │       ├── Dashboard.js       # Main dashboard
│   │       ├── Dashboard.css
│   │       ├── ChatPage.js        # Chat interface
│   │       ├── ChatPage.css
│   │       ├── SettingsPage.js    # Settings & config
│   │       └── SettingsPage.css
│   └── package.json              # Frontend dependencies
├── dataset/
│   ├── timetable.csv             # Class timetable
│   ├── exam_dates.csv            # Exam schedule
│   ├── faculty_contacts.csv      # Faculty information
│   ├── attendance.json           # Student attendance data
│   ├── notices.txt               # College notices
│   └── department_info.txt       # Department information
├── embeddings/                   # Vector embeddings storage
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm
- Python 3.8+
- Ollama (for local LLM) OR HuggingFace API key

### Installation

#### 1. Backend Setup (Node.js)

```bash
cd backend
npm install
```

#### 2. Python RAG Setup

```bash
cd backend/rag_system
pip install -r requirements.txt
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

### Running the Application

#### Terminal 1: Start Python RAG Server

```bash
cd backend/rag_system
python app.py
# Server runs on http://localhost:5001
```

#### Terminal 2: Start Node.js Backend API

```bash
cd backend
npm start
# API runs on http://localhost:5000
```

#### Terminal 3: Start React Frontend

```bash
cd frontend
npm start
# Frontend opens on http://localhost:3000
```

### Setting Up Ollama (Optional but Recommended)

For best results, use Ollama with Mistral model:

1. **Install Ollama**: https://ollama.ai
2. **Pull Mistral Model**:
   ```bash
   ollama pull mistral
   ```
3. **Start Ollama**:
   ```bash
   ollama serve
   ```
   Ollama will run on `http://localhost:11434`

If Ollama is not available, the system will fall back to HuggingFace models.

## 👥 Login Credentials

### Demo Users

```
Student:
  Email: student@test.com
  Password: student123

Teacher:
  Email: teacher@test.com
  Password: teacher123

Parent:
  Email: parent@test.com
  Password: parent123
```

## 📊 Dashboard Features

### 👨‍🎓 Student Portal
- View class timetable
- Check exam schedule
- View attendance percentage
- Read college notices
- Ask chatbot about schedules and faculty
- Download notes (if available)

### 👨‍🏫 Teacher Portal
- View class timetable
- View student list
- Upload notices
- Ask chatbot queries
- Access analytics

### 👨‍👩‍👧 Parent Portal
- Check child's attendance
- View exam schedule
- Contact information
- College notices
- Ask chatbot questions about child's schedule

## 🤖 RAG Pipeline

### How It Works

1. **Document Loading** - Load CSV, TXT, and JSON files from dataset/
2. **Text Splitting** - Split documents into manageable chunks
3. **Embeddings** - Convert text to vector embeddings using sentence-transformers
4. **Vector Storage** - Store embeddings in ChromaDB
5. **Retrieval** - Find top-k most similar documents for user query
6. **LLM Generation** - Generate response using retrieved context + LLM
7. **Response** - Return generated answer with context (optional)

### Configuration

In the Settings page, you can adjust:

- **Embedding Model**: Change the embedding model used
  - `all-MiniLM-L6-v2` (Fast, Recommended)
  - `all-mpnet-base-v2` (Higher Quality)
  - `paraphrase-MiniLM-L6-v2` (Paraphrase Optimized)

- **Top-K Retrieval**: Number of documents to retrieve (1-10)
  - Higher = More context = Slower but more comprehensive
  - Lower = Faster but less context

- **Temperature**: LLM response creativity (0.0-1.0)
  - Lower (0.0-0.3) = More focused and deterministic
  - Higher (0.7-1.0) = More creative and varied

- **Debug Mode**: Show retrieved context documents in chat

## 📚 Dataset

### CSV Files
- `timetable.csv` - Day, Time, Subject, Faculty
- `exam_dates.csv` - Subject, Date, Time, Room
- `faculty_contacts.csv` - Name, Subject, Email, Phone

### Text Files
- `notices.txt` - College notices and announcements
- `department_info.txt` - Department information

### JSON Files
- `attendance.json` - Student attendance records

## 🔗 API Endpoints

### Authentication
- `POST /api/login` - User login

### Chat
- `POST /api/chat` - Send query to chatbot
- `GET /api/chat-history` - Get user chat history
- `POST /api/chat-history/clear` - Clear chat history

### Data Retrieval
- `GET /api/get-timetable` - Get class timetable
- `GET /api/get-exams` - Get exam schedule
- `GET /api/get-attendance` - Get student attendance
- `GET /api/get-faculty` - Get faculty information
- `GET /api/get-notices` - Get college notices
- `GET /api/get-department-info` - Get department information

### System
- `GET /api/health` - Health check
- `GET /api/analytics` - Get query analytics
- `GET/POST /api/config` - Get or update RAG configuration

## 🧪 Testing

### Test Login Flow
1. Open http://localhost:3000
2. Click on "Student Demo" button
3. Dashboard should load with student-specific features

### Test Chatbot
1. Go to Dashboard → Chat
2. Try: "What is the timetable for this week?"
3. Bot should retrieve relevant documents and respond

### Test Role-Based Features
1. Log in as Student → See "Attendance" tab
2. Log in as Teacher → See different dashboard features
3. Log in as Parent → See parent-specific information

### Test Configuration
1. Go to Settings page
2. Change embedding model and temperature
3. Go back to Chat and test responses (should vary)

## 🛠️ Troubleshooting

### Python RAG Server Not Starting
```bash
# Make sure dependencies are installed
cd backend/rag_system
pip install -r requirements.txt --upgrade

# Check if port 5001 is available
lsof -i :5001  # macOS/Linux
netstat -ano | findstr :5001  # Windows
```

### Node.js Backend Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if port 5000 is available
```

### React Frontend Not Loading
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules package-lock.json .cache
npm install
npm start
```

### Ollama Connection Issues
```bash
# Make sure Ollama is running
ollama serve

# Test connection
curl http://localhost:11434/api/tags

# If port 11434 is in use, change RAG_BACKEND in .env
```

### Dataset Not Loading
```bash
# Verify dataset files exist
ls dataset/

# Make sure files have correct encoding (UTF-8)
# Restart Python RAG server
```

## 📈 Performance Tips

1. **Use `all-MiniLM-L6-v2`** - Best balance of speed and quality
2. **Set k=3-5** - Enough context without excessive retrieval
3. **Enable Ollama** - Significantly faster than HuggingFace API
4. **Cache embeddings** - ChromaDB automatically caches them
5. **Adjust temperature to 0.5** - Good balance of consistency and variety

## 🔐 Security Notes

- **Demo Credentials**: For demonstration only. Use proper authentication in production
- **No HTTPS**: Add HTTPS in production
- **Environment Variables**: Keep sensitive data in `.env` files
- **API Keys**: Don't commit API keys to version control
- **Database**: Use authenticated databases in production

## 🎯 Future Enhancements

- [ ] User authentication with JWT tokens
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] File upload for notices (by teachers)
- [ ] Real-time notifications
- [ ] Email alerts
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Mobile app
- [ ] Graph database for relationships
- [ ] Semantic search improvements
- [ ] Response caching

## 📖 Tech Stack Details

### Frontend
- **React 18.2** - UI framework
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend
- **Node.js + Express** - REST API server
- **Python Flask** - RAG server
- **ChromaDB** - Vector database
- **sentence-transformers** - Embedding generation
- **LangChain** - LLM orchestration

### AI/ML
- **Ollama** - Local LLM serving
- **Mistral** - Open-source LLM
- **HuggingFace** - Fallback LLM/embeddings
- **ChromaDB** - Vector storage and retrieval

## 📝 Adding New Data

### Add CSV Data
1. Create `.csv` file in `dataset/`
2. Use format: Column1,Column2,Column3
3. Restart Python RAG server

### Add Text Data
1. Create `.txt` file in `dataset/`
2. Use paragraphs separated by blank lines
3. Restart Python RAG server

### Add JSON Data
1. Create `.json` file in `dataset/`
2. Use valid JSON format
3. Restart Python RAG server

The RAG system will automatically load new files on restart!

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues, questions, or suggestions:
- Check existing issues on GitHub
- Create a new issue with detailed description
- Include error logs and steps to reproduce

## 👨‍💻 Author

Built with ❤️ for BMSIT College

---

**Happy Chatting! 🎉**

For more information, visit:
- Backend Docs: [Backend README](backend/README.md)
- Frontend Docs: [Frontend README](frontend/README.md)
