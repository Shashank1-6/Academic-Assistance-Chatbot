# Testing Guide

Complete testing procedures for the BMSIT Chatbot Application.

## Pre-Testing Checklist

- [ ] All three servers running (RAG, Backend, Frontend)
- [ ] Browser can access http://localhost:3000
- [ ] No console errors in terminal windows
- [ ] Database/dataset files present in `dataset/` folder
- [ ] Ollama running (if using local LLM)

## 1. Login Testing

### Test 1.1: Student Login

```
Step 1: Navigate to http://localhost:3000
Step 2: Click "Student Demo" button
Expected: Dashboard loads with student-specific features
          Attendance tab is visible
          Role shows "Student"
```

### Test 1.2: Teacher Login

```
Step 1: Navigate to http://localhost:3000
Step 2: Click "Teacher Demo" button
Expected: Dashboard loads
          Teacher-specific features visible
          Can access teacher functionalities
```

### Test 1.3: Parent Login

```
Step 1: Navigate to http://localhost:3000
Step 2: Click "Parent Demo" button
Expected: Dashboard loads
          Parent-specific features visible
          Can view child information
```

### Test 1.4: Manual Login

```
Step 1: Navigate to http://localhost:3000
Step 2: Enter student@test.com and student123
Step 3: Click Login
Expected: Successful login, redirected to dashboard
```

### Test 1.5: Failed Login

```
Step 1: Navigate to http://localhost:3000
Step 2: Enter wrong email/password
Step 3: Click Login
Expected: Error message displayed
          No redirect
          Form clears
```

## 2. Dashboard Testing

### Test 2.1: Overview Tab

```
Step 1: Click "Overview" in navigation
Expected: Cards showing:
          - Number of classes this week
          - Number of upcoming exams
          - Number of notices
          - AI Ready status
          - Quick action buttons
```

### Test 2.2: Timetable View

```
Step 1: Click "Timetable" tab
Expected: Table displays with columns:
          Day | Time | Subject | Faculty
          Multiple rows of schedule data
```

### Test 2.3: Exam Schedule

```
Step 1: Click "Exams" tab
Expected: Table displays with columns:
          Subject | Date | Time | Room
          Multiple exam entries
```

### Test 2.4: Attendance (Students Only)

```
Step 1: Login as student
Step 2: Click "Attendance" tab
Expected: Student name displayed
          Attendance percentage shown for each subject
          Visual bar indicators
          Color coding (Green: 75%+, Orange: 60-75%, Red: <60%)
```

### Test 2.5: Notices

```
Step 1: Click "Notices" tab
Expected: List of college notices
          Each notice has:
          - Notice number
          - Notice text
          - Clear formatting
```

## 3. Chatbot Testing

### Test 3.1: Basic Chat

```
Step 1: Navigate to Chat page
Step 2: Type "Hello"
Expected: Bot responds appropriately
          Message appears in conversation
          Timestamp shown
```

### Test 3.2: Timetable Query

```
Step 1: Type "What is the timetable for this week?"
Expected: Bot retrieves and displays timetable information
          Relevant documents shown (if debug mode on)
          Natural response generated
```

### Test 3.3: Exam Schedule Query

```
Step 1: Type "When are the exams scheduled?"
Expected: Exam dates retrieved
          Response includes dates and times
          Accurate information shown
```

### Test 3.4: Faculty Query

```
Step 1: Type "Who are the faculty members?"
Expected: Faculty information retrieved
          List of teachers shown
          Contact details available
```

### Test 3.5: Empty Query

```
Step 1: Click send without typing
Expected: Message not sent
          Send button remains inactive
```

### Test 3.6: Long Query

```
Step 1: Type a very long query (100+ characters)
Expected: Message still processes correctly
          No truncation issues
          Response handles complex query
```

## 4. Configuration Testing

### Test 4.1: Change Embedding Model

```
Step 1: Go to Settings page
Step 2: Click "Settings" button on Chat page
Step 3: Change embedding model dropdown
Step 4: Click "Update Model"
Expected: Success message shown
          Model changes applied
          No application crash
```

### Test 4.2: Adjust Top-K

```
Step 1: Go to Chat settings
Step 2: Use slider to change "Top-K Documents"
Step 3: Ask a new query
Expected: Slider updates value
          Query results vary with k value
          More results when k is higher
```

### Test 4.3: Adjust Temperature

```
Step 1: Go to Chat settings
Step 2: Use slider to change "Temperature"
Step 3: Ask the same query multiple times
Expected: Lower temp = consistent responses
          Higher temp = more varied responses
          Responses differ as expected
```

### Test 4.4: Debug Mode Toggle

```
Step 1: Enable Debug Mode in Settings
Step 2: Ask a query
Expected: Chat responses show "Show Context" button
          Retrieved documents displayed
Step 3: Disable Debug Mode
Step 4: Ask another query
Expected: Context documents not shown
          Only answer displayed
```

## 5. Chat History Testing

### Test 5.1: Chat History Persistence

```
Step 1: Ask 3 questions
Step 2: Logout
Step 3: Login again
Step 4: Open Chat page
Expected: Previous conversation still visible
          All 3 messages showing
          Timestamps correct
```

### Test 5.2: Clear Chat History

```
Step 1: Open Chat settings
Step 2: Click "Clear Chat History"
Step 3: Click confirm
Expected: Chat window becomes empty
          Messages cleared
          New conversations start fresh
```

### Test 5.3: Different Users History

```
Step 1: Login as Student, ask 2 questions
Step 2: Logout
Step 3: Login as Teacher
Step 4: Go to Chat
Expected: Teacher sees empty chat (no student history)
          Each role has separate history
```

