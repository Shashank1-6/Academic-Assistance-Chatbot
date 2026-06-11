# System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BMSIT CHATBOT SYSTEM                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Web Browser)                           │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    React Frontend (Port 3000)                      │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │                                                              │ │ │
│  │  │  [Login Page] → [Dashboard] → [Chat] → [Settings]           │ │ │
│  │  │                                                              │ │ │
│  │  │  Components:                                                │ │ │
│  │  │  - Role-based routing                                       │ │ │
│  │  │  - Chat interface                                           │ │ │
│  │  │  - Data display (Timetable, Exams, etc.)                   │ │ │
│  │  │  - Configuration panels                                    │ │ │
│  │  │                                                              │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  │                          ↓ (Axios)                                 │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓
                              HTTP/REST
                                   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                    API LAYER (Node.js + Express)                         │
│                         (Port 5000)                                      │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ API Routes:                                                        │ │
│  │ ├── /api/login (Authentication)                                   │ │
│  │ ├── /api/chat (Chatbot queries)                                   │ │
│  │ ├── /api/chat-history (User history)                              │ │
│  │ ├── /api/get-timetable (Data retrieval)                           │ │
│  │ ├── /api/get-exams (Exam schedule)                                │ │
│  │ ├── /api/get-attendance (Attendance data)                         │ │
│  │ ├── /api/get-faculty (Faculty info)                               │ │
│  │ ├── /api/get-notices (Notices)                                    │ │
│  │ ├── /api/analytics (Query stats)                                  │ │
│  │ └── /api/health (System status)                                   │ │
│  │                                                                    │ │
│  │ Middleware:                                                        │ │
│  │ - CORS handling                                                    │ │
│  │ - Body parsing                                                     │ │
│  │ - Error handling                                                   │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                 ↓                              ↓
            (JSON/REST)                   (HTTP Requests)
                 ↓                              ↓
    ┌────────────────────────┐    ┌────────────────────────┐
    │  PYTHON RAG SERVER     │    │  IN-MEMORY DATA        │
    │    (Port 5001)         │    │  STORAGE               │
    │                        │    │                        │
    │ Flask Application      │    │ - Timetable            │
    │ ┌──────────────────┐  │    │ - Exams                │
    │ │ RAG Pipeline     │  │    │ - Faculty              │
    │ │ ┌──────────────┐ │  │    │ - Notices              │
    │ │ │ 1. Document  │ │  │    │ - Attendance           │
    │ │ │    Loader    │ │  │    │ - Analytics            │
    │ │ └──────────────┘ │  │    │ - Chat History         │
    │ │ ┌──────────────┐ │  │    │                        │
    │ │ │ 2. Text      │ │  │    └────────────────────────┘
    │ │ │    Splitter  │ │  │
    │ │ └──────────────┘ │  │
    │ │ ┌──────────────┐ │  │
    │ │ │ 3. Embedding │ │  │
    │ │ │    Generator │ │  │
    │ │ └──────────────┘ │  │
    │ │ ┌──────────────┐ │  │
    │ │ │ 4. Vector DB │ │  │
    │ │ │    (ChromaDB)│ │  │
    │ │ └──────────────┘ │  │
    │ │ ┌──────────────┐ │  │
    │ │ │ 5. Retriever │ │  │
    │ │ │    (Top-K)   │ │  │
    │ │ └──────────────┘ │  │
    │ │ ┌──────────────┐ │  │
    │ │ │ 6. LLM       │ │  │
    │ │ │    Response  │ │  │
    │ │ └──────────────┘ │  │
    │ └──────────────────┘  │
    │                        │
    └────────────────────────┘
         ↓              ↓
     (Local)        (API Call)
         ↓              ↓
    ┌─────────────┐  ┌──────────────────┐
    │  ChromaDB   │  │ Ollama / LLM API │
    │ Vector DB   │  │  (Port 11434)    │
    │ (Local)     │  │ or HuggingFace   │
    └─────────────┘  └──────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                      DATASET LAYER                                       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  /dataset                                                        │  │
│  │  ├── timetable.csv           (Class schedule)                    │  │
│  │  ├── exam_dates.csv          (Exam schedule)                     │  │
│  │  ├── faculty_contacts.csv    (Faculty info)                      │  │
│  │  ├── attendance.json         (Student attendance)                │  │
│  │  ├── notices.txt             (College notices)                   │  │
│  │  └── department_info.txt     (Department details)                │  │
│  │                                                                  │  │
│  │  When RAG server starts: All files are loaded into ChromaDB     │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Chat Query Flow

