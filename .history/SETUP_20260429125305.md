# Setup & Installation Guide

Complete step-by-step guide to set up and run the BMSIT Chatbot Application.

## System Requirements

- **OS**: Windows, macOS, or Linux
- **Node.js**: v14 or higher
- **Python**: v3.8 or higher
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk**: Minimum 2GB free space

## Installation Steps

### Step 1: Clone or Download the Project

```bash
# Navigate to your projects directory
cd your/projects/directory

# If using git
git clone <repository-url> bmsit-chatbot
cd bmsit-chatbot

# Or extract the downloaded ZIP file
cd bmsit-chatbot
```

### Step 2: Install Backend Dependencies

```bash
cd backend

# Install Node.js dependencies
npm install
```

Wait for the installation to complete. This installs:
- Express.js (Web server)
- CORS (Cross-origin support)
- Axios (HTTP client)
- dotenv (Environment configuration)
- body-parser (Request parsing)
- multer (File uploads)
- csv-parser (CSV parsing)

### Step 3: Install Python RAG Dependencies

```bash
cd backend/rag_system

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

Python packages installed:
- Flask (Web server)
- flask-cors (CORS support)
- chromadb (Vector database)
- sentence-transformers (Embeddings)
- python-dotenv (Environment config)
- requests (HTTP library)
- pandas (Data processing)
- numpy (Numerical computing)

### Step 4: Install Frontend Dependencies

```bash
cd frontend

# Install React dependencies
npm install
```

This installs:
- React (UI library)
- react-dom (React DOM library)
- react-router-dom (Routing)
- axios (HTTP client)
- react-scripts (Build tools)

### Step 5: Setup Ollama (Recommended)

For the best LLM experience, install and run Ollama:

1. **Download Ollama**:
   - Visit https://ollama.ai
   - Download for your OS
   - Install following instructions

2. **Pull Mistral Model**:
   ```bash
   ollama pull mistral
   ```

3. **Start Ollama Service**:
   ```bash
   ollama serve
   ```

   Ollama will start on: `http://localhost:11434`

   Keep this terminal running while using the chatbot.

**Alternative**: If you don't want to use Ollama, the system will fallback to HuggingFace models (slower but works).

### Step 6: Verify Installation

Check if everything is installed correctly:

```bash
# Check Node.js version
node --version  # Should be v14 or higher

# Check npm version
npm --version

# Check Python version
python --version  # Should be 3.8 or higher

# Check pip version
pip --version

# Verify key packages
pip list | grep chromadb
pip list | grep Flask
```

## Running the Application

You need to run three servers simultaneously. Use three separate terminal windows:

### Terminal 1: Start Python RAG Server

```bash
cd backend/rag_system

# Activate virtual environment (if created)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start the server
python app.py

# Expected output:
# ✓ RAG Pipeline initialized successfully!
# * Running on http://localhost:5001
```

### Terminal 2: Start Node.js Backend API

Open a NEW terminal window:

```bash
cd backend

# Start the API server
npm start

# Expected output:
# ✓ Backend server running on http://localhost:5000
# ✓ API endpoints available at http://localhost:5000/api
```

### Terminal 3: Start React Frontend

Open a THIRD terminal window:

```bash
cd frontend

# Start the development server
npm start

# Expected output:
# Compiled successfully!
# You can now view bmsit-chatbot-frontend in the browser.
# Local: http://localhost:3000
```

The frontend will automatically open in your browser at `http://localhost:3000`

## First Time Setup Checklist

- [ ] Node.js v14+ installed
- [ ] Python 3.8+ installed
- [ ] Backend npm modules installed
- [ ] Python dependencies installed
- [ ] Ollama installed and running (optional but recommended)
- [ ] All three servers running
- [ ] Browser shows login page at http://localhost:3000

## Accessing the Application

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000
3. **Python RAG**: http://localhost:5001
4. **Ollama** (optional): http://localhost:11434

## Login with Demo Credentials

### Option 1: Manual Login

1. Go to http://localhost:3000
2. Enter credentials:
   - **Student**: student@test.com / student123
   - **Teacher**: teacher@test.com / teacher123
   - **Parent**: parent@test.com / parent123
3. Click Login

### Option 2: One-Click Demo Login

Click the role buttons on login page:
- 👨‍🎓 Student Demo
- 👨‍🏫 Teacher Demo
- 👨‍👩‍👧 Parent Demo

## Testing the Chatbot

1. Navigate to the **Chat** page
2. Try these queries:
   - "What is the timetable for this week?"
   - "When are the exams scheduled?"
   - "Who are the faculty members?"
   - "Show me college notices"
   - "What is the department information?"

## Configuration

### Environment Variables

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
DEBUG_MODE=true
PYTHON_RAG_URL=http://localhost:5001
```

**Python RAG (.env)** - Optional, create if needed
```
DEBUG_MODE=true
OLLAMA_URL=http://localhost:11434
```

### Customize Settings in App

1. Go to Settings page
2. Change embedding model
3. Adjust top-k documents
4. Modify temperature
5. Toggle debug mode

## Troubleshooting

### Issue: Port Already in Use

```bash
# Check what's using the port (example port 5000)
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill the process or use different port
```

### Issue: Python Dependencies Won't Install

```bash
# Try upgrading pip first
pip install --upgrade pip

# Then install requirements
pip install -r requirements.txt --upgrade
```

### Issue: React Won't Start

```bash
cd frontend

# Clear cache
rm -rf node_modules package-lock.json .cache

# Reinstall
npm install

# Start fresh
npm start
```

### Issue: Ollama Connection Error

1. Make sure Ollama is installed and running
2. Check: `curl http://localhost:11434/api/tags`
3. If not working, RAG system will fallback to HuggingFace (slower)

### Issue: No Data in Chatbot

1. Check dataset files exist in `dataset/` folder
2. Verify file formats (CSV headers, JSON syntax)
3. Restart Python RAG server
4. Check browser console for errors (F12)

## Production Deployment

For production use:

1. **Use Environment Variables**: Store sensitive data in .env
2. **Enable HTTPS**: Use SSL certificates
3. **Add Authentication**: Implement proper JWT tokens
4. **Use Database**: Replace in-memory storage with MongoDB/PostgreSQL
5. **Add Rate Limiting**: Prevent abuse
6. **Enable Logging**: Track errors and usage
7. **Optimize Performance**: Enable caching and CDN
8. **Security**: Add input validation, sanitization, CSRF protection

## Next Steps

1. Explore the dashboard with different user roles
2. Try the chatbot with various queries
3. Check the Settings page to configure RAG parameters
4. Review the Analytics to see query patterns
5. Customize the dataset with your own data
6. Integrate with your college's actual data sources

## Getting Help

- Check the main [README.md](../README.md)
- Review error messages in terminal
- Check browser console (F12 → Console tab)
- Look at network requests (F12 → Network tab)

## Performance Tips

- Use `all-MiniLM-L6-v2` embedding model (fastest)
- Set k=3-5 for good balance
- Use Ollama instead of HuggingFace API
- Temperature 0.5-0.7 for best results
- Clear chat history occasionally

---

**Happy Setting Up! 🚀**

If you encounter any issues, check the troubleshooting section or review the error messages carefully.
