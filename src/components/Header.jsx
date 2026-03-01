import React, { useState } from 'react';
import { Bell, Search, Info, AlertTriangle, Zap, CheckCircle, X, Plus } from 'lucide-react';

const Header = ({ setView, searchQuery, setSearchQuery, userProfile, notifications, setNotifications, activeRoadmap }) => {
    const [showNotifs, setShowNotifs] = useState(false);

    const hasUnread = notifications?.some(n => !n.read) || false;

    const markAllRead = () => {
        if (setNotifications && notifications) {
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        }
    };

    const overdueTasksCount = activeRoadmap?.milestones?.reduce((acc, m) => {
        return acc + (m.tasks?.filter(t => !t.completed && t.status === 'overdue')?.length || 0);
    }, 0) || 0;

    const hasFriction = activeRoadmap?.totalWeeks > 4;
    const showAlertBar = activeRoadmap && (overdueTasksCount > 0 || hasFriction);

    return (
        <div className="flex-col" style={{
            position: 'sticky',
            top: 0,
            zIndex: 90,
            padding: '1.5rem 2rem 0',
            background: 'var(--bg-color)',
            transition: 'background-color var(--transition-normal)'
        }}>
            {/* Top Navigation Bar */}
            <header className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                {/* Left: Greeting */}
                <div style={{ flex: 1 }}>
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        letterSpacing: '-0.5px',
                        margin: 0,
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--text-primary)'
                    }}>
                        Good morning, {userProfile?.name?.split(' ')[0] || 'Builder'}
                    </h2>
                    {activeRoadmap && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            You have <span style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>{overdueTasksCount} blockers</span> requiring immediate attention today.
                        </p>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="flex items-center gap-2 transition-all" style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '10px',
                        padding: '0.5rem 1rem',
                        width: '240px'
                    }}>
                        <Search size={16} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', width: '100%' }}
                        />
                    </div>

                    {/* Bell notification */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="btn-secondary flex items-center justify-center transition-all"
                            style={{ padding: '0', width: '40px', height: '40px', borderRadius: '10px', position: 'relative' }}
                            onClick={() => setShowNotifs(!showNotifs)}
                        >
                            <Bell size={20} color={hasUnread ? 'var(--accent-indigo)' : 'var(--text-secondary)'} />
                            {hasUnread && (
                                <span style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    width: '8px',
                                    height: '8px',
                                    background: 'var(--danger-color)',
                                    borderRadius: '50%',
                                    border: '2px solid var(--card-bg)'
                                }}></span>
                            )}
                        </button>

                        {showNotifs && (
                            <div className="saas-card flex-col gap-2 scale-in" style={{
                                position: 'absolute',
                                top: '120%',
                                right: '0',
                                width: '320px',
                                padding: '1rem',
                                zIndex: 100,
                                background: 'var(--card-bg)',
                                boxShadow: 'var(--shadow-lg)'
                            }}>
                                <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Notifications</h4>
                                    {hasUnread && (
                                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--accent-indigo)', cursor: 'pointer', fontWeight: 600 }}>
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {notifications && notifications.length > 0 ? notifications.map(notif => (
                                        <div key={notif.id} className="transition-all" style={{
                                            padding: '0.75rem',
                                            background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                                            borderRadius: '8px',
                                            border: '1px solid',
                                            borderColor: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.1)'
                                        }}>
                                            <div className="flex justify-between items-start">
                                                <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: notif.read ? 400 : 600, color: 'var(--text-primary)' }}>{notif.title}</p>
                                                {!notif.read && <div className="status-dot status-online" style={{ width: '6px', height: '6px' }}></div>}
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{notif.message}</p>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>{notif.time}</span>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            <CheckCircle size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                            <p>All caught up!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* New Project Button */}
                    <button
                        className="btn btn-primary"
                        onClick={() => setView('ideation')}
                        style={{ padding: '0.6rem 1.25rem' }}
                    >
                        <Plus size={18} />
                        New Project
                    </button>
                </div>
            </header>

            {/* Smart Alert Bars Section */}
            {showAlertBar && (
                <div className="flex-col gap-3 fade-in" style={{ marginBottom: '1.5rem' }}>
                    {overdueTasksCount > 0 && (
                        <div className="flex justify-between items-center" style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(245, 158, 11, 0.05)',
                            border: '1px solid rgba(245, 158, 11, 0.15)',
                            borderRadius: '12px'
                        }}>
                            <div className="flex gap-3 items-center">
                                <AlertTriangle size={18} color="var(--warning-color)" />
                                <div className="flex items-center gap-2">
                                    <span style={{ fontSize: '0.9rem', color: 'var(--warning-color)', fontWeight: 600 }}>Task overdue:</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                        "Backend API setup" was due yesterday. Roadmap has been recalculated.
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <button className="btn-ghost" style={{ fontSize: '0.85rem', color: 'var(--warning-color)', fontWeight: 600, padding: '0.25rem 0.5rem' }}>
                                    View updated timeline →
                                </button>
                                <X size={16} strokeWidth={3} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
                            </div>
                        </div>
                    )}
                    {hasFriction && (
                        <div className="flex justify-between items-center" style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(99, 102, 241, 0.05)',
                            border: '1px solid rgba(99, 102, 241, 0.15)',
                            borderRadius: '12px'
                        }}>
                            <div className="flex gap-3 items-center">
                                <Zap size={18} color="var(--accent-indigo)" />
                                <div className="flex items-center gap-2">
                                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>AI Suggestion:</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                        Based on your pace, you're on track to miss "Testing phase" by 2 days.
                                    </span>
                                </div>
                            </div>
                            <X size={16} strokeWidth={3} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Header;
