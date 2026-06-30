import React, { useState, useEffect } from 'react';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30s
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/notifications/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setNotifications(await res.json());
        }
    };

    const markAsRead = async (id) => {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchNotifications();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-300 hover:text-white transition-colors"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-900"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto glass-card rounded-2xl shadow-xl border border-white/10 z-50 animate-fade-in">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{unreadCount} New</span>
                    </div>
                    <div className="p-2 space-y-1">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-sm">No notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div 
                                    key={n.id} 
                                    onClick={() => !n.read && markAsRead(n.id)}
                                    className={`p-3 rounded-xl cursor-pointer transition-colors ${n.read ? 'opacity-60 hover:bg-white/5' : 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getTypeStyle(n.type)}`}>{n.type}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className={`text-sm ${n.read ? 'text-slate-300' : 'text-white'}`}>{n.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const getTypeStyle = (type) => {
    switch(type) {
        case 'RESUME': return 'bg-blue-500/20 text-blue-300';
        case 'INTERVIEW': return 'bg-purple-500/20 text-purple-300';
        case 'ATTENDANCE': return 'bg-red-500/20 text-red-300';
        default: return 'bg-slate-500/20 text-slate-300';
    }
}

export default NotificationBell;
