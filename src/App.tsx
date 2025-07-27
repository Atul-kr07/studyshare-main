import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { UploadModal } from './components/UploadModal';
import { ResourceDetail } from './components/ResourceDetail';
import { UserProfile } from './components/UserProfile';
import { useAuth } from './hooks/useAuth';
import { useResources } from './hooks/useResources';

export type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileUrl: string;
  uploadedBy: string | { toString(): string };
  uploadedAt: string;
  downloads: number;
  rating: number;
  tags: string[];
  size?: number;
  uploaderName?: string;
};

export type User = {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  college: string;
  avatar?: string;
  phone?: string;
  degree_year?: string;
  about?: string;
};

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'resource' | 'profile'>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  const { user, logout } = useAuth();
  const { resources, uploadResource } = useResources();

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    setCurrentView('resource');
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onUploadClick={() => setShowUploadModal(true)}
        onLogout={handleLogout}
        onDashboardClick={() => setCurrentView('dashboard')}
        onProfileClick={() => setCurrentView('profile')}
        onHomeClick={() => setCurrentView('home')}
      />

      {currentView === 'home' && (
        <Hero 
          onGetStarted={() => user ? setCurrentView('dashboard') : setShowAuthModal(true)}
          onExplore={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard 
          resources={resources}
          onResourceSelect={handleResourceSelect}
        />
      )}

      {currentView === 'resource' && selectedResource && (
        <ResourceDetail 
          resource={selectedResource}
          onBack={() => setCurrentView('dashboard')}
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
        />
      )}

      {currentView === 'profile' && user && (
        (() => {
          console.log('Complete user object:', user);
          console.log('User object keys:', Object.keys(user));
          // Use _id instead of id (MongoDB ObjectId)
          const userId = user._id || user.id;
          console.log('User ID to use:', userId);
          const userResources = resources.filter((r: Resource) => {
            // Handle ObjectId comparison properly
            const resourceUserId = typeof r.uploadedBy === 'object' ? r.uploadedBy.toString() : String(r.uploadedBy);
            const currentUserId = String(userId);
            return resourceUserId === currentUserId;
          });
          console.log('All resources:', resources);
          console.log('User ID:', userId, 'Type:', typeof userId);
          console.log('User resources:', userResources);
          console.log('Resource uploadedBy values:', resources.map(r => ({ 
            id: r.id, 
            uploadedBy: r.uploadedBy, 
            type: typeof r.uploadedBy,
            comparison: (typeof r.uploadedBy === 'object' ? r.uploadedBy.toString() : String(r.uploadedBy)) === String(userId)
          })));
          console.log('Filtering details:');
          resources.forEach((r, index) => {
            const resourceUserId = typeof r.uploadedBy === 'object' ? r.uploadedBy.toString() : String(r.uploadedBy);
            const currentUserId = String(userId);
            console.log(`Resource ${index}: uploadedBy="${resourceUserId}" (${typeof r.uploadedBy}) vs userId="${currentUserId}" (${typeof userId}) = ${resourceUserId === currentUserId}`);
          });
          return (
            <UserProfile 
              user={user}
              resources={userResources}
              onResourceSelect={handleResourceSelect}
              onBack={() => setCurrentView('dashboard')}
            />
          );
        })()
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showUploadModal && user && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          onUpload={uploadResource}
          user={user}
        />
      )}
    </div>
  );
}

export default App;