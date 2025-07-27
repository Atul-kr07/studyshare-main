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
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
  rating: number;
  tags: string[];
  size?: number;
  uploaderName?: string;
};

export type User = {
  id: string;
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
          const userResources = resources.filter((r: Resource) => String(r.uploadedBy) === String(user.id));
          console.log('All resources:', resources);
          console.log('User ID:', user.id, 'Type:', typeof user.id);
          console.log('User resources:', userResources);
          console.log('Resource uploadedBy values:', resources.map(r => ({ 
            id: r.id, 
            uploadedBy: r.uploadedBy, 
            type: typeof r.uploadedBy,
            comparison: String(r.uploadedBy) === String(user.id)
          })));
          console.log('Filtering details:');
          resources.forEach((r, index) => {
            console.log(`Resource ${index}: uploadedBy="${r.uploadedBy}" (${typeof r.uploadedBy}) vs user.id="${user.id}" (${typeof user.id}) = ${String(r.uploadedBy) === String(user.id)}`);
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