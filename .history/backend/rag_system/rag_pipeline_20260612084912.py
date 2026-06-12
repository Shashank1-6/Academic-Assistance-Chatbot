"""
RAG Pipeline for BMSIT Chatbot
Handles document loading, embedding, and retrieval
"""

import os
import json
import csv
import chromadb
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
        """Load all CSV files from a directory"""
        documents = []
        
        for filename in os.listdir(csv_dir):
            if filename.endswith('.csv'):
                filepath = os.path.join(csv_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        # Convert CSV row to readable text
                        doc_text = " | ".join([f"{k}: {v}" for k, v in row.items()])
                        documents.append({
                            'text': doc_text,
                            'source': filename,
                            'type': 'csv'
                        })
        
        return documents
    
    def load_text_files(self, text_dir: str):
        """Load all TXT files from a directory"""
        documents = []
        
        for filename in os.listdir(text_dir):
            if filename.endswith('.txt'):
                filepath = os.path.join(text_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Split by double newlines to create paragraphs
                    paragraphs = content.split('\n\n')
                    for para in paragraphs:
                        if para.strip():
                            documents.append({
                                'text': para.strip(),
                                'source': filename,
                                'type': 'text'
                            })
        
        return documents
    
    def load_json_files(self, json_dir: str):
      documents = []

for filename in os.listdir(json_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(json_dir, filename)

            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

                # attendance.json
                if 'students' in data:

                    for student in data['students']:

                        attendance_text = ", ".join(
                            [
                                f"{subject}: {percent}%"
                                for subject, percent in student['attendance'].items()
                            ]
                        )

                        doc_text = f"""
                          Student ID: {student['id']}
                          Student Name: {student['name']}
                          Attendance: {attendance_text}
                          """

                        documents.append({
                            'text': doc_text.strip(),
                            'source': filename,
                            'type': 'attendance'
                        })

                else:
                    doc_text = json.dumps(data, indent=2)

                    documents.append({
                        'text': doc_text,
                        'source': filename,
                        'type': 'json'
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
        for doc in documents:
            doc_id = f"doc_{self.chunk_counter}"
            
            # Store document text
            self.documents_store[doc_id] = doc['text']
            
            # Generate embedding
            embedding = self.embedder.encode(doc['text']).tolist()
            
            # Add to ChromaDB
            self.collection.add(
                ids=[doc_id],
                embeddings=[embedding],
                documents=[doc['text']],
                metadatas=[{
                    'source': doc['source'],
                    'type': doc['type']
                }]
            )
            
            self.chunk_counter += 1
    
    def retrieve(self, query: str, k: int = 3) -> List[Tuple[str, float, Dict]]:
        """
        Retrieve top-k documents similar to query
        
        Args:
            query: User query
            k: Number of documents to retrieve
            
        Returns:
            List of (document_text, similarity_score, metadata)
        """
        # Generate query embedding
        query_embedding = self.embedder.encode(query).tolist()
        
        # Query ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=k
        )
        print("\n========== RETRIEVAL DEBUG ==========")
        print("QUERY:", query)

        for i in range(len(results['documents'][0])):
           print(f"\nRESULT {i+1}")
           print(results['documents'][0][i][:500])

           print(
               "SOURCE:",
               results['metadatas'][0][i]
           )
        
        retrieved_docs = []
        
        if results['ids'] and len(results['ids']) > 0:
            for i, doc_id in enumerate(results['ids'][0]):
                doc_text = results['documents'][0][i]
                distance = results['distances'][0][i] if 'distances' in results else 0
                metadata = results['metadatas'][0][i] if 'metadatas' in results else {}
                
                # Convert distance to similarity score (1 - distance)
                similarity = 1 - distance
                
                retrieved_docs.append((doc_text, similarity, metadata))
        
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
        try:
            print("\n========== USING OLLAMA ==========")
            print("QUERY:", query)
            prompt = f"""You are a helpful BMSIT Department chatbot assistant. 
Using the provided context, answer the user's question accurately and helpfully.
If the answer is not in the context, say you don't have that information.

Context:
{context}

Question: {query}

Answer:"""
            
            response = requests.post(
                'http://localhost:11434/api/generate',
                json={
                    'model': 'phi3:mini',
                    'prompt': prompt,
                    'temperature': temperature,
                    'stream': False
                },
                timeout=120
            )
            
            if response.status_code == 200:
                return response.json().get('response', 'Unable to generate response')
            else:
                return f"Error from LLM: {response.status_code}"
                
        except Exception as e:
          print("\nOLLAMA ERROR:")
          print(str(e))
          raise
    
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
        # This is a fallback that returns a formatted response
        # In production, you'd use HuggingFace API key
        print("\n========== USING HUGGINGFACE FALLBACK ==========")
        print("QUERY:", query)
        prompt = f"""Question: {query}
Context: {context}

Provide a helpful answer based on the context."""
        
        return prompt + "\n\n[Response would be generated by HuggingFace model here]"
    
    def chat(self, query: str, k: int = 3, temperature: float = 0.7, use_ollama: bool = True) -> Dict:
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
        # Retrieve relevant documents
        retrieved_docs = self.retrieve(query, k)
        
        # Build context
        context = "\n\n".join([doc[0] for doc in retrieved_docs])
        
        # Generate response
        if use_ollama:
            response = self.generate_response_with_ollama(query, context, temperature)
        else:
            response = self.generate_response_with_huggingface(query, context, temperature)
        
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