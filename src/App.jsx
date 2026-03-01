import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Layout from './components/Layout';
import IdeationForm from './components/IdeationForm';
import RoadmapView from './components/RoadmapView';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import SettingsView from './components/SettingsView';
import TeamChat from './components/TeamChat';
import { generateRoadmap } from './utils/mockDataEngine';
import { generateAiRoadmap } from './utils/aiDataEngine';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('c2c_auth');
    return saved ? JSON.parse(saved) : false;
  });

  const [roadmaps, setRoadmaps] = useState(() => {
    const saved = localStorage.getItem('c2c_roadmaps');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard, ideation, roadmap
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('c2c_theme') || 'dark';
  });

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('c2c_theme', theme);
  }, [theme]);

  // Check for Shared Roadmap Links on Mount
  useEffect(() => {
    const handleSharedLink = async () => {
      const query = new URLSearchParams(window.location.search);
      const shareId = query.get('share');
      if (shareId && isAuthenticated) {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
          const response = await fetch(`${backendUrl}/api/shared-roadmap/${shareId}`);
          if (response.ok) {
            const data = await response.json();
            const sharedRoadmap = data.roadmap;

            // Check if user is already a member, if not, join them!
            if (sharedRoadmap.teamMembers && !sharedRoadmap.teamMembers.includes(userProfile.name)) {
              try {
                const joinResponse = await fetch(`${backendUrl}/api/shared-roadmap/${shareId}/join`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: userProfile.name })
                });
                if (joinResponse.ok) {
                  const joinData = await joinResponse.json();
                  sharedRoadmap.teamMembers = joinData.teamMembers;
                }
              } catch (joinErr) {
                console.error("Failed to join roadmap:", joinErr);
              }
            }

            // Replace existing instance if already cached locally, else push to top
            setRoadmaps(prev => {
              const existingIndex = prev.findIndex(r => r.id === sharedRoadmap.id);
              if (existingIndex !== -1) {
                const newRoadmaps = [...prev];
                newRoadmaps[existingIndex] = sharedRoadmap;
                return newRoadmaps;
              }
              return [sharedRoadmap, ...prev];
            });

            setActiveRoadmapId(sharedRoadmap.id);
            setView('roadmap');

            // Notification
            setNotifications(prev => [{
              id: Date.now().toString() + '-join',
              type: 'system',
              title: 'Joined Shared Roadmap',
              message: `You successfully joined the ${sharedRoadmap.ideaName} project.`,
              time: 'Just now',
              read: false
            }, ...prev]);

          } else {
            setNotifications(prev => [{
              id: Date.now().toString() + '-join-err',
              type: 'error',
              title: 'Invalid Link',
              message: "The shared roadmap link is invalid or has expired.",
              time: 'Just now',
              read: false
            }, ...prev]);
          }
        } catch (error) {
          console.error("Failed to load shared roadmap:", error);
        } finally {
          // Clean the URL so it doesn't infinite loop on refresh
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleSharedLink();
  }, [isAuthenticated]); // Rerun if they log in through the gated screen

  // Global Shell State
  const [searchQuery, setSearchQuery] = useState('');

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('c2c_profile');
    return saved ? JSON.parse(saved) : { name: 'Builder', bio: 'Building the next big thing.', theme: 'System Default', timezone: 'UTC' };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('c2c_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 'welcome', type: 'system', title: 'Welcome to C2C', message: 'Your Execution platform is ready.', time: 'Just now', read: false }
    ];
  });

  const [dashboardNotes, setDashboardNotes] = useState(() => {
    const saved = localStorage.getItem('c2c_notes');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Filter out notes older than 24 hours (86400000 ms)
      const oneDayAgo = Date.now() - 86400000;
      return parsed.filter(note => note.timestamp > oneDayAgo);
    }
    return [];
  });

  // Ensure current local user gets admin role
  useEffect(() => {
    if (userProfile && !userProfile.role) {
      setUserProfile(prev => ({ ...prev, role: 'admin' }));
    }
  }, []);

  // Save to LocalStorage whenever these state pieces change
  useEffect(() => {
    localStorage.setItem('c2c_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('c2c_roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  useEffect(() => {
    localStorage.setItem('c2c_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('c2c_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('c2c_notes', JSON.stringify(dashboardNotes));
  }, [dashboardNotes]);

  // Global Real-Time Synchronization Socket
  useEffect(() => {
    if (!isAuthenticated || roadmaps.length === 0) return;

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const socket = io(backendUrl);

    // Subscribe to all local roadmaps
    roadmaps.forEach(r => {
      socket.emit('join_roadmap', r.id);
    });

    socket.on('roadmap_updated', (updatedRoadmap) => {
      setRoadmaps(prev => {
        const existing = prev.find(r => r.id === updatedRoadmap.id);
        // Only trigger React state update if the data actually changed
        if (existing && JSON.stringify(existing) !== JSON.stringify(updatedRoadmap)) {
          return prev.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r);
        }
        return prev;
      });
    });

    return () => socket.disconnect();
  }, [isAuthenticated, roadmaps.length]); // Re-bind socket when a new project is created or deleted

  // Find the exact active roadmap object (if any)
  const activeRoadmap = roadmaps.find(r => r.id === activeRoadmapId);

  const handleIdeaSubmit = async (formData) => {
    setIsGenerating(true);
    let generated;

    const enrichedFormData = {
      ...formData,
      creatorName: userProfile.name
    };

    try {
      // Attempt generative AI real-time payload via secure backend
      generated = await generateAiRoadmap(enrichedFormData);

      setNotifications(prev => [{
        id: Date.now().toString() + '-ai-notif',
        type: 'success',
        title: 'AI Roadmap Generated',
        message: `Your custom AI plan for "${formData.ideaName || formData.idea}" has been structured.`,
        time: 'Just now',
        read: false
      }, ...prev]);

    } catch (error) {
      console.error("AI Generation Error: falling back to mock engine", error);
      generated = generateRoadmap(enrichedFormData);
      generated.id = Date.now().toString();

      setNotifications(prev => [{
        id: Date.now().toString() + '-error-notif',
        type: 'error',
        title: 'AI Roadmap Failed',
        message: `There was an issue contacting Gemini. Falling back to the generic offline engine.`,
        time: 'Just now',
        read: false
      }, ...prev]);
    }

    setRoadmaps(prev => [generated, ...prev]);
    setActiveRoadmapId(generated.id);
    setView('roadmap');
    setIsGenerating(false);
  };

  const handleUpdateRoadmap = (updatedRoadmap) => {
    setRoadmaps(prev => prev.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r));
  };

  const handleOpenRoadmap = (id) => {
    setActiveRoadmapId(id);
    setView('roadmap');
  };

  const handleDeleteRoadmap = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setRoadmaps(prev => prev.filter(r => r.id !== id));
      if (activeRoadmapId === id) {
        setActiveRoadmapId(null);
        setView('dashboard');
      }
      setNotifications(prev => [{
        id: Date.now().toString() + '-delete',
        type: 'system',
        title: 'Project Deleted',
        message: 'The project was successfully removed.',
        time: 'Just now',
        read: false
      }, ...prev]);
    }
  };

  // Calculate totals across all roadmaps
  const totalIdeas = roadmaps.length;
  const activeCount = roadmaps.filter(r => r.milestones.some(m => m.progress < 100)).length;
  const completedTasks = roadmaps.reduce((total, r) => {
    return total + r.milestones.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0);
  }, 0);

  if (!isAuthenticated) {
    return <LoginView onLogin={(user) => {
      setIsAuthenticated(true);
      if (user) {
        setUserProfile(prev => ({ ...prev, name: user.name, email: user.email }));
      }
    }} />;
  }

  return (
    <Layout
      view={view}
      setView={setView}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      userProfile={userProfile}
      notifications={notifications}
      setNotifications={setNotifications}
      onLogout={() => setIsAuthenticated(false)}
      activeRoadmap={activeRoadmap}
      roadmaps={roadmaps}
      theme={theme}
      setTheme={setTheme}
    >
      <div className="dashboard-content" style={{ paddingBottom: '4rem', animation: 'fadeIn 0.5s ease-out' }}>
        {view === 'dashboard' && (
          <DashboardView
            roadmaps={roadmaps}
            activeRoadmap={activeRoadmap}
            setView={setView}
            handleOpenRoadmap={handleOpenRoadmap}
            handleDeleteRoadmap={handleDeleteRoadmap}
            handleUpdateRoadmap={handleUpdateRoadmap}
            searchQuery={searchQuery}
            dashboardNotes={dashboardNotes}
            setDashboardNotes={setDashboardNotes}
            userProfile={userProfile}
          />
        )}

        {view === 'ideation' && (
          <div className="fade-in">
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>Start your journey</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>Define an objective to build an execution plan.</p>
            <IdeationForm onSubmit={handleIdeaSubmit} isGenerating={isGenerating} />
          </div>
        )}

        {view === 'roadmap' && activeRoadmap ? (
          <div className="fade-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem', maxWidth: '900px', margin: '0 auto 2rem' }}>
              <h1 style={{ fontSize: '2.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{activeRoadmap.ideaName}</h1>
              <button className="btn btn-secondary" onClick={() => setView('ideation')}>Start New Idea</button>
            </div>
            <RoadmapView roadmap={activeRoadmap} onUpdate={handleUpdateRoadmap} setNotifications={setNotifications} />
          </div>
        ) : (view === 'roadmap' && !activeRoadmap && (
          <div className="fade-in">
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>Execution Roadmaps</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>You don't have any active roadmaps selected.</p>
            <button className="btn btn-primary" onClick={() => setView('dashboard')}>View Dashboard</button>
          </div>
        ))}

        {view === 'settings' && (
          <SettingsView
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            setNotifications={setNotifications}
            theme={theme}
            setTheme={setTheme}
          />
        )}

        {view === 'team_chat' && (
          <TeamChat activeRoadmap={activeRoadmap} userProfile={userProfile} />
        )}
      </div>
    </Layout>
  );
}

export default App;
