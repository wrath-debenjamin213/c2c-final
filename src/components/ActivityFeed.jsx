import React, { useMemo } from 'react';
import { Activity, CheckCircle, PlusCircle, PlayCircle, Zap } from 'lucide-react';

const ActivityFeed = ({ roadmap }) => {
    // Generate a mock feed based on the current state of the roadmap.
    // In a real database, these would be discrete event logs with timestamps.
    const activities = useMemo(() => {
        let feed = [];
        let baseTime = new Date().getTime();

        // Genesis event
        feed.push({
            id: 'genesis',
            type: 'creation',
            icon: <Zap size={18} color="var(--accent-purple)" />,
            title: `Created new roadmap: ${roadmap.ideaName}`,
            time: new Date(baseTime - 86400000 * roadmap.totalWeeks).toLocaleDateString(),
            description: `Targeting a ${roadmap.totalWeeks}-week timeline in the ${roadmap.category} category.`,
        });

        roadmap.milestones.forEach((m, mIndex) => {
            feed.push({
                id: `m-start-${m.id}`,
                type: 'milestone',
                icon: <PlayCircle size={18} color="var(--accent-blue)" />,
                title: `Phase Initiated: ${m.title}`,
                time: new Date(baseTime - 86400000 * (roadmap.totalWeeks - mIndex)).toLocaleDateString(),
                description: `Began working on the ${m.title} phase.`,
            });

            m.tasks.forEach((t, tIndex) => {
                // If a task is completed, push a completed event
                if (t.completed || t.status === 'done') {
                    feed.push({
                        id: `t-done-${t.id}`,
                        type: 'task-complete',
                        icon: <CheckCircle size={18} color="var(--success-color)" />,
                        title: `Completed Task: ${t.title}`,
                        time: new Date(baseTime - 3600000 * (tIndex + 1)).toLocaleString(),
                        description: `Marked "${t.title}" as complete in the ${m.title} phase.`,
                    });
                } else if (t.id.startsWith('custom-t')) {
                    // It's a custom task added by the user
                    feed.push({
                        id: `t-added-${t.id}`,
                        type: 'task-added',
                        icon: <PlusCircle size={18} color="var(--text-secondary)" />,
                        title: `Added Custom Task: ${t.title}`,
                        time: new Date(baseTime - 1800000 * (tIndex + 1)).toLocaleString(),
                        description: `Manually added a new requirement to ${m.title}.`,
                    });
                }
            });
        });

        // Sort descending by time
        // For this mock, we'll just reverse the array to somewhat simulate chronological order (newest first)
        return feed.reverse();
    }, [roadmap]);

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={24} color="var(--accent-blue)" />
                    Project Activity Feed
                </h3>

                <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                    {/* Vertical timeline line */}
                    <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'var(--panel-border)' }}></div>

                    {activities.length > 0 ? activities.map((item, index) => (
                        <div key={item.id} style={{ position: 'relative', marginBottom: index === activities.length - 1 ? 0 : '2rem' }}>
                            {/* Timeline dot */}
                            <div style={{ position: 'absolute', left: '-2.05rem', top: '4px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--panel-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, boxShadow: '0 0 0 4px var(--bg-color)' }}>
                                {item.icon}
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{item.title}</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                                        {item.time}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div style={{ color: 'var(--text-secondary)' }}>No activity recorded yet in this roadmap.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityFeed;
