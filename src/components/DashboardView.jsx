import React from 'react';
import { Target, CheckCircle, Zap, Users, Plus, FileText, Activity, BarChart2, PieChart, Calendar, TrendingUp, ChevronRight, X, MoreHorizontal, Clock, User, Layers } from 'lucide-react';

const DashboardView = ({ roadmaps, activeRoadmap, setView, handleOpenRoadmap, handleDeleteRoadmap, handleUpdateRoadmap, searchQuery, dashboardNotes, setDashboardNotes, userProfile }) => {
    const [isAddingNote, setIsAddingNote] = React.useState(false);
    const [noteText, setNoteText] = React.useState('');
    const [graphToggle, setGraphToggle] = React.useState('weekly');
    const [selectedProjId, setSelectedProjId] = React.useState(activeRoadmap?.id || (roadmaps.length > 0 ? roadmaps[0].id : null));
    const [dragInfo, setDragInfo] = React.useState(null);
    const isAdmin = userProfile?.role === 'admin';

    // Update selection if activeRoadmap changes externally
    React.useEffect(() => {
        if (activeRoadmap?.id) setSelectedProjId(activeRoadmap.id);
    }, [activeRoadmap]);

    const overviewRoadmap = roadmaps.find(r => r.id === selectedProjId) || activeRoadmap || (roadmaps.length > 0 ? roadmaps[0] : null);

    // Calculate global metrics dynamically
    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    const uniqueMembers = new Set();
    const allRecentActivities = [];

    roadmaps.forEach(r => {
        if (r.teamMembers) r.teamMembers.forEach(m => uniqueMembers.add(m));
        r.milestones.forEach(m => {
            totalTasks += m.tasks.length;
            m.tasks.forEach(t => {
                if (t.completed) {
                    completedTasks++;
                    allRecentActivities.push({
                        id: Math.random(),
                        text: `${t.assignee || 'A member'} completed "${t.title}"`,
                        time: '2h ago',
                        type: 'complete'
                    });
                } else if (t.status === 'overdue') {
                    overdueTasks++;
                }
            });
        });
    });

    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const inProgressTasks = totalTasks - completedTasks;
    const activeMembersCount = uniqueMembers.size || 1;

    // ─── Build real chart data from milestone tasks ───────────────────────────
    // Each milestone = one data point. We show % completed vs % in-progress.
    const milestones = overviewRoadmap ? overviewRoadmap.milestones : [];

    const buildChartData = (slots) => {
        if (milestones.length === 0) {
            // no data yet — return zeros so chart renders empty
            return Array.from({ length: slots }, () => ({ c: 0, p: 0 }));
        }
        // Group milestones into `slots` buckets
        const buckets = Array.from({ length: slots }, () => []);
        milestones.forEach((m, i) => {
            const idx = Math.min(Math.floor((i / milestones.length) * slots), slots - 1);
            buckets[idx].push(m);
        });
        return buckets.map(bucket => {
            if (bucket.length === 0) return { c: 0, p: 0 };
            let bTotal = 0, bDone = 0, bProgress = 0;
            bucket.forEach(m => {
                m.tasks.forEach(t => {
                    bTotal++;
                    if (t.completed || t.status === 'done') bDone++;
                    else if (t.status === 'in-progress' || t.status === 'active') bProgress++;
                });
            });
            const c = bTotal ? Math.round((bDone / bTotal) * 100) : 0;
            const p = bTotal ? Math.round(((bDone + bProgress) / bTotal) * 100) : 0;
            return { c, p };
        });
    };

    const weeklyBars = buildChartData(7);
    const monthlyBars = buildChartData(4);
    const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthLabels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
    // ─────────────────────────────────────────────────────────────────────────

    // Online Status Simulation (for the panel)
    const teamMembers = Array.from(uniqueMembers).map(name => ({
        name,
        role: name === userProfile.name ? 'Team Lead' : 'Member',
        progress: Math.floor(Math.random() * 40) + 60,
        online: Math.random() > 0.3
    }));
    if (teamMembers.length === 0) teamMembers.push({ name: userProfile.name || 'Builder', role: 'Team Lead', progress: 100, online: true });

    // Performance Data for Donut
    const donutColors = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B'];
    const teamPerformance = teamMembers.map((m, i) => ({
        name: m.name,
        tasks: Math.floor(Math.random() * 10) + 2,
        color: donutColors[i % donutColors.length]
    })).slice(0, 4);

    const totalPerfTasks = teamPerformance.reduce((acc, d) => acc + d.tasks, 0) || 1;
    let cumulative = 0;
    const conicStops = teamPerformance.map((d) => {
        const pct = (d.tasks / totalPerfTasks) * 100;
        const start = cumulative;
        cumulative += pct;
        return `${d.color} ${start}% ${cumulative}%`;
    }).join(', ');

    // Timeline Data
    const timelineItems = overviewRoadmap ? overviewRoadmap.milestones.map(m => ({
        title: m.title,
        status: m.progress === 100 ? 'Done' : (m.status === 'active' ? 'In Progress' : 'Upcoming')
    })).slice(0, 3) : [];

    return (
        <div className="fade-in" style={{ paddingBottom: '3rem' }}>
            {/* Header / Greeting */}
            <div className="flex justify-between items-end" style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Overview of your workspace performance.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={() => setIsAddingNote(!isAddingNote)}>
                        <Plus size={16} /> Add Note
                    </button>
                    <button className="btn btn-primary" onClick={() => setView('ideation')}>
                        <Plus size={16} /> New Project
                    </button>
                </div>
            </div>

            {/* Dashboard Alerts */}
            {isAddingNote && isAdmin && (
                <div className="saas-card scale-in" style={{ padding: '1.25rem', marginBottom: '2rem', background: 'var(--card-bg)' }}>
                    <div className="flex items-center gap-3">
                        <FileText size={20} color="var(--accent-indigo)" />
                        <input
                            type="text"
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Type an announcement... (Expires in 24 hours)"
                            style={{ flex: 1, background: 'rgba(0,0,0,0.15)', border: '1px solid var(--panel-border)', padding: '0.75rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
                            autoFocus
                        />
                        <button className="btn btn-primary" onClick={() => {
                            if (!noteText.trim()) return;
                            setDashboardNotes([{ id: Date.now().toString(), text: noteText, timestamp: Date.now() }, ...(dashboardNotes || [])]);
                            setNoteText('');
                            setIsAddingNote(false);
                        }}>Post</button>
                        <button className="btn-ghost" onClick={() => setIsAddingNote(false)}><X size={20} /></button>
                    </div>
                </div>
            )}

            {/* Main Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* Overall Progress */}
                <div className="saas-card" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '12px' }}>
                            <Target size={22} color="var(--accent-purple)" />
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingUp size={14} /> +12%
                        </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' }}>{completionRate}%</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overall Progress</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>+12% this week</div>
                </div>

                {/* Tasks Completed */}
                <div className="saas-card" style={{ padding: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', width: 'fit-content', marginBottom: '1rem' }}>
                        <CheckCircle size={22} color="var(--success-color)" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' }}>{completedTasks}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tasks Completed</div>
                </div>

                {/* In Progress */}
                <div className="saas-card" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                            <Zap size={22} color="var(--warning-color)" />
                        </div>
                        {overdueTasks > 0 && (
                            <span className="badge-tag" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)' }}>{overdueTasks} overdue</span>
                        )}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' }}>{inProgressTasks}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>In Progress Tasks</div>
                </div>

                {/* Team Active */}
                <div className="saas-card" style={{ padding: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', width: 'fit-content', marginBottom: '1rem' }}>
                        <Users size={22} color="var(--accent-blue)" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' }}>{activeMembersCount}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Team Active</div>
                    <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: 600, marginTop: '0.5rem' }}>
                        <div className="status-dot status-online" style={{ width: '6px', height: '6px' }} />
                        All online now
                    </div>
                </div>
            </div>

            {/* Second Row: Main Chart & Team */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="flex-col gap-6">
                    {/* Project Progress Center Card */}
                    {overviewRoadmap && (
                        <div className="saas-card" style={{ padding: '2rem' }}>
                            <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{overviewRoadmap.ideaName}</h3>
                                    <div className="flex gap-2">
                                        <span className="badge-tag">Dev</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} /> Deadline: Mar 2nd
                                        </span>
                                    </div>
                                </div>
                                <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => handleOpenRoadmap(overviewRoadmap.id)}>
                                    View Detailed Planning <ChevronRight size={14} />
                                </button>
                            </div>

                            <div style={{ position: 'relative', marginBottom: '1.5rem', padding: '0 1rem' }}>
                                {/* Horizontal Phase Tracker */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    zIndex: 1,
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)'
                                }}>
                                    {['Idea', 'Building', 'Testing', 'Shipped'].map((phase, i) => {
                                        const progress = completionRate;
                                        const phaseThresholds = [25, 50, 75, 100];
                                        const isReached = progress >= phaseThresholds[i] || (i === 0);
                                        const isActive = progress < phaseThresholds[i] && (i === 0 || progress >= phaseThresholds[i - 1]);

                                        return (
                                            <div key={phase} className="flex-col items-center gap-3">
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '50%',
                                                    background: isReached ? 'var(--accent-indigo)' : 'var(--panel-border)',
                                                    border: isActive ? '4px solid rgba(99, 102, 241, 0.2)' : 'none',
                                                    transition: 'all 0.5s ease'
                                                }}></div>
                                                <span style={{ color: isActive || isReached ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{phase}{phase === 'Shipped' ? ' 🚀' : ''}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Connector Line */}
                                <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    left: '2rem',
                                    right: '2rem',
                                    height: '2px',
                                    background: 'var(--panel-border)',
                                    zIndex: 0
                                }}>
                                    <div style={{
                                        width: `${completionRate}%`,
                                        height: '100%',
                                        background: 'var(--accent-indigo)',
                                        transition: 'width 1.5s ease'
                                    }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Task Progress Bar Graph */}
                    <div className="saas-card" style={{ padding: '1.5rem' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                            <div className="flex items-center gap-2">
                                <BarChart2 size={18} color="var(--accent-blue)" />
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Task Progress</h3>
                            </div>
                            <div className="flex gap-1 p-1" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                                <button
                                    onClick={() => setGraphToggle('weekly')}
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        border: 'none',
                                        background: graphToggle === 'weekly' ? 'rgba(255,255,255,0.08)' : 'transparent',
                                        color: graphToggle === 'weekly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}
                                >Weekly</button>
                                <button
                                    onClick={() => setGraphToggle('monthly')}
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        border: 'none',
                                        background: graphToggle === 'monthly' ? 'rgba(255,255,255,0.08)' : 'transparent',
                                        color: graphToggle === 'monthly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}
                                >Monthly</button>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex gap-5" style={{ marginBottom: '1.25rem' }}>
                            <div className="flex items-center gap-2" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-indigo)' }} />Completed
                            </div>
                            <div className="flex items-center gap-2" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-blue)', opacity: 0.55 }} />In Progress
                            </div>
                        </div>

                        {/* Chart Area with Y-axis */}
                        <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
                            {/* Y-Axis */}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '8px', paddingBottom: '22px', minWidth: '30px' }}>
                                {['100%', '75%', '50%', '25%', '0%'].map(v => (
                                    <span key={v} style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', lineHeight: 1, textAlign: 'right' }}>{v}</span>
                                ))}
                            </div>
                            {/* Grid + Bars */}
                            <div style={{ flex: 1 }}>
                                <div style={{ position: 'relative', height: '180px', borderLeft: '1px solid var(--panel-border)', borderBottom: '1px solid var(--panel-border)' }}>
                                    {[75, 50, 25].map(pct => (
                                        <div key={pct} style={{ position: 'absolute', left: 0, right: 0, top: `${100 - pct}%`, borderTop: '1px dashed rgba(255,255,255,0.06)' }} />
                                    ))}
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', padding: '0 4px' }}>
                                        {(graphToggle === 'weekly' ? weeklyBars : monthlyBars).map((bar, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '100%', flex: 1, justifyContent: 'center' }}>
                                                <div title={`Completed: ${bar.c}%`} style={{ height: `${Math.max(bar.c, 2)}%`, width: '14px', background: 'var(--accent-indigo)', borderRadius: '4px 4px 0 0', transition: 'height 0.6s ease', cursor: 'help' }} />
                                                <div title={`In Progress: ${bar.p}%`} style={{ height: `${Math.max(bar.p, bar.c > 0 ? 2 : 0)}%`, width: '14px', background: 'var(--accent-blue)', borderRadius: '4px 4px 0 0', opacity: 0.55, transition: 'height 0.6s ease', cursor: 'help' }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '5px 4px 0' }}>
                                    {(graphToggle === 'weekly' ? weekLabels : monthLabels).map(label => (
                                        <span key={label} style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', flex: 1, textAlign: 'center' }}>{label}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Column Panels */}
                <div className="flex-col gap-6">
                    {/* Team Performance Panel */}
                    <div className="saas-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Team Performance</h3>
                        <div className="flex-col gap-5">
                            {teamMembers.slice(0, 4).map((m, i) => (
                                <div key={i} className="flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div style={{ position: 'relative' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600
                                                }}>{m.name[0]}</div>
                                                {m.online && <div className="status-dot status-online" style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', border: '2px solid var(--card-bg)' }} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{m.role}</div>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>{m.progress}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px' }}>
                                        <div style={{ width: `${m.progress}%`, height: '100%', background: 'var(--accent-indigo)', borderRadius: '3px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Donut Chart: Task Distribution */}
                    <div className="saas-card" style={{ padding: '1.5rem' }}>
                        <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                            <PieChart size={18} color="var(--accent-indigo)" />
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Task Distribution</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: `conic-gradient(${conicStops || 'var(--panel-border) 0 100%'})`,
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'var(--card-bg)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{totalTasks}</span>
                                    <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total</span>
                                </div>
                            </div>
                            <div className="flex-col gap-2 flex-1">
                                {teamPerformance.map((tp, i) => (
                                    <div key={i} className="flex justify-between items-center" style={{ fontSize: '0.75rem' }}>
                                        <div className="flex items-center gap-2">
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tp.color }} />
                                            <span>{tp.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{tp.tasks}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Third Row: Timeline & Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Timeline Panel */}
                <div className="saas-card" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                        <div className="flex items-center gap-2">
                            <Calendar size={18} color="var(--warning-color)" />
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Timeline</h3>
                        </div>
                        <button className="btn-ghost" style={{ fontSize: '0.75rem', fontWeight: 600 }} onClick={() => setView('roadmap')}>View Full Timeline →</button>
                    </div>
                    <div className="flex-col gap-4">
                        {timelineItems.length > 0 ? timelineItems.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--panel-border)' }}>
                                <div className="flex items-center gap-3">
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: item.status === 'Done' ? 'var(--success-color)' : (item.status === 'In Progress' ? 'var(--accent-indigo)' : 'var(--text-secondary)')
                                    }}></div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.title}</span>
                                </div>
                                <span className="badge-tag" style={{
                                    background: item.status === 'Done' ? 'rgba(16, 185, 129, 0.1)' : (item.status === 'In Progress' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(156, 163, 175, 0.1)'),
                                    color: item.status === 'Done' ? 'var(--success-color)' : (item.status === 'In Progress' ? 'var(--accent-indigo)' : 'var(--text-secondary)')
                                }}>{item.status}</span>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No roadmap items found.</div>
                        )}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="saas-card" style={{ padding: '1.5rem' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                        <Activity size={18} color="var(--accent-indigo)" />
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Activity</h3>
                    </div>
                    <div className="flex-col gap-5">
                        {allRecentActivities.slice(0, 4).map((act) => (
                            <div key={act.id} className="flex gap-4">
                                <div style={{
                                    padding: '0.4rem',
                                    background: act.type === 'complete' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                    borderRadius: '8px',
                                    height: 'fit-content'
                                }}>
                                    {act.type === 'complete' ? <CheckCircle size={14} color="var(--success-color)" /> : <Activity size={14} color="var(--accent-indigo)" />}
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{act.text}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{act.time}</span>
                                </div>
                            </div>
                        ))}
                        {allRecentActivities.length === 0 && (
                            <div className="flex gap-4">
                                <div style={{ padding: '0.4rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                                    <Zap size={14} color="var(--accent-indigo)" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Project sequence established.</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Just now</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* ===== KANBAN BOARD SECTION ===== */}
            <div style={{ marginTop: '2.5rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                    <div className="flex items-center gap-3">
                        <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px' }}>
                            <Layers size={20} color="var(--accent-indigo)" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Project Board</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Drag cards between columns to update status</p>
                        </div>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setView('kanban')} style={{ fontSize: '0.85rem' }}>
                        View Full Board <ChevronRight size={14} />
                    </button>
                </div>

                {/* Kanban Columns */}
                {(() => {
                    // Build kanban data from active roadmap tasks
                    const allTasks = [];
                    const srcRoadmap = overviewRoadmap;
                    if (srcRoadmap) {
                        srcRoadmap.milestones.forEach(m => {
                            m.tasks.forEach(t => allTasks.push({ ...t, milestoneId: m.id, milestoneTitle: m.title }));
                        });
                    }

                    const columns = [
                        { id: 'todo', label: 'To Do', color: 'var(--text-secondary)', tasks: allTasks.filter(t => !t.completed && t.status !== 'in-progress' && t.status !== 'review' && t.status !== 'done') },
                        { id: 'inProgress', label: 'In Progress', color: 'var(--accent-indigo)', tasks: allTasks.filter(t => t.status === 'in-progress' || t.status === 'active') },
                        { id: 'review', label: 'Under Review', color: 'var(--warning-color)', tasks: allTasks.filter(t => t.status === 'review' || t.status === 'testing') },
                        { id: 'done', label: 'Done', color: 'var(--success-color)', tasks: allTasks.filter(t => t.completed || t.status === 'done') },
                    ];

                    const handleDragStart = (e, task, colId) => {
                        e.dataTransfer.setData('taskId', task.id);
                        e.dataTransfer.setData('milestoneId', task.milestoneId);
                        e.dataTransfer.setData('sourceCol', colId);
                    };

                    const handleDrop = (e, destCol) => {
                        e.preventDefault();
                        const taskId = e.dataTransfer.getData('taskId');
                        const milestoneId = e.dataTransfer.getData('milestoneId');
                        const sourceCol = e.dataTransfer.getData('sourceCol');
                        if (sourceCol === destCol || !taskId || !overviewRoadmap) return;

                        const newMilestones = overviewRoadmap.milestones.map(m => {
                            if (m.id !== milestoneId) return m;
                            const newTasks = m.tasks.map(t => {
                                if (t.id !== taskId) return t;
                                const isCompleted = destCol === 'done';
                                const statusMap = { todo: 'todo', inProgress: 'in-progress', review: 'review', done: 'done' };
                                return { ...t, completed: isCompleted, status: statusMap[destCol] };
                            });
                            const doneCount = newTasks.filter(t => t.completed).length;
                            const progress = newTasks.length ? Math.round((doneCount / newTasks.length) * 100) : 0;
                            return { ...m, tasks: newTasks, progress, status: progress === 100 ? 'completed' : progress > 0 ? 'active' : m.status };
                        });

                        // ✅ Persist the updated roadmap into global state
                        if (handleUpdateRoadmap) {
                            handleUpdateRoadmap({ ...overviewRoadmap, milestones: newMilestones });
                        }
                    };

                    return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                            {columns.map(col => (
                                <div
                                    key={col.id}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => handleDrop(e, col.id)}
                                    style={{
                                        background: 'rgba(255,255,255,0.01)',
                                        border: '1px solid var(--panel-border)',
                                        borderRadius: '14px',
                                        minHeight: '280px',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    {/* Column Header */}
                                    <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div className="flex items-center gap-2">
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{col.label}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '1px 7px', borderRadius: '4px' }}>{col.tasks.length}</span>
                                        </div>
                                        <MoreHorizontal size={15} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                                    </div>

                                    {/* Task Cards */}
                                    <div style={{ padding: '0 0.75rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '320px' }}>
                                        {col.tasks.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', border: '2px dashed var(--panel-border)', borderRadius: '10px' }}>
                                                Drop here
                                            </div>
                                        )}
                                        {col.tasks.map(task => (
                                            <div
                                                key={task.id}
                                                draggable
                                                onDragStart={e => handleDragStart(e, task, col.id)}
                                                className="saas-card"
                                                style={{
                                                    padding: '0.9rem',
                                                    cursor: 'grab',
                                                    borderLeft: `3px solid ${col.color}`,
                                                    userSelect: 'none'
                                                }}
                                            >
                                                <p style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: '1.4', marginBottom: '0.75rem', color: col.id === 'done' ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: col.id === 'done' ? 'line-through' : 'none' }}>
                                                    {task.title}
                                                </p>
                                                <div className="flex justify-between items-center">
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-indigo)', background: 'rgba(99,102,241,0.08)', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                                                        {task.milestoneTitle?.slice(0, 16)}{task.milestoneTitle?.length > 16 ? '…' : ''}
                                                    </span>
                                                    <div className="flex items-center gap-1" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                        <Clock size={10} /> {task.estimatedHours || '?'}h
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default DashboardView;
