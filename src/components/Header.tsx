import React from 'react';
import { BookOpen, Upload, User, LogOut, Layout } from 'lucide-react';
import { User as UserType } from '../App';

interface HeaderProps {
  user: UserType | null;
  onAuthClick: () => void;
  onUploadClick: () => void;
  onLogout: () => void;
  onDashboardClick: () => void;
  onProfileClick: () => void;
  onHomeClick: () => void;
}

export function Header({ 
  user, 
  onAuthClick, 
  onUploadClick, 
  onLogout,
  onDashboardClick,
  onProfileClick,
  onHomeClick
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={onHomeClick}
          >
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                StudyShare
              </h1>
              <p className="text-xs text-gray-500">Academic Resources</p>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={onDashboardClick}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Layout className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                
                <button
                  onClick={onUploadClick}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </button>

                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="hidden sm:inline text-gray-700">{user.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button
                      onClick={onProfileClick}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 rounded-t-lg"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-red-600 rounded-b-lg"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                Get Started
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}