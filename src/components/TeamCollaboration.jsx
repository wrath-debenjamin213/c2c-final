import React, { useMemo } from 'react';
import { Users, User, CheckCircle, Circle, Play, Clock } from 'lucide-react';
import TeamChat from './TeamChat';

const PREDEFINED_MEMBERS = [
    { name: 'Alex', color: 'var(--accent-blue)', bg: 'rgba(77, 166, 255, 0.1)' },
    { name: 'Sarah', color: 'var(--accent-purple)', bg: 'rgba(177, 77, 255, 0.1)' },
    { name: 'Mike', color: 'var(--success-color)', bg: 'rgba(0, 200, 83, 0.1)' },
    { name: 'Emily', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { name: 'David', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    { name: 'Chris', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.1)' },
    { name: 'Jessica', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
];

const TeamCollaboration = ({ roadmap, onUpdate }) => {
    const teamMembers = (() => {
        const members = [{ id: 'unassigned', name: 'Unassigned', color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.05)' }];
        const roadmapMembers = roadmap.teamMembers && roadmap.teamMembers.length > 0 ? roadmap.teamMembers : ['Builder'];

        roadmapMembers.forEach((name, i) => {
            const memberTemplate = PREDEFINED_MEMBERS[i % PREDEFINED_MEMBERS.length];
            members.push({
                id: name,
                name: name,
                color: memberTemplate.color,
                bg: memberTemplate.bg
            });
        });
        return members;
    })();

    // Calculate stats for the dashboard
    const memberStats = (() => {
        // Initialize stats
        const stats = teamMembers.reduce((acc, member) => {
            acc[member.id] = { ...member, totalTasks: 0, completedTasks: 0, hours: 0 };
            return acc;
        }, {});

        // Aggregate data
        roadmap.milestones?.forEach(m => {
            m.tasks?.forEach(t => {
                const assigneeId = t.assignee || 'unassigned';
                // Failsafe in case a deleted user ID exists somehow
                if (stats[assigneeId]) {
                    stats[assigneeId].totalTasks += 1;
                    stats[assigneeId].hours += t.estimatedHours || 0;
                    if (t.completed || t.status === 'done') {
                        stats[assigneeId].completedTasks += 1;
                    }
                }
            });
        });

        return Object.values(stats);
    })();

    const handleAssign = (milestoneId, taskId, newAssigneeId) => {
        const newMilestones = roadmap.milestones?.map(m => {
            if (m.id === milestoneId) {
                const newTasks = m.tasks?.map(t => {
                    if (t.id === taskId) {
                        return { ...t, assignee: newAssigneeId };
                    }
                    return t;
                });
                return { ...m, tasks: newTasks };
            }
            return m;
        });

        if (onUpdate) onUpdate({ ...roadmap, milestones: newMilestones });
    };

    return (
        <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '2rem' }}>

            {/* 1. Member Progress Dashboard */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={24} color="var(--accent-purple)" />
                Team Progress Report
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                {teamMembers.filter(m => m.id !== 'unassigned').map(member => {
                    const stats = memberStats.find(s => s.id === member.id) || { totalTasks: 0, completedTasks: 0, hours: 0 };
                    const progress = stats.totalTasks === 0 ? 0 : Math.round((stats.completedTasks / stats.totalTasks) * 100);

                    return (
                        <div key={member.id} className="glass-panel" style={{ padding: '1.5rem', borderTop: `4px solid ${member.color}`, background: member.bg }}>
                            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                                <div className="flex items-center gap-2">
                                    <User size={18} color={member.color} />
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{member.name}</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Task Completion</span>
                                    <span style={{ fontWeight: 'bold' }}>{progress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: member.color, borderRadius: '3px' }}></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span className="flex items-center gap-1"><CheckCircle size={14} /> {stats.completedTasks} / {stats.totalTasks} tasks</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {stats.hours} hrs</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* 2. Task Allocation List */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Play size={24} color="var(--accent-blue)" />
                Task Allocation
            </h3>

            <div className="flex-col gap-6">
                {roadmap.milestones?.map(m => (
                    <div key={m.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--panel-border)' }}>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{m.title}</h4>

                        <div className="flex-col gap-2">
                            {m.tasks?.map(t => {
                                const currentAssignee = t.assignee || 'unassigned';
                                const isDone = t.completed || t.status === 'done';

                                return (
                                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="flex items-center gap-3" style={{ flex: 1 }}>
                                            {isDone ? <CheckCircle size={18} color="var(--success-color)" /> : <Circle size={18} color="var(--text-secondary)" />}
                                            <span style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                                {t.title}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.estimatedHours}h</span>
                                            <select
                                                value={currentAssignee}
                                                onChange={(e) => handleAssign(m.id, t.id, e.target.value)}
                                                style={{
                                                    background: 'rgba(0,0,0,0.3)',
                                                    border: '1px solid var(--panel-border)',
                                                    color: teamMembers.find(member => member.id === currentAssignee)?.color || 'white',
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '4px',
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                    width: '140px'
                                                }}
                                            >
                                                {teamMembers.map(member => (
                                                    <option key={member.id} value={member.id} style={{ color: 'black' }}>
                                                        {member.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Live Team Chat */}
            <div style={{ marginTop: '3rem' }}>
                <TeamChat roadmapId={roadmap.id} />
            </div>

        </div >
    );
};

export default TeamCollaboration;
