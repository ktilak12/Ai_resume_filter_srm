import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Briefcase, 
  Sparkles, 
  Mail, 
  Info,
  X
} from 'lucide-react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  read: boolean;
  category: 'drive' | 'interview' | 'ats' | 'system';
  link?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Microsoft Cloud Drive: 28 Candidates Shortlisted',
    message: 'AI screening matched 28 students from CSE and IT with >= 85% match score for Cloud Solutions Engineer.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    timeAgo: '15m ago',
    read: false,
    category: 'drive',
    link: '/candidates'
  },
  {
    id: 'notif-2',
    title: 'Interview Panel Scheduled: Technical Round 1',
    message: 'Aakash Sharma & Priya S. scheduled with Dr. R. Venkat at SRM Placement Suite 302.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    timeAgo: '45m ago',
    read: false,
    category: 'interview',
    link: '/interviews'
  },
  {
    id: 'notif-3',
    title: 'High ATS Score Detected: 94%',
    message: 'Priya Swaminathan (RA2311003010088) scored 94% ATS match for Google SWE drive.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    timeAgo: '2h ago',
    read: false,
    category: 'ats',
    link: '/candidates'
  },
  {
    id: 'notif-4',
    title: 'New Placement Drive Published: Amazon AWS',
    message: 'Software Development Engineer (18.5 LPA) drive is now live for 2026 Batch.',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    timeAgo: '6h ago',
    read: true,
    category: 'drive',
    link: '/jobs'
  },
  {
    id: 'notif-5',
    title: 'Email Gateway Active',
    message: 'Resend SMTP service connected. Automated shortlisting interview emails enabled.',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    timeAgo: '12h ago',
    read: true,
    category: 'system',
    link: '/settings'
  }
];

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('srm_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [filter, setFilter] = useState<'all' | 'unread' | 'drive' | 'interview'>('all');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('srm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'drive') return n.category === 'drive';
    if (filter === 'interview') return n.category === 'interview';
    return true;
  });

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'drive':
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
      case 'interview':
        return <Calendar className="w-3.5 h-3.5 text-purple-400" />;
      case 'ats':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'system':
      default:
        return <Info className="w-3.5 h-3.5 text-srm-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Notifications"
        className={`p-2 text-slate-400 hover:text-slate-100 relative rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-srm-500 ${
          isOpen ? 'bg-slate-800 text-white ring-2 ring-srm-500/50' : ''
        }`}
      >
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-extrabold text-[9px] ring-2 ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <Bell className="h-5 w-5" />
      </button>

      {/* Notification Popover Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-srm-500/20 text-srm-400 border border-srm-500/30">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-400">SRM Placement &amp; Screening Alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  title="Clear all notifications"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 bg-slate-950/40 border-b border-slate-800/80 text-[11px] overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-srm-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('drive')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'drive'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Drives
            </button>
            <button
              onClick={() => setFilter('interview')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'interview'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Interviews
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-300">No notifications found</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {filter === 'unread' ? 'You are all caught up!' : 'No new updates right now.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-slate-800/60 cursor-pointer transition-colors relative group ${
                    !notif.read ? 'bg-slate-800/25' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-slate-700/60 shrink-0">
                      {getCategoryIcon(notif.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs font-semibold truncate ${
                          !notif.read ? 'text-white font-bold' : 'text-slate-300'
                        }`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {notif.timeAgo}
                        </span>
                        
                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100">
                          {notif.link && (
                            <span className="text-[10px] text-srm-400 flex items-center gap-0.5 font-medium hover:underline">
                              <span>Open</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                          <button
                            onClick={(e) => deleteNotification(notif.id, e)}
                            title="Delete notification"
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-center">
              <span className="text-[10px] text-slate-500">
                Click any notification to navigate to relevant placement screen
              </span>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
