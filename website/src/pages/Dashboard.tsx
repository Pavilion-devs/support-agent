import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Inbox, 
  PlusCircle, 
  BarChart3, 
  BookOpen,
  Bot,
  Slack,
  MessageCircle,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: PlusCircle, label: 'New Ticket', path: '/dashboard/create' },
  { icon: Inbox, label: 'Support Board', path: '/dashboard/inbox' },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: BookOpen, label: 'Knowledge Base', path: '/dashboard/knowledge' },
];

const channels = [
  { icon: Slack, label: 'Slack', color: 'bg-green-400/80' },
  { icon: MessageCircle, label: 'WhatsApp', color: 'bg-purple-400/80' },
  { icon: Mail, label: 'Email', color: 'bg-blue-400/80' },
];

const Dashboard = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      {/* Dashboard Container */}
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Frame */}
        <div className="cosmic-glow relative rounded-xl overflow-hidden dashboard-container backdrop-blur-sm">
          <div className="dashboard-content backdrop-blur-md w-full">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between p-4 dashboard-header border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-cosmic-light/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-cosmic-accent" />
                </div>
                <div>
                  <span className="dashboard-title font-semibold tracking-tight">Twisky Support</span>
                  <div className="flex items-center gap-2 text-xs text-cosmic-muted">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    AI Agent Active
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-cosmic-light/30 border-2 border-cosmic-darker"></div>
                  <div className="h-8 w-8 rounded-full bg-cosmic-light/20 border-2 border-cosmic-darker"></div>
                  <div className="h-8 w-8 rounded-full bg-cosmic-accent/20 border-2 border-cosmic-darker flex items-center justify-center text-xs text-cosmic-accent">+2</div>
                </div>
                
                <Link 
                  to="/"
                  className="h-8 px-4 rounded-md bg-cosmic-light/10 hover:bg-cosmic-light/20 flex items-center justify-center dashboard-text text-sm transition-colors"
                >
                  Home
                </Link>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="flex min-h-[calc(100vh-180px)]">
              {/* Sidebar */}
              <div className="w-64 dashboard-sidebar border-r border-white/10 p-4 space-y-6">
                {/* Navigation */}
                <div className="space-y-2">
                  <div className="text-xs text-cosmic-muted uppercase tracking-wider px-3">Navigation</div>
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path || 
                        (item.path === '/dashboard/inbox' && location.pathname.startsWith('/dashboard/ticket'));
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                            isActive 
                              ? "bg-cosmic-light/10 dashboard-active" 
                              : "dashboard-inactive hover:bg-cosmic-light/5"
                          )}
                        >
                          <div className={cn(
                            "h-3 w-3 rounded-sm",
                            isActive ? "bg-cosmic-accent" : "bg-cosmic-muted/30"
                          )}></div>
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                
                {/* Channels */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="text-xs text-cosmic-muted uppercase tracking-wider px-3">Channels</div>
                  <div className="space-y-1">
                    {channels.map((channel) => (
                      <div
                        key={channel.label}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md dashboard-inactive hover:bg-cosmic-light/5 cursor-pointer transition-colors"
                      >
                        <div className={cn("h-3 w-3 rounded-full", channel.color)}></div>
                        <span className="text-sm">{channel.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User */}
                <div className="pt-4 border-t border-white/10 mt-auto">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-cosmic-light/5">
                    <div className="h-8 w-8 rounded-full bg-cosmic-accent/20 flex items-center justify-center text-xs font-medium">
                      JS
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">John Smith</p>
                      <p className="text-xs text-cosmic-muted truncate">Admin</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 overflow-auto">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
