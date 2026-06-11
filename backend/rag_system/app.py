"""
BMSIT Chatbot Backend API
Flask server for chatbot endpoints
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from rag_pipeline import RAGPipeline
import json
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'dataset')
DEBUG_MODE = os.getenv('DEBUG_MODE', 'False').lower() == 'true'

# Initialize RAG Pipeline
rag_pipeline = None
chat_history = {}
query_stats = {'total_queries': 0, 'queries_by_role': {}}

# User credentials (hardcoded for demo)
USERS = {
    'student@test.com': {'password': 'student123', 'role': 'student'},
    'teacher@test.com': {'password': 'teacher123', 'role': 'teacher'},
    'parent@test.com': {'password': 'parent123', 'role': 'parent'}
}

# Initialize RAG Pipeline on startup
def init_rag_pipeline():
    global rag_pipeline
    try:
        print("Initializing RAG Pipeline...")
        rag_pipeline = RAGPipeline(embedding_model="all-MiniLM-L6-v2")
        rag_pipeline.clear_collection()
        # Load documents
        print(f"Loading documents from {DATASET_DIR}...")
        documents = rag_pipeline.load_all_documents(DATASET_DIR)
        print(f"Loaded {len(documents)} documents")
        
        # Add to ChromaDB
        rag_pipeline.add_documents(documents)
        print("RAG Pipeline initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing RAG Pipeline: {str(e)}")
        rag_pipeline = None

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'rag_initialized': rag_pipeline is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        user = USERS.get(email)
        if not user or user['password'] != password:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Initialize chat history for this user
        if email not in chat_history:
            chat_history[email] = []
        
        return jsonify({
            'success': True,
            'role': user['role'],
            'email': email,
            'message': f'Welcome {user["role"]}!'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint for RAG queries"""
    try:
        if not rag_pipeline:
            return jsonify({'error': 'RAG Pipeline not initialized'}), 500
        
        data = request.json
        query = data.get('query')
        email = data.get('email')
        k = data.get('k', 3)
        temperature = data.get('temperature', 0.7)
        use_ollama = data.get('use_ollama', True)
        
        if not query or not email:
            return jsonify({'error': 'Query and email required'}), 400
        
        # Get user role
        user = USERS.get(email)
        role = user['role'] if user else 'unknown'
        
        # Generate response
        response = rag_pipeline.chat(query, k=k, temperature=temperature, use_ollama=use_ollama)
        
        # Store in chat history
        if email not in chat_history:
            chat_history[email] = []
        
        chat_history[email].append({
            'timestamp': datetime.now().isoformat(),
            'query': query,
            'response': response['answer'],
            'role': role
        })
        
        # Update stats
        query_stats['total_queries'] += 1
        query_stats['queries_by_role'][role] = query_stats['queries_by_role'].get(role, 0) + 1
        
        return jsonify({
            'success': True,
            'answer': response['answer'],
            'context': response['context'] if DEBUG_MODE else [],
            'query': query,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat-history', methods=['GET'])
def get_chat_history():
    """Get chat history for a user"""
    try:
        email = request.args.get('email')
        
        if not email:
            return jsonify({'error': 'Email required'}), 400
        
        history = chat_history.get(email, [])
        
        return jsonify({
            'success': True,
            'history': history,
            'total_messages': len(history)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get chat analytics"""
    try:
        return jsonify({
            'total_queries': query_stats['total_queries'],
            'queries_by_role': query_stats['queries_by_role'],
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config', methods=['GET', 'POST'])
def config():
    """Get or update RAG configuration"""
    try:
        if request.method == 'GET':
            return jsonify({
                'embedding_model': rag_pipeline.embedding_model_name if rag_pipeline else None,
                'debug_mode': DEBUG_MODE
            }), 200
        
        elif request.method == 'POST':
            data = request.json
            embedding_model = data.get('embedding_model')
            
            if embedding_model and rag_pipeline:
                rag_pipeline.change_embedding_model(embedding_model)
                return jsonify({
                    'success': True,
                    'message': f'Embedding model changed to {embedding_model}'
                }), 200
            
            return jsonify({'error': 'Invalid request'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-timetable', methods=['GET'])
def get_timetable():
    """Get class timetable (role-specific)"""
    try:
        email = request.args.get('email')
        role = request.args.get('role')
        
        if not email:
            return jsonify({'error': 'Email required'}), 400
        
        # Read timetable CSV
        timetable_path = os.path.join(DATASET_DIR, 'timetable.csv')
        timetable = []
        
        if os.path.exists(timetable_path):
            import csv
            with open(timetable_path, 'r') as f:
                reader = csv.DictReader(f)
                timetable = list(reader)
        
        return jsonify({
            'success': True,
            'timetable': timetable,
            'role': role
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-exams', methods=['GET'])
def get_exams():
    """Get exam schedule"""
    try:
        exam_path = os.path.join(DATASET_DIR, 'exam_dates.csv')
        exams = []
        
        if os.path.exists(exam_path):
            import csv
            with open(exam_path, 'r') as f:
                reader = csv.DictReader(f)
                exams = list(reader)
        
        return jsonify({
            'success': True,
            'exams': exams
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-attendance', methods=['GET'])
def get_attendance():
    """Get student attendance (role-specific)"""
    try:
        email = request.args.get('email')
        student_id = request.args.get('student_id', 'S001')
        
        if not email:
            return jsonify({'error': 'Email required'}), 400
        
        # Read attendance JSON
        attendance_path = os.path.join(DATASET_DIR, 'attendance.json')
        student_attendance = None
        
        if os.path.exists(attendance_path):
            with open(attendance_path, 'r') as f:
                data = json.load(f)
                for student in data.get('students', []):
                    if student['id'] == student_id:
                        student_attendance = student
                        break
        
        if student_attendance:
            return jsonify({
                'success': True,
                'attendance': student_attendance
            }), 200
        else:
            return jsonify({'error': 'Student not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-faculty', methods=['GET'])
def get_faculty():
    """Get faculty contact information"""
    try:
        faculty_path = os.path.join(DATASET_DIR, 'faculty_contacts.csv')
        faculty = []
        
        if os.path.exists(faculty_path):
            import csv
            with open(faculty_path, 'r') as f:
                reader = csv.DictReader(f)
                faculty = list(reader)
        
        return jsonify({
            'success': True,
            'faculty': faculty
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-notices', methods=['GET'])
def get_notices():
    """Get college notices"""
    try:
        notices_path = os.path.join(DATASET_DIR, 'notices.txt')
        notices = []
        
        if os.path.exists(notices_path):
            with open(notices_path, 'r') as f:
                content = f.read()
                # Parse notices
                for line in content.split('\n'):
                    if line.strip():
                        notices.append({'text': line.strip()})
        
        return jsonify({
            'success': True,
            'notices': notices
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_rag_pipeline()
    app.run(debug=True, host='0.0.0.0', port=5001)
