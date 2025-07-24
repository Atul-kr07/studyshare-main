import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Star, Calendar, User, Share2, BookOpen } from 'lucide-react';
import { Resource, User as UserType } from '../App';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

interface ResourceDetailProps {
  resource: Resource;
  onBack: () => void;
  user: UserType | null;
  onAuthClick: () => void;
}

export function ResourceDetail({ resource, onBack, user, onAuthClick }: ResourceDetailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Always use uploaderName from resource if available
  const uploaderName = resource.uploaderName || 'Unknown';

  useEffect(() => {
    if (resource.fileType === 'PDF' && resource.fileUrl && canvasRef.current) {
      const renderPDF = async () => {
        try {
          const loadingTask = pdfjsLib.getDocument(resource.fileUrl);
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = canvasRef.current;
          if (!canvas) return;
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
        } catch {
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.font = '16px sans-serif';
              ctx.fillText('Failed to render PDF preview.', 10, 50);
            }
          }
        }
      };
      renderPDF();
    }
  }, [resource.fileType, resource.fileUrl]);

  const handleDownload = () => {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    }
  };

  const handleShare = () => {
    // Copy resource URL to clipboard
    const url = `${window.location.origin}/resource/${resource.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Resource link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Resource link copied to clipboard!');
    });
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{resource.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{resource.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              resource.fileType === 'PDF' ? 'bg-red-100 text-red-600' :
              resource.fileType === 'DOC' ? 'bg-blue-100 text-blue-600' :
              resource.fileType === 'PPT' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {resource.fileType}
            </span>
          </div>

          {/* File Preview */}
          {resource.fileUrl && (
            <div className="mb-8">
              {resource.fileType === 'PDF' ? (
                <div>
                  <canvas ref={canvasRef} style={{ width: '100%', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <div className="text-xs text-gray-500 mt-2">PDF preview (first page only)</div>
                </div>
              ) : (
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View/Download File
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Category</span>
              </div>
              <p className="text-gray-600">{resource.category}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Uploaded by</span>
              </div>
              <p className="text-gray-600 mt-2">{uploaderName}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Upload Date</span>
              </div>
              <p className="text-gray-600">{new Date(resource.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">{resource.downloads} downloads</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              {user && resource.fileUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
          </div>

          {resource.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!user && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Sign in to Download</h3>
          <p className="text-blue-700 mb-4">Create a free account to download this resource and access thousands more.</p>
          <button 
            onClick={onAuthClick}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </button>
        </div>
      )}
    </div>
  );
}