import React, { useState } from 'react';
import { ArrowLeft, User, Mail, GraduationCap, BookOpen, Download, File, Trash2 } from 'lucide-react';
import { User as UserType, Resource } from '../App';

interface UserProfileProps {
  user: UserType;
  resources: Resource[];
  onResourceSelect: (resource: Resource) => void;
  onBack: () => void;
}

export function UserProfile({ user, resources, onResourceSelect, onBack }: UserProfileProps) {
  const totalDownloads = resources.reduce((sum, resource) => sum + resource.downloads, 0);
  // Calculate total uploads size (in MB)
  const totalUploadsSizeMB = resources.reduce((sum, resource) => sum + (resource.size || 0), 0) / (1024 * 1024);
  const [myResources, setMyResources] = useState(resources);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:4000/api/resources/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setMyResources(myResources.filter(r => String(r.id) !== String(id)));
      } else {
        alert('Failed to delete resource.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <div className="flex items-center space-x-2 text-gray-700 mt-2">
                <Mail className="h-4 w-4" />
                <span className="font-semibold">Email:</span>
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{resources.length}</div>
              <div className="text-sm text-blue-700">Resources Shared</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{totalDownloads}</div>
              <div className="text-sm text-green-700">Total Downloads</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <File className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{totalUploadsSizeMB.toFixed(2)} MB</div>
              <div className="text-sm text-purple-700">Total Uploads Size</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">My Resources</h2>
        </div>
        
        <div className="p-6">
          {myResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myResources.map(resource => (
                <div
                  key={resource.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors relative"
                >
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-50 hover:bg-red-100 transition-colors"
                    disabled={deletingId === String(resource.id)}
                    title="Delete Resource"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div onClick={() => onResourceSelect(resource)} className="cursor-pointer">
                    <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{resource.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded">{resource.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
              <p className="text-gray-500">Start sharing your knowledge with the community!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}