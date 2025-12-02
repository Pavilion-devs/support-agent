import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  RefreshCw, 
  FileText,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KnowledgeDoc {
  id?: string;
  title: string;
  content: string;
  category: 'faq' | 'pricing' | 'features' | 'policies' | 'troubleshooting' | 'general';
  tags?: string[];
  created_at?: string;
}

const API_URL = 'http://localhost:3001';

const categoryColors: Record<string, string> = {
  faq: 'bg-blue-500/20 text-blue-400',
  pricing: 'bg-green-500/20 text-green-400',
  features: 'bg-purple-500/20 text-purple-400',
  policies: 'bg-yellow-500/20 text-yellow-400',
  troubleshooting: 'bg-red-500/20 text-red-400',
  general: 'bg-gray-500/20 text-gray-400',
};

const DashboardKnowledge = () => {
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [templates, setTemplates] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<KnowledgeDoc['category']>('general');
  const [formTags, setFormTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, templatesRes] = await Promise.all([
        fetch(`${API_URL}/api/knowledge`),
        fetch(`${API_URL}/api/knowledge/templates`)
      ]);
      
      const docsData = await docsRes.json();
      const templatesData = await templatesRes.json();
      
      if (docsData.success) setDocuments(docsData.data || []);
      if (templatesData.success) setTemplates(templatesData.data || []);
    } catch (err) {
      setError('Failed to fetch knowledge base');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          category: formCategory,
          tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowAddForm(false);
        setFormTitle('');
        setFormContent('');
        setFormCategory('general');
        setFormTags('');
        fetchDocuments();
      } else {
        setError(data.error || 'Failed to add document');
      }
    } catch (err) {
      setError('Failed to add document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstallTemplates = async () => {
    setInstalling(true);
    try {
      const response = await fetch(`${API_URL}/api/knowledge/templates/install`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        fetchDocuments();
      }
    } catch (err) {
      setError('Failed to install templates');
    } finally {
      setInstalling(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/knowledge/${id}`, { method: 'DELETE' });
      fetchDocuments();
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">Knowledge Base</h3>
          <span className="text-xs bg-cosmic-light/20 px-2.5 py-1 rounded-full text-cosmic-muted">
            {documents.length} docs
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="h-8 w-8 rounded-md bg-cosmic-light/10 hover:bg-cosmic-light/20 flex items-center justify-center text-cosmic-muted transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="h-8 px-4 rounded-md bg-cosmic-accent text-cosmic-darker flex items-center justify-center text-sm font-medium gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Document
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cosmic-muted" />
        <input
          type="text"
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-md bg-cosmic-light/5 border border-white/10 text-sm focus:outline-none focus:border-cosmic-accent/50"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Quick Setup */}
      {documents.length === 0 && !loading && (
        <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-cosmic-accent/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cosmic-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Quick Setup</h4>
              <p className="text-sm text-cosmic-muted mb-4">
                Install pre-built knowledge templates to get started quickly. These include pricing info, 
                troubleshooting guides, and common FAQs.
              </p>
              <button
                onClick={handleInstallTemplates}
                disabled={installing}
                className="h-9 px-4 rounded-md bg-cosmic-accent text-cosmic-darker text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {installing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Install {templates.length} Templates
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-white/10">
              <h3 className="font-semibold text-lg">Add Knowledge Document</h3>
              <p className="text-sm text-cosmic-muted mt-1">
                Add product documentation to help AI provide accurate responses
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., How to Reset Password"
                  required
                  className="w-full h-10 px-4 rounded-md bg-cosmic-light/5 border border-white/10 text-sm focus:outline-none focus:border-cosmic-accent/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as KnowledgeDoc['category'])}
                  className="w-full h-10 px-4 rounded-md bg-cosmic-light/5 border border-white/10 text-sm focus:outline-none focus:border-cosmic-accent/50"
                >
                  <option value="faq">FAQ</option>
                  <option value="pricing">Pricing</option>
                  <option value="features">Features</option>
                  <option value="policies">Policies</option>
                  <option value="troubleshooting">Troubleshooting</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Enter the document content..."
                  required
                  rows={10}
                  className="w-full px-4 py-3 rounded-md bg-cosmic-light/5 border border-white/10 text-sm focus:outline-none focus:border-cosmic-accent/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g., password, security, account"
                  className="w-full h-10 px-4 rounded-md bg-cosmic-light/5 border border-white/10 text-sm focus:outline-none focus:border-cosmic-accent/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 h-10 rounded-md bg-cosmic-light/10 text-sm font-medium hover:bg-cosmic-light/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-10 rounded-md bg-cosmic-accent text-cosmic-darker text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cosmic-muted" />
        </div>
      )}

      {/* Documents Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-white/10 bg-cosmic-light/5 p-4 hover:bg-cosmic-light/10 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-cosmic-light/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-cosmic-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{doc.title}</h4>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full capitalize shrink-0",
                      categoryColors[doc.category]
                    )}>
                      {doc.category}
                    </span>
                  </div>
                  <p className="text-sm text-cosmic-muted line-clamp-2 mb-2">
                    {doc.content.substring(0, 150)}...
                  </p>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-cosmic-light/10 text-cosmic-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => doc.id && handleDelete(doc.id)}
                  className="h-8 w-8 rounded-md bg-red-500/10 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDocs.length === 0 && documents.length > 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-cosmic-muted mx-auto mb-4" />
          <h4 className="font-medium mb-1">No matching documents</h4>
          <p className="text-sm text-cosmic-muted">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default DashboardKnowledge;

