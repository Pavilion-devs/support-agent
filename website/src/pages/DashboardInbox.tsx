import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  Search, 
  RefreshCw, 
  ChevronRight,
  Clock,
  User,
  AlertCircle,
  Loader2,
  Filter
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
  status: string;
  created_at: string;
}

const API_URL = 'http://localhost:3001';

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

const categoryColors: Record<string, string> = {
  billing: 'bg-green-500/20 text-green-400',
  technical: 'bg-purple-500/20 text-purple-400',
  account: 'bg-blue-500/20 text-blue-400',
  feature_request: 'bg-yellow-500/20 text-yellow-400',
  complaint: 'bg-red-500/20 text-red-400',
  general: 'bg-gray-500/20 text-gray-400',
};

const DashboardInbox = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/tickets`);
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.classification?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || ticket.urgency === filter || ticket.classification === filter;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">Support Board</h3>
          <span className="text-xs bg-cosmic-light/20 px-2.5 py-1 rounded-full text-cosmic-muted">
            {tickets.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="h-8 w-8 rounded-md bg-cosmic-light/10 hover:bg-cosmic-light/20 flex items-center justify-center text-cosmic-muted transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <Link
            to="/dashboard/create"
            className="h-8 px-4 rounded-md bg-cosmic-accent text-cosmic-darker flex items-center justify-center text-sm font-medium hover:opacity-90 transition-opacity"
          >
            New Ticket
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cosmic-muted" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-md bg-cosmic-light/5 border border-white/10 text-sm focus:outline-none focus:border-cosmic-accent/50"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 px-4 rounded-md bg-cosmic-light/5 border border-white/10 text-sm focus:outline-none focus:border-cosmic-accent/50"
        >
          <option value="all">All</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="billing">Billing</option>
          <option value="technical">Technical</option>
          <option value="account">Account</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={fetchTickets} className="ml-auto text-sm text-red-400 hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cosmic-muted" />
        </div>
      )}

      {/* Empty State */}
      {!loading && tickets.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-12 text-center">
          <Inbox className="w-12 h-12 text-cosmic-muted mx-auto mb-4" />
          <h4 className="font-medium mb-2">No tickets yet</h4>
          <p className="text-sm text-cosmic-muted mb-4">
            Create your first support ticket to see the AI in action
          </p>
          <Link
            to="/dashboard/create"
            className="inline-flex h-9 px-4 rounded-md bg-cosmic-accent text-cosmic-darker text-sm font-medium items-center hover:opacity-90 transition-opacity"
          >
            Create Ticket
          </Link>
        </div>
      )}

      {/* Tickets List */}
      {!loading && filteredTickets.length > 0 && (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <Link key={ticket.id} to={`/dashboard/ticket/${ticket.id}`}>
              <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-4 hover:bg-cosmic-light/10 transition-colors group">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-cosmic-light/20 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-cosmic-muted" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{ticket.customer_email}</span>
                      <span className="text-xs text-cosmic-muted flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>

                    {ticket.subject && (
                      <p className="font-medium text-sm mb-1 truncate">{ticket.subject}</p>
                    )}

                    <p className="text-sm text-cosmic-muted line-clamp-2 mb-3">
                      {ticket.message}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {ticket.classification && (
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full capitalize",
                          categoryColors[ticket.classification] || 'bg-gray-500/20 text-gray-400'
                        )}>
                          {ticket.classification}
                        </span>
                      )}
                      {ticket.urgency && (
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full capitalize",
                          urgencyColors[ticket.urgency]
                        )}>
                          {ticket.urgency}
                        </span>
                      )}
                      {ticket.sentiment && (
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full capitalize",
                          sentimentColors[ticket.sentiment]
                        )}>
                          {ticket.sentiment}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-cosmic-muted group-hover:text-white transition-colors shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && tickets.length > 0 && filteredTickets.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-12 text-center">
          <Search className="w-12 h-12 text-cosmic-muted mx-auto mb-4" />
          <h4 className="font-medium mb-2">No matching tickets</h4>
          <p className="text-sm text-cosmic-muted">Try a different search term or filter</p>
        </div>
      )}
    </div>
  );
};

export default DashboardInbox;
