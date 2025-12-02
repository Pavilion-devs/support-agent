import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  Brain, 
  MessageSquare, 
  Sparkles,
  CheckCircle2,
  Database,
  AlertCircle,
  Loader2,
  Copy,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Ticket {
  id: string;
  customer_email: string;
  subject: string | null;
  message: string;
  classification: string;
  urgency: string;
  sentiment: string;
  ai_response: string;
  reasoning: string;
  actions_taken: string;
  status: string;
  created_at: string;
  processed_at: string;
}

interface ProcessingLog {
  id: number;
  ticket_id: string;
  step: string;
  details: string;
  timestamp: string;
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
  create_ticket: 'Ticket Created',
  retrieve_memory: 'Memory Retrieved',
  search_knowledge: 'Knowledge Searched',
  classify_message: 'Message Classified',
  generate_response: 'Response Generated',
  store_memory: 'Insights Stored',
  update_local_insights: 'Profile Updated',
};

const urgencyColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-green-500/20 text-green-400',
};

const sentimentColors: Record<string, string> = {
  frustrated: 'bg-red-500/20 text-red-400',
  negative: 'bg-orange-500/20 text-orange-400',
  neutral: 'bg-blue-500/20 text-blue-400',
  positive: 'bg-green-500/20 text-green-400',
};

const DashboardTicket = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tickets/${id}`);
        const data = await response.json();
        if (data.success) {
          setTicket(data.data.ticket);
          setLogs(data.data.processing_logs || []);
        } else {
          throw new Error(data.error || 'Ticket not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ticket');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTicket();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const copyResponse = () => {
    if (ticket?.ai_response) {
      navigator.clipboard.writeText(ticket.ai_response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parseActions = (actionsStr: string): string[] => {
    try {
      return JSON.parse(actionsStr) || [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cosmic-muted" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h4 className="font-medium mb-2">Ticket not found</h4>
          <p className="text-sm text-cosmic-muted mb-4">{error}</p>
          <Link
            to="/dashboard/inbox"
            className="inline-flex h-9 px-4 rounded-md bg-cosmic-light/10 text-sm items-center gap-2 hover:bg-cosmic-light/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inbox
          </Link>
        </div>
      </div>
    );
  }

  const actions = parseActions(ticket.actions_taken);
  const completedSteps = logs.reduce((acc, log) => {
    if (!acc.some(l => l.step === log.step)) {
      acc.push(log);
    }
    return acc;
  }, [] as ProcessingLog[]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/dashboard/inbox"
          className="h-8 w-8 rounded-md bg-cosmic-light/10 hover:bg-cosmic-light/20 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">
            {ticket.subject || 'Support Ticket'}
          </h3>
          <p className="text-xs text-cosmic-muted">ID: {ticket.id}</p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 capitalize">
          {ticket.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Message */}
          <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-cosmic-accent" />
              Customer Message
            </h4>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-cosmic-light/20 flex items-center justify-center">
                <User className="w-5 h-5 text-cosmic-muted" />
              </div>
              <div>
                <p className="font-medium text-sm">{ticket.customer_email}</p>
                <p className="text-xs text-cosmic-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(ticket.created_at)}
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-md bg-cosmic-light/5 text-sm whitespace-pre-wrap">
              {ticket.message}
            </div>
          </div>

          {/* AI Response */}
          <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cosmic-accent" />
                AI Response
              </h4>
              <button
                onClick={copyResponse}
                className="h-8 w-8 rounded-md bg-cosmic-light/10 hover:bg-cosmic-light/20 flex items-center justify-center transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="p-4 rounded-md bg-cosmic-accent/5 border border-cosmic-accent/20 text-sm whitespace-pre-wrap mb-4">
              {ticket.ai_response}
            </div>

            {actions.length > 0 && (
              <div>
                <p className="text-xs text-cosmic-muted mb-2">Suggested Actions:</p>
                <div className="space-y-1">
                  {actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-cosmic-muted">
                      <ArrowRight className="w-3 h-3" />
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Reasoning */}
          <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-cosmic-accent" />
              AI Reasoning
            </h4>
            <p className="text-sm text-cosmic-muted">{ticket.reasoning}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Classification */}
          <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cosmic-accent" />
              Classification
            </h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-cosmic-muted mb-1">Category</p>
                <span className="text-xs px-3 py-1.5 rounded-full bg-cosmic-light/10 capitalize">
                  {ticket.classification}
                </span>
              </div>
              <div>
                <p className="text-xs text-cosmic-muted mb-1">Urgency</p>
                <span className={cn("text-xs px-3 py-1.5 rounded-full capitalize", urgencyColors[ticket.urgency])}>
                  {ticket.urgency}
                </span>
              </div>
              <div>
                <p className="text-xs text-cosmic-muted mb-1">Sentiment</p>
                <span className={cn("text-xs px-3 py-1.5 rounded-full capitalize", sentimentColors[ticket.sentiment])}>
                  {ticket.sentiment}
                </span>
              </div>
            </div>
          </div>

          {/* Processing Timeline */}
          <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
            <h4 className="font-medium mb-4">Processing Timeline</h4>
            
            <div className="space-y-3">
              {completedSteps.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="text-green-400 mt-0.5">
                    {stepIcons[log.step] || <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {stepLabels[log.step] || log.step}
                    </p>
                    <p className="text-xs text-cosmic-muted">
                      {formatTime(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
            <h4 className="font-medium mb-4">Details</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-cosmic-muted">Created</span>
                <span>{formatDate(ticket.created_at)}</span>
              </div>
              {ticket.processed_at && (
                <div className="flex justify-between">
                  <span className="text-cosmic-muted">Processed</span>
                  <span>{formatDate(ticket.processed_at)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-cosmic-muted">Status</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 capitalize">
                  {ticket.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTicket;
