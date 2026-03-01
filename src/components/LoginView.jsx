import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginView = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load saved email on mount
    React.useEffect(() => {
        const savedEmail = localStorage.getItem('c2c_saved_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (isRegistering && name.trim().length < 2) {
            setError('Please enter your full name.');
            return;
        }

        setIsLoading(true);

        // Simulate a network request
        setTimeout(() => {
            setIsLoading(false);

            if (rememberMe) {
                localStorage.setItem('c2c_saved_email', email);
            } else {
                localStorage.removeItem('c2c_saved_email');
            }

            // Pass a mock user object back up to App.jsx based on the email
            const defaultName = email.split('@')[0];
            const capitalizedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
            onLogin({ email, name: isRegistering ? name : capitalizedName });
        }, 1500);
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', width: '100%', padding: '2rem' }}>
            <div className="glass-panel fade-in animate-glow" style={{ width: '100%', maxWidth: '450px', padding: '3rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.3)' }}>

                {/* Decorative background glow */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-gradient)', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.3, zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--accent-purple)', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.2, zIndex: 0 }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div className="flex justify-center" style={{ marginBottom: '1rem' }}>
                            <div className="animate-float" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <ShieldCheck size={32} className="text-gradient" />
                            </div>
                        </div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to C2C</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {isRegistering ? 'Create an account to save your roadmaps.' : 'Sign in to access your execution plans.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-col gap-4">
                        {isRegistering && (
                            <div className="fade-in">
                                <label className="input-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <ShieldCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="text"
                                        className="input-base"
                                        placeholder="Jane Doe"
                                        style={{ paddingLeft: '2.8rem' }}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={isRegistering}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="input-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="email"
                                    className="input-base"
                                    placeholder="builder@example.com"
                                    style={{ paddingLeft: '2.8rem' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label flex justify-between">
                                Password
                                {!isRegistering && <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', cursor: 'pointer' }}>Forgot?</span>}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="password"
                                    className="input-base"
                                    placeholder="••••••••"
                                    style={{ paddingLeft: '2.8rem' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {!isRegistering && (
                            <div className="flex items-center gap-2" style={{ marginTop: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{ cursor: 'pointer', accentColor: 'var(--accent-purple)' }}
                                />
                                <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    Remember me
                                </label>
                            </div>
                        )}

                        {error && (
                            <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : (isRegistering ? 'Create Account' : 'Sign In')} {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                        <span
                            onClick={() => setIsRegistering(!isRegistering)}
                            style={{ color: 'var(--text-primary)', fontWeight: 'bold', cursor: 'pointer', transition: 'color 0.2s' }}
                            className="hover-text-gradient"
                        >
                            {isRegistering ? 'Sign In' : 'Register Now'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
