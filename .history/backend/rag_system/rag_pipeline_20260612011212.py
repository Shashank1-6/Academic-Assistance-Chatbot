"""
RAG Pipeline for BMSIT Chatbot
Handles document loading, embedding, and retrieval
"""

import os
import json
import csv
import chromadb
import time
from sentence_transformers import SentenceTransformer
import requests
from typing import List, Dict, Tuple

class RAGPipeline:
    def __init__(self, embedding_model: str = "all-MiniLM-L6-v2", collection_name: str = "bmsit_documents"):
        """
        Initialize RAG Pipeline
        
        Args:
            embedding_model: HuggingFace model name for embeddings
            collection_name: ChromaDB collection name
        """
        self.embedding_model_name = embedding_model
        self.embedder = SentenceTransformer(embedding_model)
        
        # Initialize ChromaDB
        self.client = chromadb.Client()
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        
        self.documents_store = {}  # Store document text for retrieval
        self.chunk_counter = 0
        
    def load_csv_files(self, csv_dir: str):
        """Load CSV files and create semantic chunks for each dataset row."""
        documents = []

        def normalize_time_range(time_value: str) -> str:
            parts = [part.strip() for part in time_value.split('-') if part.strip()]
            if len(parts) != 2:
                return time_value
            normalized_parts = []
            for part in parts:
                if part.upper().endswith(('AM', 'PM')):
                    normalized_parts.append(part)
                else:
                    normalized_parts.append(f"{part} AM")
            return " - ".join(normalized_parts)

        def format_date_iso(date_value: str) -> str:
            month_names = {
                '01': 'January', '02': 'February', '03': 'March', '04': 'April',
                '05': 'May', '06': 'June', '07': 'July', '08': 'August',
                '09': 'September', '10': 'October', '11': 'November', '12': 'December'
            }
            parts = date_value.split('-')
            if len(parts) != 3:
                return date_value
            year, month, day = parts
            month_text = month_names.get(month, month)
            return f"{int(day)} {month_text} {year}"

        for filename in os.listdir(csv_dir):
            if not filename.lower().endswith('.csv'):
                continue

            filepath = os.path.join(csv_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if filename.lower() == 'faculty_contacts.csv':
                        faculty_name = row.get('Name', '').strip()
                        doc_text = "\n".join([
                            'Faculty Information',
                            f"Faculty Name: {faculty_name}",
                            f"Subject: {row.get('Subject', '').strip()}",
                            f"Email: {row.get('Email', '').strip()}",
                            f"Phone: {''.join(ch for ch in row.get('Phone', '').strip() if ch.isdigit())}"
                        ])
                        documents.append({
                            'text': doc_text,
                            'source': filename,
                            'type': 'faculty',
                            'document_type': 'faculty',
                            'entity_name': faculty_name or 'Unknown Faculty'
                        })

                    elif filename.lower() == 'timetable.csv':
                        day = row.get('Day', '').strip()
                        subject = row.get('Subject', '').strip()
                        faculty = row.get('Faculty', '').strip()
                        time_value = normalize_time_range(row.get('Time', '').strip())
                        doc_text = "\n".join([
                            'Timetable Entry',
                            f"Day: {day}",
                            f"Subject: {subject}",
                            f"Faculty: {faculty}",
                            f"Time: {time_value}"
                        ])
                        documents.append({
                            'text': doc_text,
                            'source': filename,
                            'type': 'timetable',
                            'document_type': 'timetable',
                            'entity_name': f"{day} {subject}".strip() or 'Timetable Entry'
                        })

                    elif filename.lower() == 'exam_dates.csv':
                        subject = row.get('Subject', '').strip()
                        date_text = format_date_iso(row.get('Date', '').strip())
                        time_text = row.get('Time', '').strip()
                        room_text = row.get('Room', '').strip()
                        doc_text = "\n".join([
                            'Exam Schedule',
                            f"Subject: {subject}",
                            f"Date: {date_text}",
                            f"Time: {time_text}",
                            f"Room: {room_text}"
                        ])
                        documents.append({
                            'text': doc_text,
                            'source': filename,
                            'type': 'exam_schedule',
                            'document_type': 'exam_schedule',
                            'entity_name': subject or 'Exam Schedule'
                        })

                    else:
                        readable_text = "\n".join([f"{key}: {value}" for key, value in row.items() if str(value).strip()])
                        documents.append({
                            'text': readable_text,
                            'source': filename,
                            'type': 'csv',
                            'document_type': 'csv',
                            'entity_name': filename
                        })

        return documents

    def load_text_files(self, text_dir: str):
        """Load TXT files and split content into semantically meaningful chunks."""
        documents = []

        for filename in os.listdir(text_dir):
            if not filename.lower().endswith('.txt'):
                continue

            filepath = os.path.join(text_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if not content:
                    continue

                if filename.lower() == 'notices.txt':
                    notices = []
                    current_notice = []
                    for line in content.splitlines():
                        stripped = line.strip()
                        if not stripped:
                            continue
                        if stripped.lstrip().startswith(tuple(f"{i}." for i in range(1, 100))):
                            if current_notice:
                                notices.append(' '.join(current_notice).strip())
                            current_notice = [stripped.split('.', 1)[1].strip()]
                        elif stripped.lower().startswith('college notices'):
                            continue
                        elif current_notice:
                            current_notice.append(stripped)
                    if current_notice:
                        notices.append(' '.join(current_notice).strip())

                    for index, notice in enumerate(notices, start=1):
                        documents.append({
                            'text': "\n".join(['Notice', notice]),
                            'source': filename,
                            'type': 'notice',
                            'document_type': 'notice',
                            'entity_name': f"Notice {index}"
                        })

                elif filename.lower() == 'department_info.txt':
                    sections = {
                        'College Information': [],
                        'Departments': [],
                        'Facilities': [],
                        'Contact Information': []
                    }
                    current_section = 'College Information'
                    for line in content.splitlines():
                        stripped = line.strip()
                        if not stripped:
                            continue
                        if stripped.endswith(':'):
                            heading = stripped[:-1].strip()
                            if heading in sections:
                                current_section = heading
                                continue
                            if heading.lower().startswith('bmsit department information'):
                                current_section = 'College Information'
                                continue
                        sections[current_section].append(stripped)

                    for section_name, section_lines in sections.items():
                        if not section_lines:
                            continue
                        documents.append({
                            'text': "\n".join([section_name] + section_lines),
                            'source': filename,
                            'type': 'department_info',
                            'document_type': 'department_info',
                            'entity_name': section_name
                        })

                else:
                    paragraphs = [paragraph.strip() for paragraph in content.split('\n\n') if paragraph.strip()]
                    for index, paragraph in enumerate(paragraphs, start=1):
                        documents.append({
                            'text': paragraph,
                            'source': filename,
                            'type': 'text',
                            'document_type': 'text',
                            'entity_name': f"{filename} Paragraph {index}"
                        })

        return documents

    def load_json_files(self, json_dir: str):
        """Load JSON files and convert them into semantic documents."""
        documents = []

        for filename in os.listdir(json_dir):
            if not filename.lower().endswith('.json'):
                continue

            filepath = os.path.join(json_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if filename.lower() == 'attendance.json' or isinstance(data, dict) and 'students' in data:
                for student in data.get('students', []):
                    attendance_lines = []
                    for subject, percent in student.get('attendance', {}).items():
                        attendance_lines.append(f"{subject} Attendance: {percent}%")

                    doc_text = "\n".join([
                        'Student Record',
                        f"Student ID: {student.get('id', '').strip()}",
                        f"Student Name: {student.get('name', '').strip()}"
                    ] + attendance_lines)

                    documents.append({
                        'text': doc_text,
                        'source': filename,
                        'type': 'attendance',
                        'document_type': 'attendance',
                        'entity_name': student.get('name', '').strip() or student.get('id', '').strip() or 'Unknown Student'
                    })
            else:
                doc_text = json.dumps(data, indent=2)
                documents.append({
                    'text': doc_text,
                    'source': filename,
                    'type': 'json',
                    'document_type': 'json',
                    'entity_name': filename
                })

        return documents
    
    def load_all_documents(self, dataset_dir: str) -> List[Dict]:
        """Load all documents from dataset directory"""
        all_documents = []
        
        all_documents.extend(self.load_csv_files(dataset_dir))
        all_documents.extend(self.load_text_files(dataset_dir))
        all_documents.extend(self.load_json_files(dataset_dir))
        
        return all_documents
    
    def add_documents(self, documents: List[Dict]):
        """Add documents to ChromaDB collection"""
        # Batch add for performance: prepare lists and add in one call
        ids = []
        docs = []
        embeddings = []
        metadatas = []

        for doc in documents:
            doc_id = f"doc_{self.chunk_counter}"
            ids.append(doc_id)
            docs.append(doc['text'])
            # store text locally
            self.documents_store[doc_id] = doc['text']
            emb = self.embedder.encode(doc['text']).tolist()
            embeddings.append(emb)
            metadatas.append({
                'source': doc.get('source', ''),
                'document_type': doc.get('document_type', doc.get('type')),
                'entity_name': doc.get('entity_name', '')
            })
            self.chunk_counter += 1

        if ids:
            # single batch add
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=docs,
                metadatas=metadatas
            )
    
    def retrieve(self, query: str, k: int = 2) -> List[Tuple[str, float, Dict]]:
        """
        Retrieve top-k documents similar to query
        
        Args:
            query: User query
            k: Number of documents to retrieve
            
        Returns:
            List of (document_text, similarity_score, metadata)
        """
        # Generate query embedding
        start = time.perf_counter()
        query_embedding = self.embedder.encode(query).tolist()

        # Fetch a small candidate set from ChromaDB (slightly larger than k for reranking)
        n_candidates = max(5, k + 3)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_candidates
        )

        # Build candidate list with similarity conversion
        candidates = []
        if results.get('ids') and len(results['ids']) > 0:
            docs_list = results.get('documents', [[]])[0]
            distances = results.get('distances', [[]])[0] if 'distances' in results else [0] * len(docs_list)
            metadatas = results.get('metadatas', [[]])[0] if 'metadatas' in results else [{}] * len(docs_list)

            for i in range(len(docs_list)):
                doc_text = docs_list[i]
                distance = distances[i] if i < len(distances) else 0
                metadata = metadatas[i] if i < len(metadatas) else {}
                similarity = 1 - distance
                if similarity < 0.6:
                    continue
                candidates.append({
                    'text': doc_text,
                    'similarity': similarity,
                    'metadata': metadata
                })

        # Simple metadata-aware reranking: boost if entity_name appears in query
        q_lower = query.lower()
        for c in candidates:
            entity = (c['metadata'].get('entity_name') or '').lower()
            boost = 0.0
            if entity and entity in q_lower:
                boost += 0.15
            # small boost for exact document_type hints (e.g., "attendance", "timetable")
            doc_type = (c['metadata'].get('document_type') or '').lower()
            if doc_type and doc_type in q_lower:
                boost += 0.05
            c['score'] = c['similarity'] + boost

        # Sort by reranked score desc
        candidates.sort(key=lambda x: x['score'], reverse=True)

        # Select top-k and return tuples
        retrieved_docs = []
        for c in candidates[:k]:
            retrieved_docs.append((c['text'], float(c['similarity']), c['metadata']))

        elapsed = time.perf_counter() - start
        print(f"RETRIEVAL_TIME: {elapsed:.3f}s, candidates={len(candidates)}, returned={len(retrieved_docs)}")
        return retrieved_docs
    
    def generate_response_with_ollama(self, query: str, context: str, temperature: float = 0.7) -> str:
        """
        Generate response using Ollama LLM
        
        Args:
            query: User query
            context: Retrieved context from documents
            temperature: LLM temperature parameter
            
        Returns:
            Generated response
        """
        # Build prompt
        prompt = f"""You are a helpful BMSIT Department chatbot assistant.
Using the provided context, answer the user's question accurately and helpfully.
If the answer is not in the context, say you don't have that information.

Context:
{context}

Question: {query}

Answer:"""

        # Try models in preference order if mistral is slow/unavailable
model_candidates = [
    'phi3:mini',
    'mistral'
]        model_used = None
        self.last_generation_time = None

        for model in model_candidates:
            try:
                start = time.perf_counter()
                response = requests.post(
                    'http://localhost:11434/api/generate',
                    json={
                        'model': model,
                        'prompt': prompt,
                        'temperature': temperature,
                        'stream': False
                    },
                    timeout=30
                )
                gen_time = time.perf_counter() - start
                # if successful, parse and decide if we should accept or try a faster model
                if response.status_code == 200:
                    model_used = model
                    self.last_generation_time = gen_time
                    self.last_used_model = model
                    resp_text = response.json().get('response', '')
                    # if mistral was very slow (>2s) and phi3:mini exists and is preferred, try fallback
                    if model == 'mistral' and gen_time > 2.0 and 'phi3:mini' in model_candidates:
                        # try faster model next iteration
                        continue
                    return resp_text
                else:
                    # try next model
                    continue
            except Exception:
                # try next model on any failure
                continue

        # If all models failed or returned nothing, return a clear message
        self.last_generation_time = self.last_generation_time or 0.0
        return "Unable to generate response from local LLMs."
    
    def generate_response_with_huggingface(self, query: str, context: str, temperature: float = 0.7) -> str:
        """
        Fallback: Generate response using HuggingFace API
        
        Args:
            query: User query
            context: Retrieved context
            temperature: Temperature parameter
            
        Returns:
            Generated response
        """
        # This is a fallback that returns a formatted response (no network calls here)
        prompt = f"""Question: {query}
    Context: {context}

    Provide a helpful answer based on the context."""

        return prompt + "\n\n[Response would be generated by HuggingFace model here]"
    
    def chat(self, query: str, k: int = 2, temperature: float = 0.7, use_ollama: bool = True) -> Dict:
        """
        Main chat function
        
        Args:
            query: User query
            k: Number of documents to retrieve
            temperature: LLM temperature
            use_ollama: Whether to use Ollama (True) or HuggingFace (False)
            
        Returns:
            Response dict with answer and retrieved context
        """
        total_start = time.perf_counter()

        # Retrieve relevant documents (timing printed inside retrieve)
        retrieved_docs = self.retrieve(query, k)

        # Build context up to ~1000 characters, stop adding chunks once limit reached
        CONTEXT_CHAR_LIMIT = 1000
        context_parts = []
        chars = 0
        for doc_text, sim, meta in retrieved_docs:
            add_text = doc_text
            # if adding this chunk would exceed limit, skip it
            if chars + len(add_text) > CONTEXT_CHAR_LIMIT:
                # if we have no context yet and the chunk is larger than limit, truncate it
                if chars == 0:
                    add_text = add_text[:CONTEXT_CHAR_LIMIT]
                    context_parts.append(add_text)
                    chars += len(add_text)
                break
            context_parts.append(add_text)
            chars += len(add_text)

        context = "\n\n".join(context_parts)

        # Generate response and measure generation time
        gen_start = time.perf_counter()
        if use_ollama:
            response = self.generate_response_with_ollama(query, context, temperature)
            gen_time = getattr(self, 'last_generation_time', None)
            used_model = getattr(self, 'last_used_model', None)
            if gen_time is None:
                gen_time = time.perf_counter() - gen_start
        else:
            response = self.generate_response_with_huggingface(query, context, temperature)
            gen_time = time.perf_counter() - gen_start
            used_model = 'huggingface-fallback'

        total_time = time.perf_counter() - total_start

        # Concise timing logs
        print(f"GENERATION_TIME: {gen_time:.3f}s, model={used_model}")
        print(f"TOTAL_RESPONSE_TIME: {total_time:.3f}s")

        return {
            'answer': response,
            'context': [
                {
                    'text': doc[0][:200] + '...' if len(doc[0]) > 200 else doc[0],
                    'similarity': float(doc[1]),
                    'source': doc[2].get('source', 'unknown'),
                    'type': doc[2].get('type', 'unknown')
                }
                for doc in retrieved_docs
            ],
            'query': query
        }
    
    def change_embedding_model(self, model_name: str):
        """Change the embedding model"""
        self.embedding_model_name = model_name
        self.embedder = SentenceTransformer(model_name)
        print(f"Embedding model changed to: {model_name}")
    
    def clear_collection(self):
        """Clear all documents from collection"""
        self.client.delete_collection(name=self.collection.name)
        self.collection = self.client.get_or_create_collection(
            name=self.collection.name,
            metadata={"hnsw:space": "cosine"}
        )
        self.documents_store = {}
        self.chunk_counter = 0
