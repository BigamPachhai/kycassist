import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, CheckCircle, XCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const iconMap = {
  kyc_submitted:    { Icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  kyc_verified:     { Icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  kyc_rejected:     { Icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  action_required:  { Icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
  reminder:         { Icon: Bell, color: 'text-blue-500', bg: 'bg-blue-50' },
  info:             { Icon: Info, color: 'text-teal-500', bg: 'bg-teal-50' },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          {unread > 0 && <p className="text-sm text-slate-500 mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-400 text-sm mt-3">Loading...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Bell size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No notifications yet</p>
          <p className="text-slate-300 text-sm mt-1">You'll get notified when your KYC status changes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const { Icon, color, bg } = iconMap[n.type] || iconMap.info;
            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && markRead(n._id)}
                className={`bg-white rounded-2xl border p-4 flex gap-4 cursor-pointer transition-all
                  ${n.isRead ? 'border-slate-100 opacity-70' : 'border-slate-200 hover:border-teal-200 shadow-sm'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon size={18} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.isRead ? 'text-slate-500' : 'text-slate-800'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-300 mt-1.5">
                    {new Date(n.createdAt).toLocaleString('en-NP', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
