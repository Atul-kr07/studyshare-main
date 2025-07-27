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
          // Try different possible ID fields
          const userId = user._id || user.id || (user as any)._id;
          console.log('User ID to use:', userId);
          
          // Expand the resources to see their full structure
          console.log('Full resource objects:', JSON.stringify(resources, null, 2));
          
          // Log each resource's uploadedBy field in detail
          resources.forEach((r, index) => {
            console.log(`Resource ${index} uploadedBy:`, r.uploadedBy);
            console.log(`Resource ${index} uploadedBy type:`, typeof r.uploadedBy);
            console.log(`Resource ${index} uploadedBy keys:`, r.uploadedBy && typeof r.uploadedBy === 'object' ? Object.keys(r.uploadedBy) : 'N/A');
          });
          
          const userResources = resources.filter((r: Resource) => {
            // Get the uploadedBy value as string
            let resourceUserId;
            if (typeof r.uploadedBy === 'object' && r.uploadedBy !== null) {
              // Handle MongoDB ObjectId properly
              const uploadedByObj = r.uploadedBy as any;
              if (uploadedByObj.$oid) {
                resourceUserId = uploadedByObj.$oid;
              } else if (uploadedByObj.toString) {
                resourceUserId = uploadedByObj.toString();
              } else {
                resourceUserId = String(uploadedByObj);
              }
            } else {
              resourceUserId = String(r.uploadedBy);
            }
            
            const currentUserId = String(userId);
            const matches = resourceUserId === currentUserId;
            console.log(`Comparing: resourceUserId="${resourceUserId}" vs currentUserId="${currentUserId}" = ${matches}`);
            return matches;
          });
          
          console.log('All resources:', resources);
          console.log('User ID:', userId, 'Type:', typeof userId);
          console.log('User resources:', userResources);
          
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