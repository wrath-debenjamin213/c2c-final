import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, MessageSquare, Users, Hash, Settings, Search, MoreVertical, LogOut } from 'lucide-react';

let socket;

const TeamChat = ({ activeRoadmap, userProfile }) => {
    const roadmapId = activeRoadmap?.id || 'general';
    const username = userProfile?.name || 'Builder';

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const members = activeRoadmap?.teamMembers || [username];
    const onlineStatus = members.map(m => ({
        name: m,
        online: Math.random() > 0.3,
        role: m === username ? 'You' : 'Member'
    }));

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        socket = io(backendUrl);

        socket.emit('join_roadmap', roadmapId);

        socket.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.disconnect();
        };
    }, [roadmapId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() !== '') {
            const messageData = {
                roadmapId,
                sender: username,
                text: input,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages((prev) => [...prev, messageData]);
            socket.emit('send_message', messageData);
            setInput('');
        }
    };

    return (
        <div className="saas-card overflow-hidden" style={{
            display: 'flex',
            height: '75vh',
            background: 'var(--card-bg)',
            border: '1px solid var(--panel-border)',
            borderRadius: '16px'
        }}>
            {/* Left Sidebar: Members List */}
            <div style={{
                width: '260px',
                borderRight: '1px solid var(--panel-border)',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255,255,255,0.01)'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Team Members</h3>
                    <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <div className="status-dot status-online" style={{ width: '6px', height: '6px' }} />
                        <span>{onlineStatus.filter(m => m.online).length} active now</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto" style={{ padding: '1rem' }}>
                    <div className="flex-col gap-1">
                        {onlineStatus.map((member, i) => (
                            <div key={i} className="flex items-center justify-between transition-all" style={{
                                padding: '0.6rem 0.75rem',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                background: member.name === username ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                            }}>
                                <div className="flex items-center gap-3">
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--panel-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)'
                                        }}>{member.name[0]}</div>
                                        {member.online && <div className="status-dot status-online" style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', border: '2px solid var(--card-bg)' }} />}
                                    </div>
                                    <div className="flex-col">
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{member.name}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{member.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'transparent' }}>
                {/* Chat Header */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--panel-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.01)'
                }}>
                    <div className="flex items-center gap-3">
                        <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                            <Hash size={18} color="var(--accent-indigo)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeRoadmap?.ideaName || 'General Discussion'}</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Project synchronization and team updates</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="btn-ghost" style={{ padding: '0.4rem' }}><Search size={18} /></button>
                        <button className="btn-ghost" style={{ padding: '0.4rem' }}><Settings size={18} /></button>
                    </div>
                </div>

                {/* Messages Feed */}
                <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                }}>
                    {messages.length === 0 ? (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.5,
                            textAlign: 'center'
                        }}>
                            <div style={{ padding: '1.5rem', background: 'var(--panel-border)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                <MessageSquare size={40} color="var(--text-secondary)" />
                            </div>
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No messages yet</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>Start the conversation by sending a message below.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isMe = msg.sender === username;
                            return (
                                <div key={index} className="flex gap-3" style={{
                                    flexDirection: isMe ? 'row-reverse' : 'row',
                                    alignItems: 'flex-start'
                                }}>
                                    {!isMe && (
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--panel-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            flexShrink: 0
                                        }}>{msg.sender[0]}</div>
                                    )}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '70%'
                                    }}>
                                        {!isMe && (
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', marginLeft: '4px' }}>
                                                {msg.sender}
                                            </div>
                                        )}
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '16px',
                                            background: isMe ? 'var(--accent-indigo)' : 'var(--panel-border)',
                                            color: isMe ? 'white' : 'var(--text-primary)',
                                            fontSize: '0.95rem',
                                            boxShadow: isMe ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none',
                                            borderBottomRightRadius: isMe ? '4px' : '16px',
                                            borderBottomLeftRadius: !isMe ? '4px' : '16px'
                                        }}>
                                            {msg.text}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', opacity: 0.7 }}>
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '1.25rem 1.5rem', background: 'transparent' }}>
                    <form onSubmit={sendMessage} className="flex items-center gap-3" style={{
                        background: 'var(--bg-color)',
                        padding: '0.5rem 0.5rem 0.5rem 1.25rem',
                        borderRadius: '12px',
                        border: '1px solid var(--panel-border)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Message ${activeRoadmap?.ideaName || 'Team'}...`}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="btn btn-primary"
                            style={{
                                width: '36px',
                                height: '36px',
                                padding: 0,
                                borderRadius: '8px',
                                flexShrink: 0
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TeamChat;
