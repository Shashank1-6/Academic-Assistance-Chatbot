import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SettingsPage.css';

function SettingsPage({ user, debugMode, setDebugMode }) {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [config, setConfig] = useState({});
  const [embeddingModel, setEmbeddingModel] = useState('all-MiniLM-L6-v2');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [rebuildMessage, setRebuildMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [analyticsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics')
      ]);

      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setUploadMessage('');
    setRebuildMessage('');
  };

  const handleUploadDataset = async () => {
    if (!selectedFiles.length) {
      setUploadMessage('Please select at least one CSV, JSON, or TXT file.');
      return;
    }

    try {
      setUploading(true);
      setUploadMessage('');
      const formData = new FormData();
      formData.append('email', user.email);
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post('http://localhost:5000/api/upload-dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadMessage(response.data.message || 'Dataset files uploaded successfully.');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Dataset upload failed:', error);
      setUploadMessage(error.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRebuildKnowledgeBase = async () => {
    try {
      setRebuilding(true);
      setRebuildMessage('');

      const response = await axios.post('http://localhost:5000/api/rebuild-knowledge-base', {
        email: user.email
      });

      setRebuildMessage(response.data.message || 'Knowledge base rebuilt successfully.');
    } catch (error) {
      console.error('Rebuild failed:', error);
      setRebuildMessage(error.response?.data?.error || 'Rebuild failed.');
    } finally {
      setRebuilding(false);
    }
  };

  const handleUpdateEmbeddingModel = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/config', {
        embedding_model: embeddingModel
      });
      alert('Embedding model updated successfully!');
    } catch (error) {
      alert('Error updating embedding model');
    }
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <h1>⚙️ Settings & Configuration</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="settings-content">
        {/* RAG Configuration */}
        <div className="settings-section">
          <h2>🤖 RAG Pipeline Configuration</h2>
          
          <div className="setting-item">
            <label>Embedding Model</label>
            <select
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.target.value)}
              className="select-input"
            >
              <option value="all-MiniLM-L6-v2">all-MiniLM-L6-v2 (Fast & Accurate)</option>
              <option value="sentence-transformers/all-mpnet-base-v2">all-mpnet-base-v2 (Better Quality)</option>
              <option value="sentence-transformers/paraphrase-MiniLM-L6-v2">paraphrase-MiniLM-L6-v2</option>
            </select>
            <button
              className="btn btn-primary"
              onClick={handleUpdateEmbeddingModel}
              disabled={loading}
            >
              Update Model
            </button>
          </div>

          <div className="info-box">
            <strong>ℹ️ About Embedding Models:</strong>
            <ul>
              <li><strong>all-MiniLM-L6-v2:</strong> Fast and good quality, recommended for most use cases</li>
              <li><strong>all-mpnet-base-v2:</strong> Slower but higher quality embeddings</li>
              <li><strong>paraphrase-MiniLM-L6-v2:</strong> Optimized for paraphrase similarity</li>
            </ul>
          </div>
        </div>

        {/* Debug & Features */}
        <div className="settings-section">
          <h2>🔍 Debug & Features</h2>
          
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
              />
              Enable Debug Mode
            </label>
            <p>Show retrieved context documents in chat responses</p>
          </div>

          <div className="info-box">
            <strong>✓ Features Enabled:</strong>
            <ul>
              <li>✓ Role-based access control</li>
              <li>✓ Chat history storage</li>
              <li>✓ Query analytics</li>
              <li>✓ Configurable RAG parameters</li>
              <li>✓ Vector database (ChromaDB)</li>
            </ul>
          </div>
        </div>

        {/* User Information */}
        <div className="settings-section">
          <h2>👤 User Information</h2>
          
          <div className="user-details">
            <div className="detail-item">
              <label>Name</label>
              <input type="text" value={user.name} disabled />
            </div>
            <div className="detail-item">
              <label>Email</label>
              <input type="email" value={user.email} disabled />
            </div>
            <div className="detail-item">
              <label>Role</label>
              <input type="text" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled />
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="settings-section">
          <h2>📊 Analytics</h2>
          
          {analytics ? (
            <div>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="metric-value">{analytics.total_queries}</div>
                  <div className="metric-label">Total Queries</div>
                </div>
                {Object.entries(analytics.queries_by_role || {}).map(([role, count]) => (
                  <div key={role} className="analytics-card">
                    <div className="metric-value">{count}</div>
                    <div className="metric-label">{role.charAt(0).toUpperCase() + role.slice(1)} Queries</div>
                  </div>
                ))}
              </div>

              <div className="info-box">
                <strong>📈 Query Breakdown:</strong>
                <ul>
                  {Object.entries(analytics.queries_by_role || {}).map(([role, count]) => (
                    <li key={role}>
                      <strong>{role.charAt(0).toUpperCase() + role.slice(1)}:</strong> {count} queries
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>Loading analytics...</p>
          )}
        </div>

        {/* System Information */}
        <div className="settings-section">
          <h2>ℹ️ System Information</h2>
          
          <div className="system-info">
            <table>
              <tbody>
                <tr>
                  <td><strong>Backend API</strong></td>
                  <td>http://localhost:5000</td>
                </tr>
                <tr>
                  <td><strong>Python RAG Server</strong></td>
                  <td>http://localhost:5001</td>
                </tr>
                <tr>
                  <td><strong>Vector Database</strong></td>
                  <td>ChromaDB (Local)</td>
                </tr>
                <tr>
                  <td><strong>LLM Backend</strong></td>
                  <td>Ollama (localhost:11434) or HuggingFace</td>
                </tr>
                <tr>
                  <td><strong>Frontend Framework</strong></td>
                  <td>React 18.2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RAG Pipeline Info */}
        <div className="settings-section">
          <h2>🔗 RAG Pipeline</h2>
          
          <div className="pipeline-diagram">
            <div className="pipeline-step">
              <div className="step-icon">📁</div>
              <div className="step-label">Document Loader</div>
              <div className="step-desc">Load CSV, TXT, JSON files</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="step-icon">✂️</div>
              <div className="step-label">Text Splitter</div>
              <div className="step-desc">Split into chunks</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="step-icon">🧠</div>
              <div className="step-label">Embeddings</div>
              <div className="step-desc">Generate embeddings</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="step-icon">💾</div>
              <div className="step-label">Vector DB</div>
              <div className="step-desc">Store & Index</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="step-icon">🔍</div>
              <div className="step-label">Retriever</div>
              <div className="step-desc">Find top-k docs</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="step-icon">🤖</div>
              <div className="step-label">LLM</div>
              <div className="step-desc">Generate response</div>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="settings-section">
          <h2>📚 Documentation & Resources</h2>
          
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🚀 Getting Started</h3>
              <p>Learn how to use the chatbot and navigate through different features.</p>
            </div>
            <div className="resource-card">
              <h3>🔧 API Documentation</h3>
              <p>Detailed documentation for all available API endpoints and usage.</p>
            </div>
            <div className="resource-card">
              <h3>❓ FAQs</h3>
              <p>Frequently asked questions about the chatbot and troubleshooting.</p>
            </div>
            <div className="resource-card">
              <h3>💬 Support</h3>
              <p>Contact support or report issues.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
