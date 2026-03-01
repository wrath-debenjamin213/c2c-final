import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, view, setView, searchQuery, setSearchQuery, userProfile, notifications, setNotifications, onLogout, activeRoadmap, roadmaps, theme, setTheme }) => {
    return (
        <div className="app-container flex">
            <Sidebar view={view} setView={setView} onLogout={onLogout} roadmaps={roadmaps} userProfile={userProfile} theme={theme} setTheme={setTheme} />
            <div className="main-wrapper flex-col" style={{ flex: 1, width: '100%' }}>
                <Header setView={setView} searchQuery={searchQuery} setSearchQuery={setSearchQuery} userProfile={userProfile} notifications={notifications} setNotifications={setNotifications} activeRoadmap={activeRoadmap} />
                <main className="content-area" style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