```
┌─────────────────┐
│  User Question  │
│  "What is the   │
│  timetable?"    │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│  React Frontend         │
│  Send via Axios         │
│  http://localhost:5000/ │
│  api/chat               │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Node.js Express Server     │
│  POST /api/chat             │
│  - Extract query            │
│  - Extract user email       │
│  - Extract parameters (k,   │
│    temperature, etc.)       │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Forward to RAG Server      │
│  POST to Python Flask       │
│  http://localhost:5001/api/ │
│  chat                       │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Python RAG Pipeline        │
│  1. Generate embedding of   │
│     query                   │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  ChromaDB Query             │
│  Find top-k similar docs    │
│  using cosine similarity    │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Retrieved Documents        │
│  (Top 3 matches)            │
│  - From timetable.csv       │
│  - With similarity scores   │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Build Context              │
│  Combine all retrieved docs │
│  into a single context text │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Call LLM with Prompt       │
│  - Original query           │
│  - Retrieved context        │
│  - Temperature parameter    │
│  - Max tokens               │
└────────┬────────────────────┘
         │
         ├─→ If Ollama available
         │   (localhost:11434)
         │   ↓
         │   [Mistral Model]
         │   Generates response
         │
         └─→ If Ollama not available
             ↓
             [HuggingFace Fallback]
             Generates response
         │
         ↓
┌─────────────────────────────┐
│  Response Generated         │
│  "Based on the timetable,   │
│  here are the classes..."   │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Return to Backend API      │
│  - Answer text              │
│  - Retrieved context (if    │
│    debug mode on)           │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Store in Chat History      │
│  - User query               │
│  - Bot response             │
│  - Timestamp                │
│  - User role                │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Update Analytics           │
│  - Increment query count    │
│  - Track by role            │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Send to Frontend           │
│  JSON Response:             │
│  {                          │
│    success: true,           │
│    answer: "...",           │
│    context: [...],          │
│    timestamp: "..."         │
│  }                          │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Display in Chat UI         │
│  - Show bot response        │
│  - Option to view context   │
│  - Store locally in browser │
│  - Ready for next query     │
└─────────────────────────────┘
```

## Technology Stack Layers

```
┌────────────────────────────────────────────┐
│  FRONTEND LAYER (Client-Side)              │
│  ├── React 18.2 (UI Framework)             │
│  ├── React Router v6 (Navigation)          │
│  ├── Axios (HTTP Client)                   │
│  ├── CSS3 (Styling)                        │
│  └── Lucide React (Icons)                  │
└────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────┐
│  API GATEWAY LAYER                         │
│  ├── Node.js Runtime (v14+)                │
│  ├── Express Framework                     │
│  ├── CORS Middleware                       │
│  ├── Body Parser                           │
│  └── Error Handling                        │
└────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────┐
│  SERVICE LAYER                             │
│  ├── Authentication Service                │
│  ├── Data Retrieval Service                │
│  ├── Chat Service (proxy to RAG)           │
│  ├── Analytics Service                     │
│  └── Configuration Service                 │
└────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────┐
│  RAG SYSTEM LAYER (Python)                 │
│  ├── Flask Web Server                      │
│  ├── Document Processing                   │
│  ├── Embeddings (sentence-transformers)    │
│  ├── Vector Search (ChromaDB)              │
│  ├── LLM Integration (Ollama/HuggingFace)  │
│  └── Response Generation                   │
└────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────┐
│  DATA LAYER                                │
│  ├── Vector Database (ChromaDB)            │
│  ├── In-Memory Storage (Python)            │
│  ├── File System (CSV, TXT, JSON)          │
│  └── Local Storage (Browser)               │
└────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────┐
│  EXTERNAL SERVICES                         │
│  ├── Ollama (Local LLM - Optional)         │
│  ├── HuggingFace (Fallback LLM/Embeddings) │
│  └── Browser APIs (LocalStorage, etc.)     │
└────────────────────────────────────────────┘
```

## Database Schema (In-Memory)

```
Chat History:
{
  email: string,
  messages: [
    {
      timestamp: ISO-8601,
      query: string,
      response: string,
      role: 'student' | 'teacher' | 'parent'
    }
  ]
}

Analytics:
{
  total_queries: number,
  queries_by_role: {
    student: number,
    teacher: number,
    parent: number
  }
}

ChromaDB Collection:
{
  id: string,
  document: string,
  embedding: float[],
  metadata: {
    source: string,
    type: 'csv' | 'txt' | 'json'
  }
}
```

## Request/Response Examples

### Login Request
```json
POST /api/login
{
  "email": "student@test.com",
  "password": "student123"
}

Response:
{
  "success": true,
  "role": "student",
  "email": "student@test.com",
  "name": "Student User",
  "message": "Welcome student!"
}
```

### Chat Request
```json
POST /api/chat
{
  "query": "What is the timetable?",
  "email": "student@test.com",
  "k": 3,
  "temperature": 0.7,
  "debugMode": false
}

Response:
{
  "success": true,
  "answer": "Based on the timetable...",
  "context": [
    {
      "text": "Monday 9:00-10:00 Mathematics...",
      "similarity": 0.89,
      "source": "timetable.csv",
      "type": "csv"
    }
  ],
  "query": "What is the timetable?",
  "timestamp": "2024-05-15T10:30:00Z"
}
```

## Scalability Considerations

For production use, consider:

1. **Frontend**: Deploy to CDN (Cloudflare, AWS CloudFront)
2. **Backend API**: Horizontal scaling with load balancer (Nginx, AWS ELB)
3. **RAG Service**: Multiple instances with queue system (RabbitMQ, Redis)
4. **Database**: Replace in-memory with MongoDB or PostgreSQL
5. **Vector DB**: Migrate ChromaDB to Pinecone or Milvus
6. **Caching**: Add Redis for response caching
7. **Authentication**: Implement JWT tokens and refresh
8. **Monitoring**: Add logging (ELK Stack) and monitoring (Prometheus)

---

This architecture ensures a scalable, maintainable, and performant chatbot system.
