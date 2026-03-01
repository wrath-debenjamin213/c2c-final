import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, MoreHorizontal, User } from 'lucide-react';

const KanbanBoard = ({ roadmap, onUpdate }) => {
    // Extract all tasks and map them to board columns
    const [boardData, setBoardData] = useState({ todo: [], inProgress: [], review: [], done: [] });

    useEffect(() => {
        const todo = [];
        const inProgress = [];
        const review = [];
        const done = [];

        roadmap.milestones.forEach(m => {
            m.tasks.forEach(t => {
                const enhancedTask = { ...t, milestoneId: m.id, milestoneTitle: m.title };
                if (t.completed || t.status === 'done') {
                    done.push(enhancedTask);
                } else if (t.status === 'review' || t.status === 'testing') {
                    review.push(enhancedTask);
                } else if (t.status === 'in-progress' || t.status === 'active') {
                    inProgress.push(enhancedTask);
                } else {
                    todo.push(enhancedTask);
                }
            });
        });

        setBoardData({ todo, inProgress, review, done });
    }, [roadmap]);

    const onDragStart = (e, taskId, milestoneId, sourceCol) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.setData('milestoneId', milestoneId);
        e.dataTransfer.setData('sourceCol', sourceCol);
    }

    const onDragOver = (e) => { e.preventDefault(); }

    const onDrop = (e, destCol) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const milestoneId = e.dataTransfer.getData('milestoneId');
        const sourceCol = e.dataTransfer.getData('sourceCol');

        if (!taskId || sourceCol === destCol) return;

        const newMilestones = roadmap.milestones.map(m => {
            if (m.id === milestoneId) {
                const newTasks = m.tasks.map(t => {
                    if (t.id === taskId) {
                        const isCompleted = destCol === 'done';
                        let newStatus = 'todo';
                        if (destCol === 'inProgress') newStatus = 'in-progress';
                        if (destCol === 'review') newStatus = 'review';
                        if (destCol === 'done') newStatus = 'done';
                        return { ...t, completed: isCompleted, status: newStatus };
                    }
                    return t;
                });

                const completedCount = newTasks.filter(t => t.completed).length;
                const progress = newTasks.length === 0 ? 0 : Math.round((completedCount / newTasks.length) * 100);
                let newStatusM = m.status;
                if (progress === 100) newStatusM = 'completed';
                else if (progress > 0 && progress < 100) newStatusM = 'active';

                return { ...m, tasks: newTasks, progress, status: newStatusM };
            }
            return m;
        });

        if (onUpdate) onUpdate({ ...roadmap, milestones: newMilestones });
    }

    const Column = ({ title, id, tasks, color }) => (
        <div
            className="kanban-column"
            style={{
                flex: 1,
                minWidth: '280px',
                background: 'rgba(255,255,255,0.01)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '70vh'
            }}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, id)}
        >
            <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="flex items-center gap-2">
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: color
                    }} />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1px 6px',
                        borderRadius: '4px'
                    }}>{tasks.length}</span>
                </div>
                <MoreHorizontal size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
            </div>

            <div style={{ padding: '0 1rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.map(task => {
                    const isDev = task.title.toLowerCase().includes('api') || task.title.toLowerCase().includes('data') || task.title.toLowerCase().includes('backend');
                    const isDesign = task.title.toLowerCase().includes('ui') || task.title.toLowerCase().includes('ux') || task.title.toLowerCase().includes('mockup');

                    return (
                        <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, task.id, task.milestoneId, id)}
                            className="saas-card transition-all"
                            style={{
                                padding: '1rem',
                                background: 'var(--card-bg)',
                                cursor: 'grab',
                                borderLeft: `3px solid ${color}`
                            }}
                        >
                            <div className="flex justify-between items-start" style={{ marginBottom: '0.75rem' }}>
                                <div className="flex gap-2">
                                    {(isDev || (!isDev && !isDesign)) && <span className="badge-tag" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo)' }}>Dev</span>}
                                    {isDesign && <span className="badge-tag" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>Design</span>}
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>#{task.id.slice(-4)}</span>
                            </div>

                            <h4 style={{
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                lineHeight: '1.4',
                                color: 'var(--text-primary)',
                                marginBottom: '1rem'
                            }}>{task.title}</h4>

                            {id === 'inProgress' && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', marginBottom: '4px' }}>
                                        <div style={{ width: '60%', height: '100%', background: 'var(--accent-indigo)', borderRadius: '2px' }} />
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'right' }}>60%</div>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <Clock size={12} /> <span>Mar {Math.floor(Math.random() * 20) + 1}</span>
                                </div>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'var(--panel-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--card-bg)'
                                }}>
                                    <User size={14} color="var(--text-secondary)" />
                                </div>
                            </div>
                        </div>
                    );
                })}
                {tasks.length === 0 && (
                    <div style={{
                        border: '2px dashed var(--panel-border)',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem'
                    }}>
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '0 1rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Project Board</h2>
                <div className="flex gap-2">
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Filter</button>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>+ Add Column</button>
                </div>
            </div>

            <div className="fade-in flex gap-6" style={{ alignItems: 'flex-start', overflowX: 'auto', paddingBottom: '2rem' }}>
                <Column title="To Do" id="todo" tasks={boardData.todo} color="var(--text-secondary)" />
                <Column title="In Progress" id="inProgress" tasks={boardData.inProgress} color="var(--accent-indigo)" />
                <Column title="Under Review" id="review" tasks={boardData.review} color="#F59E0B" />
                <Column title="Done" id="done" tasks={boardData.done} color="var(--success-color)" />
            </div>
        </div>
    );
};

export default KanbanBoard;
