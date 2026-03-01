import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Sun, Monitor, Trash2 } from 'lucide-react';

const SettingsView = ({ userProfile, setUserProfile, setNotifications, theme, setTheme }) => {
    const [formState, setFormState] = useState({ ...userProfile });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setUserProfile(formState);
        setNotifications(prev => [{
            id: Date.now().toString() + '-settings',
            type: 'success',
            title: 'Settings Saved',
            message: 'Your profile and preferences have been updated successfully.',
            time: 'Just now',
            read: false
        }, ...prev]);
    };

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Manage your account settings and workspace preferences.</p>
            </div>

            <div className="flex-col gap-6">
                {/* Profile Section */}
                <div className="saas-card" style={{ padding: '2rem' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px' }}>
                            <User size={20} color="var(--accent-indigo)" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Public Profile</h3>
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-6">
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'var(--accent-gradient)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2rem',
                                fontWeight: 700
                            }}>
                                {formState.name[0]}
                            </div>
                            <div className="flex-col gap-2">
                                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Change Avatar</button>
                                <button className="btn-ghost" style={{ fontSize: '0.85rem' }}>Remove</button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="flex-col gap-2">
                                <label className="input-label" style={{ fontWeight: 600 }}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="input-base"
                                    value={formState.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="flex-col gap-2">
                                <label className="input-label" style={{ fontWeight: 600 }}>Role</label>
                                <input
                                    type="text"
                                    name="role"
                                    className="input-base"
                                    value={formState.role}
                                    disabled
                                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                />
                            </div>
                        </div>

                        <div className="flex-col gap-2">
                            <label className="input-label" style={{ fontWeight: 600 }}>Bio</label>
                            <textarea
                                name="bio"
                                className="input-base"
                                rows="3"
                                value={formState.bio}
                                onChange={handleChange}
                                placeholder="A brief description about yourself"
                                style={{ resize: 'vertical', minHeight: '100px' }}
                            ></textarea>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>This will be displayed on your public profile.</p>
                        </div>
                    </div>
                </div>

                {/* Theme & Visuals Section */}
                <div className="saas-card" style={{ padding: '2rem' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}>
                            <Sun size={20} color="var(--accent-blue)" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Appearance</h3>
                    </div>

                    <div className="flex items-center justify-between" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Theme Mode</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Switch between light and dark modes.</div>
                        </div>
                        <div className="flex gap-2 p-1" style={{ background: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--panel-border)' }}>
                            <button
                                onClick={() => setTheme('light')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: theme === 'light' ? 'var(--card-bg)' : 'transparent',
                                    color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none'
                                }}
                            >
                                <Sun size={16} /> Light
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: theme === 'dark' ? 'var(--card-bg)' : 'transparent',
                                    color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    boxShadow: theme === 'dark' ? 'var(--shadow-sm)' : 'none'
                                }}
                            >
                                <Moon size={16} /> Dark
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="saas-card" style={{ padding: '2rem' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px' }}>
                            <Bell size={20} color="var(--success-color)" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Notifications</h3>
                    </div>

                    <div className="flex-col gap-4">
                        {[
                            { label: 'Project Updates', desc: 'Receive alerts when milestones are reached or recalculated.', defaultChecked: true },
                            { label: 'Task Assignments', desc: 'Notify me when I am assigned to a new task.', defaultChecked: true },
                            { label: 'Team Activity', desc: 'Summaries of team chat and comments.', defaultChecked: false }
                        ].map((pref, i) => (
                            <div key={i} className="flex items-center justify-between" style={{ padding: '0.5rem 0' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{pref.label}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pref.desc}</div>
                                </div>
                                <div style={{
                                    width: '44px',
                                    height: '24px',
                                    background: pref.defaultChecked ? 'var(--accent-indigo)' : 'var(--panel-border)',
                                    borderRadius: '12px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '2px',
                                        left: pref.defaultChecked ? '22px' : '2px',
                                        width: '20px',
                                        height: '20px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        transition: 'all 0.3s ease'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="saas-card" style={{ padding: '2rem', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px' }}>
                            <Shield size={20} color="var(--danger-color)" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger-color)' }}>Danger Zone</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Deleting your account is permanent and cannot be undoneAll project data will be lost.</p>
                    <button className="btn btn-secondary" style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}>
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>

                <div className="flex justify-end gap-3" style={{ marginTop: '1rem' }}>
                    <button className="btn-secondary">Discard Changes</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
