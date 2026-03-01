import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { CheckCircle, Circle, Clock, Activity, ChevronDown, ChevronUp, DollarSign, ArrowRight, Plus, Trash2, Edit2, Save, X, LayoutDashboard, List, Users, ListTodo, Share2 } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import ActivityFeed from './ActivityFeed';
import TeamCollaboration from './TeamCollaboration';
import ErrorBoundary from './ErrorBoundary';

const RoadmapView = ({ roadmap, onUpdate, setNotifications }) => {
    // Local UI State Only
    const [activeTab, setActiveTab] = useState('timeline');
    const [expandedMilestones, setExpandedMilestones] = useState(
        roadmap.milestones.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
    );
    const [expandedTasks, setExpandedTasks] = useState({});

    // Real-Time Sync State
    const socketRef = useRef(null);

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        socketRef.current = io(backendUrl);
        socketRef.current.emit('join_roadmap', roadmap.id);

        socketRef.current.on('roadmap_updated', (updatedRoadmap) => {
            if (onUpdate) {
                // Just update local app state, do not re-emit
                onUpdate(updatedRoadmap);
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [roadmap.id, onUpdate]);

    const handleLocalUpdate = (newRoadmap) => {
        if (onUpdate) onUpdate(newRoadmap);
        if (socketRef.current) {
            socketRef.current.emit('update_roadmap', { roadmapId: roadmap.id, newRoadmap });
        }
    };

    // Editing state
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTaskData, setEditTaskData] = useState(null);

    // Share State
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const response = await fetch(`${backendUrl}/api/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roadmap }),
            });

            if (!response.ok) throw new Error('Failed to generate share link');
            const data = await response.json();

            const shareUrl = `${window.location.origin}/?share=${data.shareId}`;

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(shareUrl);
                } else {
                    prompt("Share Link generated! Copy it below:", shareUrl);
                }
            } catch (clipboardErr) {
                console.warn("Clipboard API failed:", clipboardErr);
                prompt("Share Link generated! Copy it below:", shareUrl);
            }

            if (setNotifications) {
                setNotifications(prev => [{
                    id: Date.now().toString() + '-share',
                    type: 'success',
                    title: 'Link Generated!',
                    message: `Invite link for "${roadmap.ideaName}" is ready.`,
                    time: 'Just now',
                    read: false
                }, ...prev]);
            }
        } catch (error) {
            console.error("Share error:", error);
            if (setNotifications) {
                setNotifications(prev => [{
                    id: Date.now().toString() + '-err',
                    type: 'error',
                    title: 'Share Failed',
                    message: "Could not generate share link.",
                    time: 'Just now',
                    read: false
                }, ...prev]);
            }
        } finally {
            setIsSharing(false);
        }
    };

    const toggleMilestoneExpand = (milestoneId) => {
        setExpandedMilestones(prev => ({ ...prev, [milestoneId]: !prev[milestoneId] }));
    };

    const toggleTaskExpand = (e, taskId) => {
        e.stopPropagation();
        setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const updateMilestoneState = (milestone, newTasks) => {
        const completedCount = newTasks.filter(t => t.completed).length;
        const progress = newTasks.length === 0 ? 0 : Math.round((completedCount / newTasks.length) * 100);
        let newStatus = milestone.status;
        if (progress === 100) newStatus = 'completed';
        else if (progress > 0 && progress < 100) newStatus = 'active';
        return { ...milestone, tasks: newTasks, progress, status: newStatus };
    };

    const toggleTask = (milestoneId, taskId) => {
        if (editingTaskId === taskId) return; // Prevent toggle while editing

        let wasCompleted = false;
        let taskTitle = '';
        let milestoneTitle = '';
        let newlyCompletedMilestone = false;

        const newMilestones = roadmap.milestones.map((m) => {
            if (m.id === milestoneId) {
                milestoneTitle = m.title;
                const newTasks = m.tasks.map((t) => {
                    if (t.id === taskId) {
                        wasCompleted = !t.completed;
                        taskTitle = t.title;
                        return { ...t, completed: !t.completed };
                    }
                    return t;
                });

                const updated = updateMilestoneState(m, newTasks);
                if (m.progress < 100 && updated.progress === 100) newlyCompletedMilestone = true;
                return updated;
            }
            return m;
        });

        handleLocalUpdate({ ...roadmap, milestones: newMilestones });

        // Dispatch Notification if task was completed
        if (wasCompleted && setNotifications) {
            setNotifications(prev => [{
                id: Date.now().toString() + '-' + taskId,
                type: 'success',
                title: 'Task Completed',
                message: `You finished "${taskTitle}" in ${milestoneTitle}.`,
                time: 'Just now',
                read: false
            }, ...prev]);

            if (newlyCompletedMilestone) {
                setNotifications(prev => [{
                    id: Date.now().toString() + '-m-' + milestoneId,
                    type: 'milestone',
                    title: 'Phase Complete! 🎉',
                    message: `You've completed all tasks in "${milestoneTitle}". Amazing work.`,
                    time: 'Just now',
                    read: false
                }, ...prev]);
            }
        }
    };

    const addTask = (e, milestoneId) => {
        e.stopPropagation();
        const newTask = {
            id: `custom-t-${Date.now()}`,
            title: 'New Custom Task',
            estimatedHours: 2,
            completed: false,
            cost: '$0',
            prereqs: 'None',
            details: {
                whatThisMeans: 'A customized step added manually.',
                whatThisMeansExample: [],
                whyItMatters: ['Ensures all specific needs are met.'],
                whatYouNeedToDo: ['Define the specific actions required here.'],
                output: 'Completed custom task.',
                outputExample: ''
            }
        };

        const newMilestones = roadmap.milestones.map((m) => {
            if (m.id === milestoneId) {
                const newTasks = [...m.tasks, newTask];
                return updateMilestoneState(m, newTasks);
            }
            return m;
        });

        handleLocalUpdate({ ...roadmap, milestones: newMilestones });

        // Auto-expand task and start editing
        setExpandedTasks(prev => ({ ...prev, [newTask.id]: true }));
        startEditing(newTask, { stopPropagation: () => { } });
    };

    const deleteTask = (e, milestoneId, taskId) => {
        e.stopPropagation();
        const newMilestones = roadmap.milestones.map((m) => {
            if (m.id === milestoneId) {
                const newTasks = m.tasks.filter(t => t.id !== taskId);
                return updateMilestoneState(m, newTasks);
            }
            return m;
        });

        handleLocalUpdate({ ...roadmap, milestones: newMilestones });
    };

    const startEditing = (task, e) => {
        e.stopPropagation();
        setEditingTaskId(task.id);
        setEditTaskData({ ...task, details: { ...task.details } });
        setExpandedTasks(prev => ({ ...prev, [task.id]: true })); // Ensure expanded when editing
    };

    const cancelEditing = (e) => {
        if (e) e.stopPropagation();
        setEditingTaskId(null);
        setEditTaskData(null);
    };

    const saveTask = (e, milestoneId) => {
        e.stopPropagation();
        const newMilestones = roadmap.milestones.map((m) => {
            if (m.id === milestoneId) {
                const newTasks = m.tasks.map(t => t.id === editingTaskId ? editTaskData : t);
                return updateMilestoneState(m, newTasks);
            }
            return m;
        });

        handleLocalUpdate({ ...roadmap, milestones: newMilestones });

        setEditingTaskId(null);
        setEditTaskData(null);
    };

    return (
        <div className="roadmap-container flex-col gap-6" style={{ maxWidth: '900px', margin: '0 auto' }}>

            <div className="glass-panel text-gradient-bg" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{roadmap.ideaName}</h2>
                    <div className="flex items-center gap-4" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-2"><Clock size={16} /> {roadmap.totalWeeks} Weeks Total</span>
                        <span className="flex items-center gap-2"><Activity size={16} /> Active Tracking</span>
                    </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1 }} className="text-gradient">
                            {roadmap.milestones.length === 0 ? 0 : Math.round(roadmap.milestones.reduce((acc, m) => acc + m.progress, 0) / roadmap.milestones.length)}%
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Overall Progress</div>
                    </div>

                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="btn hover-bg-subtle"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '4px' }}
                    >
                        <Share2 size={16} />
                        {isSharing ? 'Generating...' : 'Share Roadmap'}
                    </button>
                </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="flex gap-2" style={{ borderBottom: '1px solid var(--panel-border)', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                <button onClick={() => setActiveTab('timeline')} className={`btn ${activeTab === 'timeline' ? 'btn-primary' : 'hover-bg-subtle'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: activeTab === 'timeline' ? 'var(--accent-blue)' : 'transparent', border: 'none', color: activeTab === 'timeline' ? 'white' : 'var(--text-secondary)' }}>
                    <List size={18} /> Timeline
                </button>
                <button onClick={() => setActiveTab('kanban')} className={`btn ${activeTab === 'kanban' ? 'btn-primary' : 'hover-bg-subtle'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: activeTab === 'kanban' ? 'var(--accent-blue)' : 'transparent', border: 'none', color: activeTab === 'kanban' ? 'white' : 'var(--text-secondary)' }}>
                    <LayoutDashboard size={18} /> Kanban
                </button>
                <button onClick={() => setActiveTab('activity')} className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'hover-bg-subtle'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: activeTab === 'activity' ? 'var(--accent-blue)' : 'transparent', border: 'none', color: activeTab === 'activity' ? 'white' : 'var(--text-secondary)' }}>
                    <ListTodo size={18} /> Activity
                </button>
                <button onClick={() => setActiveTab('team')} className={`btn ${activeTab === 'team' ? 'btn-primary' : 'hover-bg-subtle'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: activeTab === 'team' ? 'var(--accent-blue)' : 'transparent', border: 'none', color: activeTab === 'team' ? 'white' : 'var(--text-secondary)' }}>
                    <Users size={18} /> Team
                </button>
            </div>

            {activeTab === 'kanban' && <KanbanBoard roadmap={roadmap} onUpdate={onUpdate} />}
            {activeTab === 'activity' && <ActivityFeed roadmap={roadmap} />}
            {activeTab === 'team' && (
                <ErrorBoundary>
                    <TeamCollaboration roadmap={roadmap} onUpdate={handleLocalUpdate} />
                </ErrorBoundary>
            )}

            {
                activeTab === 'timeline' && (
                    <div className="milestones-timeline flex-col gap-6" style={{ position: 'relative', paddingLeft: '2rem', marginTop: '1rem' }}>
                        {/* Vertical Timeline Line */}
                        <div style={{ position: 'absolute', left: '11px', top: '20px', bottom: '20px', width: '2px', background: 'var(--panel-border)', zIndex: 0 }}></div>

                        {roadmap.milestones.map((milestone) => (
                            <div key={milestone.id} className="milestone-card glass-panel" style={{ position: 'relative', zIndex: 1, padding: '1.5rem', marginLeft: '1rem', borderLeft: milestone.status === 'active' ? '4px solid var(--accent-blue)' : milestone.status === 'completed' ? '4px solid var(--success-color)' : '1px solid var(--panel-border)' }}>

                                {/* Timeline Node */}
                                <div style={{ position: 'absolute', left: '-2.05rem', top: '1.5rem', width: '16px', height: '16px', borderRadius: '50%', background: milestone.status === 'completed' ? 'var(--success-color)' : milestone.status === 'active' ? 'var(--accent-blue)' : 'var(--bg-secondary)', border: '4px solid var(--bg-color)', transform: 'translateX(-50%)', boxSizing: 'content-box' }}></div>

                                <div className="flex justify-between items-start" style={{ marginBottom: '1rem', cursor: 'pointer' }} onClick={() => toggleMilestoneExpand(milestone.id)}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: milestone.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                            {expandedMilestones[milestone.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            {milestone.title}
                                        </h3>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: '600', marginLeft: '1.75rem' }}>{milestone.duration}</span>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: milestone.progress === 100 ? 'var(--success-color)' : 'var(--text-primary)', fontSize: '1.2rem' }}>
                                        {milestone.progress}%
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => toggleMilestoneExpand(milestone.id)}>
                                    <div style={{ height: '100%', width: `${milestone.progress}%`, background: milestone.progress === 100 ? 'var(--success-color)' : 'var(--accent-gradient)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                </div>

                                {/* Expandable Tasks Container */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateRows: expandedMilestones[milestone.id] ? '1fr' : '0fr',
                                    transition: 'grid-template-rows 0.3s ease-in-out'
                                }}>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div className="tasks-list flex-col gap-3" style={{ paddingBottom: '0.5rem' }}>
                                            {milestone.tasks.map((task) => {
                                                const isEditing = editingTaskId === task.id;

                                                return (
                                                    <div key={task.id} className="task-item" style={{ padding: '0.85rem 1rem', background: task.completed && !isEditing ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: isEditing ? '1px solid var(--accent-blue)' : '1px solid var(--panel-border)', cursor: isEditing ? 'default' : 'pointer', transition: 'all 0.2s', filter: task.completed && !isEditing ? 'opacity(0.6)' : 'none' }} onClick={() => !isEditing && toggleTask(milestone.id, task.id)}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3" style={{ flex: 1 }}>
                                                                {task.completed ? <CheckCircle size={20} color="var(--success-color)" /> : <Circle size={20} color="var(--text-secondary)" />}

                                                                {isEditing ? (
                                                                    <input
                                                                        type="text"
                                                                        value={editTaskData.title}
                                                                        onChange={(e) => setEditTaskData({ ...editTaskData, title: e.target.value })}
                                                                        style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', padding: '0.4rem 0.8rem', borderRadius: '4px', color: 'white', fontSize: '1rem' }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        autoFocus
                                                                    />
                                                                ) : (
                                                                    <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: '500' }}>
                                                                        {task.title}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2" style={{ marginLeft: '1rem' }}>
                                                                {isEditing ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            value={editTaskData.estimatedHours}
                                                                            onChange={(e) => setEditTaskData({ ...editTaskData, estimatedHours: parseInt(e.target.value) || 0 })}
                                                                            style={{ width: '60px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', padding: '0.2rem', borderRadius: '4px', color: 'white', textAlign: 'center' }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        /> <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>hrs</span>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                                                                        {task.estimatedHours}h
                                                                    </div>
                                                                )}

                                                                {!isEditing && (
                                                                    <>
                                                                        <button onClick={(e) => startEditing(task, e)} style={{ padding: '0.3rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }} className="hover-bg-subtle" title="Edit Task">
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                        <button onClick={(e) => deleteTask(e, milestone.id, task.id)} style={{ padding: '0.3rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }} className="hover-bg-subtle hover-text-danger" title="Delete Task">
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </>
                                                                )}

                                                                <div onClick={(e) => !isEditing && toggleTaskExpand(e, task.id)} style={{ padding: '0.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', cursor: isEditing ? 'default' : 'pointer', opacity: isEditing ? 0.5 : 1 }}>
                                                                    {expandedTasks[task.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {expandedTasks[task.id] && task.details && (
                                                            <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginLeft: '2rem' }}>
                                                                {isEditing ? (
                                                                    <div className="flex-col gap-4">
                                                                        <div>
                                                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>What this means / Goal</label>
                                                                            <textarea
                                                                                value={editTaskData.details.whatThisMeans}
                                                                                onChange={(e) => setEditTaskData({ ...editTaskData, details: { ...editTaskData.details, whatThisMeans: e.target.value } })}
                                                                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', padding: '0.6rem', borderRadius: '4px', color: 'white', minHeight: '60px', resize: 'vertical' }}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>Expected Output</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editTaskData.details.output}
                                                                                onChange={(e) => setEditTaskData({ ...editTaskData, details: { ...editTaskData.details, output: e.target.value } })}
                                                                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', padding: '0.6rem', borderRadius: '4px', color: 'white' }}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                        </div>
                                                                        <div className="flex gap-3 justify-end mt-2">
                                                                            <button onClick={cancelEditing} className="btn hover-bg-subtle" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--panel-border)', color: 'white' }}>
                                                                                <X size={16} /> Cancel
                                                                            </button>
                                                                            <button onClick={(e) => saveTask(e, milestone.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                <Save size={16} /> Save Changes
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex gap-4">
                                                                            <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                                                <DollarSign size={14} /> <span>Est. Cost: <span style={{ color: 'var(--text-primary)' }}>{task.cost}</span></span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                                                <ArrowRight size={14} /> <span>Prerequisites: <span style={{ color: 'var(--text-primary)' }}>{task.prereqs}</span></span>
                                                                            </div>
                                                                        </div>

                                                                        {/* What this means */}
                                                                        <div>
                                                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent-blue)', letterSpacing: '0.05em' }}>What this means</span>
                                                                            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{task.details.whatThisMeans}</p>
                                                                            {task.details.whatThisMeansExample && task.details.whatThisMeansExample.length > 0 && (
                                                                                <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Example:</span>
                                                                                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                                        {task.details.whatThisMeansExample.map((ex, i) => <li key={i}>{ex}</li>)}
                                                                                    </ul>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Why this matters */}
                                                                        <div>
                                                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent-purple)', letterSpacing: '0.05em' }}>Why it matters</span>
                                                                            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                                {task.details.whyItMatters.map((reason, i) => <li key={i}>{reason}</li>)}
                                                                            </ul>
                                                                        </div>

                                                                        {/* What you need to do */}
                                                                        <div>
                                                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--success-color)', letterSpacing: '0.05em' }}>What you need to do</span>
                                                                            <ul style={{ listStyleType: 'decimal', paddingLeft: '1.5rem', marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                                {task.details.whatYouNeedToDo.map((step, i) => <li key={i}>{step}</li>)}
                                                                            </ul>
                                                                        </div>

                                                                        {/* Output of this task */}
                                                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                                                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>Output of this task</span>
                                                                            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{task.details.output}</p>
                                                                            {task.details.outputExample && (
                                                                                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                                                                                    Example: "{task.details.outputExample}"
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Add Task Button */}
                                            <button
                                                onClick={(e) => addTask(e, milestone.id)}
                                                className="btn hover-bg-subtle"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: '1px dashed rgba(255,255,255,0.2)',
                                                    color: 'var(--text-secondary)',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    marginTop: '0.5rem',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                                            >
                                                <Plus size={18} /> Add Custom Task
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
};

export default RoadmapView;
