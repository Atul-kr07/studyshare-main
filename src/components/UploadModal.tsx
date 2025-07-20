import React, { useState } from 'react';
import { X, File } from 'lucide-react';
import { User, Resource } from '../App';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onUpload: (resourceData: Omit<Resource, 'id'>) => Promise<boolean>;
  user: User;
}

const categories = [
  'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 
  'Biology', 'Engineering', 'Business', 'Literature', 'History'
];

export function UploadModal({ onClose, onSuccess, onUpload, user }: UploadModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    fileType: 'PDF'
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Upload file to backend (Cloudinary)
      let fileUrl = '';
      if (file) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const res = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          body: uploadData,
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'File upload failed');
        fileUrl = data.url;
      } else {
        setError('Please select a file to upload.');
        setLoading(false);
        return;
      }

      // 2. Prepare resource data
      const resourceData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString(),
        downloads: 0,
        rating: 0,
        fileUrl,
        college: user.college
      };

      // 3. Call your uploadResource function (save to DB)
      const success = await onUpload(resourceData);
      if (success) {
        onSuccess();
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch {
      setError('An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Resource</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter resource title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
              placeholder="Describe your resource..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
            <select
              required
              value={formData.fileType}
              onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PDF">PDF</option>
              <option value="DOC">Document</option>
              <option value="PPT">Presentation</option>
              <option value="XLS">Spreadsheet</option>
              <option value="TXT">Text File</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tags separated by commas"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
            <input
              type="file"
              required
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </form>
      </div>
    </div>
  );
}