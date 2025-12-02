import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  Brain, 
  MessageSquare, 
  Database,
  Sparkles,
  ArrowRight,
  AlertCircle,
  BookOpen,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  details?: string;
  timestamp: string;
}

interface TicketResult {
  ticket: {
    id: string;
    classification: string;
    urgency: string;
    sentiment: string;
    ai_response: string;
    reasoning: string;
  };
  classification: {
    category: string;
    urgency: string;
    sentiment: string;
    reasoning: string;
    key_entities: string[];
  };
  ai_response: string;
  tone: string;
  suggested_actions: string[];
  customer_context: string;
  knowledge_context: string;
  processing_steps: ProcessingStep[];
}

const API_URL = 'http://localhost:3001';

const stepIcons: Record<string, React.ReactNode> = {
  create_ticket: <Database className="w-4 h-4" />,
  retrieve_memory: <Brain className="w-4 h-4" />,
  search_knowledge: <BookOpen className="w-4 h-4" />,
  classify_message: <Sparkles className="w-4 h-4" />,
  generate_response: <MessageSquare className="w-4 h-4" />,
  store_memory: <Database className="w-4 h-4" />,
  update_local_insights: <CheckCircle2 className="w-4 h-4" />,
};

const stepLabels: Record<string, string> = {
  create_ticket: 'Creating Ticket',
  retrieve_memory: 'Customer Memory',
  search_knowledge: 'Knowledge Search',
  classify_message: 'AI Classification',
  generate_response: 'Generating Response',
  store_memory: 'Storing Insights',
  update_local_insights: 'Updating Profile',
};

const urgencyColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const sentimentColors: Record<string, string> = {
  frustrated: 'bg-red-500/20 text-red-400',
  negative: 'bg-orange-500/20 text-orange-400',
  neutral: 'bg-blue-500/20 text-blue-400',
  positive: 'bg-green-500/20 text-green-400',
};

const DashboardCreate = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TicketResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          customer_email: email,
          subject: subject || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process ticket');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setSubject('');
    setMessage('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">New Support Ticket</h3>
          <span className="text-xs bg-cosmic-light/20 px-2.5 py-1 rounded-full text-cosmic-muted">
            AI Processing
          </span>
        </div>
        
        {result && (
          <button
            onClick={resetForm}
            className="h-8 px-4 rounded-md bg-cosmic-accent text-cosmic-darker flex items-center justify-center text-sm font-medium gap-2 hover:opacity-90 transition-opacity"
          >
            New Ticket
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-cosmic-accent" />
              Customer Details
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-cosmic-muted mb-2">Email</label>
                <input
                  type="email"
                  placeholder="customer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isProcessing}
                  className="w-full h-10 px-4 rounded-md bg-cosmic-light/5 border border-white/10 text-sm focus:outline-none focus:border-cosmic-accent/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-cosmic-muted mb-2">Subject (Optional)</label>
                <input
                  type="text"
                  placeholder="Brief description"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isProcessing}
                  className="w-full h-10 px-4 rounded-md bg-cosmic-light/5 border border-white/10 text-sm focus:outline-none focus:border-cosmic-accent/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-cosmic-muted mb-2">Message</label>
                <textarea
                  placeholder="Enter the customer's support message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={isProcessing}
                  rows={6}
                  className="w-full px-4 py-3 rounded-md bg-cosmic-light/5 border border-white/10 text-sm focus:outline-none focus:border-cosmic-accent/50 disabled:opacity-50 resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full h-10 rounded-md bg-cosmic-accent text-cosmic-darker text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Processing Steps */}
          {(isProcessing || result) && (
            <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-cosmic-accent" />
                AI Processing Pipeline
              </h4>
              
              <div className="space-y-2">
                {result?.processing_steps
                  .filter((step, index, arr) => {
                    return arr.findIndex(s => s.step === step.step && s.status === 'completed') === index ||
                           (step.status !== 'completed' && arr.filter(s => s.step === step.step).every(s => s.status !== 'completed'));
                  })
                  .filter(step => step.status === 'completed')
                  .map((step, index) => (
                    <div 
                      key={`${step.step}-${index}`}
                      className="flex items-center gap-3 p-3 rounded-md bg-cosmic-light/5"
                    >
                      <div className="text-green-400">
                        {stepIcons[step.step] || <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {stepLabels[step.step] || step.step}
                        </p>
                        {step.details && (
                          <p className="text-xs text-cosmic-muted truncate">
                            {step.details}
                          </p>
                        )}
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    </div>
                  ))}
                {isProcessing && (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-cosmic-accent/10">
                    <Loader2 className="w-4 h-4 animate-spin text-cosmic-accent" />
                    <span className="text-sm">Processing...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <div className="space-y-6">
          {result && (
            <>
              {/* Classification */}
              <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cosmic-accent" />
                  Classification
                </h4>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-3 py-1.5 rounded-full bg-cosmic-light/10 capitalize">
                    {result.classification.category}
                  </span>
                  <span className={cn("text-xs px-3 py-1.5 rounded-full capitalize border", urgencyColors[result.classification.urgency])}>
                    {result.classification.urgency} urgency
                  </span>
                  <span className={cn("text-xs px-3 py-1.5 rounded-full capitalize", sentimentColors[result.classification.sentiment])}>
                    {result.classification.sentiment}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-cosmic-muted mb-1">AI Reasoning:</p>
                  <p className="text-sm">{result.classification.reasoning}</p>
                </div>

                {result.classification.key_entities.length > 0 && (
                  <div>
                    <p className="text-xs text-cosmic-muted mb-2">Key Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.classification.key_entities.map((entity, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-cosmic-light/10 text-cosmic-muted">
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Response */}
              <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cosmic-accent" />
                    AI Response
                  </h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-cosmic-light/10 capitalize">
                    {result.tone} tone
                  </span>
                </div>
                
                <div className="p-4 rounded-md bg-cosmic-accent/5 border border-cosmic-accent/20 text-sm whitespace-pre-wrap mb-4">
                  {result.ai_response}
                </div>

                {result.suggested_actions.length > 0 && (
                  <div>
                    <p className="text-xs text-cosmic-muted mb-2">Suggested Actions:</p>
                    <div className="space-y-1">
                      {result.suggested_actions.map((action, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-cosmic-muted">
                          <ArrowRight className="w-3 h-3" />
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Knowledge Used */}
              {result.knowledge_context && result.knowledge_context !== 'No knowledge base match' && (
                <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cosmic-accent" />
                    Knowledge Base Used
                  </h4>
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Product documentation was referenced
                  </p>
                </div>
              )}

              {/* View Ticket */}
              <button 
                onClick={() => navigate(`/dashboard/ticket/${result.ticket.id}`)}
                className="w-full h-10 rounded-md border border-white/10 bg-cosmic-light/5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-cosmic-light/10 transition-colors"
              >
                View Full Ticket Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Empty State */}
          {!result && !isProcessing && (
            <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-8 text-center">
              <Brain className="w-12 h-12 text-cosmic-muted mx-auto mb-4" />
              <h4 className="font-medium mb-2">AI Ready</h4>
              <p className="text-sm text-cosmic-muted">
                Submit a support ticket to see the AI agent classify, research, and respond in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCreate;
