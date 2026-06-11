# Quick Start Guide ⚡

Get the BMSIT Chatbot running in 5 minutes!

## Prerequisites Check

```bash
node --version   # Should be v14 or higher
npm --version    # Should be v6 or higher
python --version # Should be v3.8 or higher
```

## 3-Step Setup

### Step 1: Install Dependencies

```bash
# Backend Node packages
cd backend
npm install

# Python RAG dependencies
cd rag_system
pip install -r requirements.txt
cd ../..

# Frontend React
cd frontend
npm install
cd ..
```

### Step 2: Start Three Terminals

**Terminal 1: Python RAG Server**
```bash
cd backend/rag_system
python app.py
# Runs on http://localhost:5001
```

**Terminal 2: Node Backend API**
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 3: React Frontend**
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

### Step 3: Login & Test

1. Open http://localhost:3000
2. Click "Student Demo"
3. Go to Chat page
4. Ask: "What is the timetable?"
5. Get AI-powered response!

## One-Command Start (Linux/macOS)

If using bash:

```bash
# Terminal 1
(cd backend/rag_system && python app.py) &

# Terminal 2
(cd backend && npm start) &

# Terminal 3
(cd frontend && npm start) &
```

## Quick Test Queries

Try these in the chatbot:

```
"What is the timetable for this week?"
"When are the exams scheduled?"
"Who are the faculty members?"
"Show me college notices"
"What is BMSIT department information?"
"What is the attendance of Alice Johnson?"
```

## Demo Credentials

```
👨‍🎓 Student:  student@test.com / student123
👨‍🏫 Teacher:  teacher@test.com / teacher123
👨‍👩‍👧 Parent:   parent@test.com / parent123
```

## Verify Setup

### Check All Servers Running

```bash
# API Health
curl http://localhost:5000/api/health

# Get Timetable
curl http://localhost:5000/api/get-timetable

# Get Exams
curl http://localhost:5000/api/get-exams
```

### Expected Outputs

✅ Frontend: http://localhost:3000 loads login page
✅ Backend: http://localhost:5000/api/health returns `{"status": "healthy"}`
✅ RAG: Logs show "RAG Pipeline initialized successfully!"

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| Port 5000 in use | `lsof -i :5000` then `kill -9 <PID>` |
| Port 3000 in use | `lsof -i :3000` then `kill -9 <PID>` |
| npm not found | Install Node.js from nodejs.org |
| Python not found | Install Python from python.org |
| pip install fails | Try `pip install --upgrade pip` first |
| React won't start | Delete `node_modules`, run `npm install` again |
| Can't connect to RAG | Make sure you're in `backend/rag_system` directory |

## Key Features to Try

### 1. Role-Based Access
- Login as Student/Teacher/Parent
- See different dashboards
- Notice differences in available features

### 2. Chatbot & RAG
- Ask questions about data
- Notice different responses
- Try debug mode to see retrieved documents

### 3. Dashboard
- View Timetable, Exams, Notices
- Check Attendance (Students only)
- See Faculty information

### 4. Configuration
- Change embedding model
- Adjust top-k documents
- Modify temperature
- Toggle debug mode

### 5. Analytics
- Check query statistics
- See queries by role
- Monitor usage patterns

## File Structure Overview

```
chatBot/
├── backend/          (Node.js API + Python RAG)
├── frontend/         (React app)
├── dataset/          (CSV, JSON, TXT files)
├── README.md         (Full documentation)
├── SETUP.md          (Detailed setup)
├── TESTING.md        (Test procedures)
├── ARCHITECTURE.md   (System architecture)
└── QUICK_START.md    (This file!)
```

## Common Customizations

### Add New Data

1. **Add CSV file**:
   ```bash
   echo "Column1,Column2,Column3
   Value1,Value2,Value3" > dataset/my_data.csv
   ```

2. **Restart RAG server**:
   ```bash
   # Stop Terminal 1 with Ctrl+C
   # Restart Python RAG
   ```

3. **Ask chatbot**:
   ```
   "Tell me about my_data"
   ```

### Change LLM Model

1. Install Ollama: https://ollama.ai
2. Pull different model: `ollama pull neural-chat`
3. Update RAG code to use new model

### Customize Users

Edit `backend/server.js` USERS object:

```javascript
const USERS = {
  'your@email.com': { password: 'yourpassword', role: 'student', name: 'Your Name' }
};
```

## Performance Tips

```javascript
// Faster responses:
- Use all-MiniLM-L6-v2 embedding model
- Set k=3-5 documents
- Set temperature=0.5-0.7
- Enable Ollama for local LLM
- Use debug mode only when needed
```

## Next Steps

1. ✅ Get running (you just did it!)
2. 📖 Read [README.md](README.md) for detailed docs
3. 🧪 Follow [TESTING.md](TESTING.md) for test procedures
4. 🏗️ Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
5. 📚 Setup guide: [SETUP.md](SETUP.md)

## Common Questions

**Q: Is it really RAG?**
A: Yes! Uses ChromaDB for vector storage, retrieves top-k docs, feeds to LLM.

**Q: Can I use without Ollama?**
A: Yes! Falls back to HuggingFace (slower but works).

**Q: Can I add more data?**
A: Absolutely! Just add CSV/TXT/JSON to `dataset/` and restart RAG.

**Q: Is this production-ready?**
A: No, it's a demo. For production, add proper auth, database, monitoring.

**Q: Can I deploy online?**
A: Yes, deploy to AWS/Heroku/DigitalOcean (see ARCHITECTURE.md).

## Contact & Support

If issues arise:
1. Check error in terminal
2. Review SETUP.md troubleshooting
3. Check browser console (F12)
4. Verify all ports are accessible

---

**Now you're ready! 🚀**

Run the three commands and enjoy your chatbot!