## 6. Role-Based Feature Testing

### Test 6.1: Student Features

```
As Student User:
- [ ] Can see Timetable
- [ ] Can see Exams
- [ ] Can see Attendance
- [ ] Can see Notices
- [ ] Can chat with bot
- [ ] Can ask about attendance
```

### Test 6.2: Teacher Features

```
As Teacher User:
- [ ] Can see Timetable
- [ ] Can see Exams
- [ ] Can see Notices
- [ ] Can chat with bot
- [ ] No Attendance tab (if role-restricted)
```

### Test 6.3: Parent Features

```
As Parent User:
- [ ] Can see Exam Schedule
- [ ] Can see Notices
- [ ] Can see Department Info
- [ ] Can chat with bot
- [ ] Limited to specific queries
```

## 7. Data Retrieval Testing

### Test 7.1: Get Timetable API

```bash
curl http://localhost:5000/api/get-timetable

Expected Response:
{
  "success": true,
  "timetable": [
    {"day": "Monday", "time": "9:00-10:00", ...}
  ]
}
```

### Test 7.2: Get Exams API

```bash
curl http://localhost:5000/api/get-exams

Expected Response:
{
  "success": true,
  "exams": [
    {"subject": "Mathematics", "date": "2026-05-15", ...}
  ]
}
```

### Test 7.3: Get Faculty API

```bash
curl http://localhost:5000/api/get-faculty

Expected Response:
{
  "success": true,
  "faculty": [
    {"name": "Dr. Smith", "subject": "Mathematics", ...}
  ]
}
```

### Test 7.4: Get Notices API

```bash
curl http://localhost:5000/api/get-notices

Expected Response:
{
  "success": true,
  "notices": [
    {"id": 1, "text": "Notice text here"}
  ]
}
```

## 8. Performance Testing

### Test 8.1: Response Time

```
Step 1: Ask a simple query
Step 2: Time how long response takes
Expected: Response within 2-5 seconds
          No timeout errors
```

### Test 8.2: Multiple Concurrent Queries

```
Step 1: Rapidly click send multiple times
Expected: All queries processed
          No lost messages
          Responses queued properly
```

### Test 8.3: Large Dataset Performance

```
Step 1: Add more CSV/TXT files to dataset/
Step 2: Restart RAG server
Step 3: Ask queries
Expected: Still responds in reasonable time
          No crashes with larger data
```

## 9. Error Handling Testing

### Test 9.1: Network Error

```
Step 1: Disconnect internet or stop backend
Step 2: Try to send chat message
Expected: Error message displayed
          User notified gracefully
          No application crash
```

### Test 9.2: Invalid Query

```
Step 1: Type special characters or very long query
Expected: System handles it gracefully
          Response provided or error shown
          No security issues
```

### Test 9.3: Session Timeout

```
Step 1: Login and wait (simulate session timeout)
Step 2: Try to use chat
Expected: Handled appropriately
          Redirect to login if needed
```

## 10. UI/UX Testing

### Test 10.1: Responsive Design

```
Step 1: Open app in desktop browser
Step 2: Resize browser window (smaller/larger)
Expected: Layout adapts properly
          No overlapping elements
          Buttons still clickable
```

### Test 10.2: Mobile Responsiveness

```
Step 1: Open on mobile device or use DevTools mobile view
Expected: Layout optimized for mobile
          Touch-friendly buttons
          Readable text
```

### Test 10.3: Theme Consistency

```
Step 1: Navigate through app pages
Expected: Consistent color scheme
          Same styling across pages
          Professional appearance
```

## 11. Analytics Testing

### Test 11.1: Query Analytics

```
Step 1: Ask 5 queries as Student
Step 2: Go to Settings → Analytics
Expected: Shows total queries: 5
          Shows student queries: 5
          Correct count
```

### Test 11.2: Multi-Role Analytics

```
Step 1: Ask 3 queries as Student
Step 2: Logout, login as Teacher
Step 3: Ask 2 queries as Teacher
Step 4: Check Analytics
Expected: Total queries: 5
          Student: 3
          Teacher: 2
```

## 12. RAG Pipeline Testing

### Test 12.1: Document Loading

```
Terminal 1 output check:
- "Loading documents from..."
- "Loaded X documents"
- "RAG Pipeline initialized successfully!"
```

### Test 12.2: Embedding Generation

```
Step 1: Monitor terminal 1 during first query
Expected: Embeddings are generated
          ChromaDB processes them
          No "dimension mismatch" errors
```

### Test 12.3: Retrieval Accuracy

```
Step 1: Enable debug mode
Step 2: Ask specific query about data
Step 3: Check retrieved documents
Expected: Retrieved docs are relevant
          High similarity scores
          Answer is accurate
```

## Test Results Template

```
Test Case: [Test Name]
Date: [Date]
Tester: [Name]
Status: [PASS/FAIL]
Comments: [Any notes]

Actual Result:
[What happened]

Expected Result:
[What should happen]

Difference/Issues:
[Any differences found]
```

## Automated Testing Commands

```bash
# Test API health
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"student123"}'

# Test chat
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the timetable?","email":"student@test.com","k":3,"temperature":0.7}'

# Test analytics
curl http://localhost:5000/api/analytics
```

## Performance Benchmarks

Expected performance metrics:

- Login response: < 500ms
- Timetable retrieval: < 300ms
- Chat response: 2-5 seconds
- Dashboard load: < 2 seconds
- Page transitions: < 500ms
- Memory usage: < 500MB per server

---

**Happy Testing! 🧪**

Run through all tests systematically to ensure complete application functionality.
