import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:4000/api/auth/google';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Sign in to StudyShare</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 flex flex-col items-center">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg py-3 px-4 font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48"><g><path d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.5-4z" fill="#FFC107"/><path d="M6.3 14.7l7 5.1C15.5 16.2 19.4 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z" fill="#FF3D00"/><path d="M24 45c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.4C29.7 36.1 27 37 24 37c-5.7 0-10.6-3.7-12.3-8.9l-7 5.4C6.6 41.1 14.6 45 24 45z" fill="#4CAF50"/><path d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-4.5 0-8.2-3.7-8.2-8.2 0-1.3.3-2.5.8-3.5l-7-5.4C7.2 17.7 7 20.8 7 24c0 3.2.2 6.3.7 9.3l7-5.4C15.5 31.8 19.4 35 24 35c2.7 0 5.2-.9 7.2-2.4l6.4 6.4C34.1 42.9 29.3 45 24 45z" fill="#1976D2"/></g></svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}