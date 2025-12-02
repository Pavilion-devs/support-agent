import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  RefreshCw, 
  Ticket, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Analytics {
  total: number;
  byStatus: Record<string, number>;
  byClassification: Record<string, number>;
  byUrgency: Record<string, number>;
}

const API_URL = 'http://localhost:3001';

const classificationColors: Record<string, string> = {
  billing: 'bg-green-500',
  technical: 'bg-purple-500',
  account: 'bg-blue-500',
  feature_request: 'bg-yellow-500',
  complaint: 'bg-red-500',
  general: 'bg-gray-500',
};

const urgencyColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const DashboardAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/analytics`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cosmic-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={fetchAnalytics} className="ml-auto text-sm text-red-400 hover:text-red-300">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const totalByClassification = Object.values(analytics.byClassification).reduce((a, b) => a + b, 0);
  const totalByUrgency = Object.values(analytics.byUrgency).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">Analytics</h3>
          <span className="text-xs bg-cosmic-light/20 px-2.5 py-1 rounded-full text-cosmic-muted">
            Real-time
          </span>
        </div>
        
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="h-8 w-8 rounded-md bg-cosmic-light/10 hover:bg-cosmic-light/20 flex items-center justify-center text-cosmic-muted transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-cosmic-accent/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-cosmic-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold">{analytics.total}</p>
          <p className="text-xs text-cosmic-muted">Total Tickets</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{analytics.byStatus.processed || 0}</p>
          <p className="text-xs text-cosmic-muted">Processed</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{analytics.byUrgency.critical || 0}</p>
          <p className="text-xs text-cosmic-muted">Critical</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">~8s</p>
          <p className="text-xs text-cosmic-muted">Avg Response</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* By Classification */}
        <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cosmic-accent" />
            By Category
          </h4>
          
          {Object.keys(analytics.byClassification).length === 0 ? (
            <p className="text-sm text-cosmic-muted text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(analytics.byClassification).map(([category, count]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm capitalize">{category}</span>
                    <span className="text-xs text-cosmic-muted">
                      {count} ({getPercentage(count, totalByClassification)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-cosmic-light/10 overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", classificationColors[category] || 'bg-gray-500')}
                      style={{ width: `${getPercentage(count, totalByClassification)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By Urgency */}
        <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cosmic-accent" />
            By Urgency
          </h4>
          
          {Object.keys(analytics.byUrgency).length === 0 ? (
            <p className="text-sm text-cosmic-muted text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-4">
              {['critical', 'high', 'medium', 'low'].map((urgency) => {
                const count = analytics.byUrgency[urgency] || 0;
                if (count === 0) return null;
                return (
                  <div key={urgency}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm capitalize">{urgency}</span>
                      <span className="text-xs text-cosmic-muted">
                        {count} ({getPercentage(count, totalByUrgency)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-cosmic-light/10 overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", urgencyColors[urgency])}
                        style={{ width: `${getPercentage(count, totalByUrgency)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI Performance */}
      <div className="rounded-lg border border-white/10 bg-cosmic-light/5 p-5">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cosmic-accent" />
          AI Agent Performance
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-cosmic-light/5">
            <p className="text-2xl font-bold text-green-400">100%</p>
            <p className="text-xs text-cosmic-muted mt-1">Resolution Rate</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-cosmic-light/5">
            <p className="text-2xl font-bold text-blue-400">~8s</p>
            <p className="text-xs text-cosmic-muted mt-1">Avg Processing</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-cosmic-light/5">
            <p className="text-2xl font-bold text-purple-400">{analytics.total}</p>
            <p className="text-xs text-cosmic-muted mt-1">Handled</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-cosmic-light/5">
            <p className="text-2xl font-bold text-yellow-400">0</p>
            <p className="text-xs text-cosmic-muted mt-1">Escalations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
