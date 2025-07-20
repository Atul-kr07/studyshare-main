import React, { useState } from 'react';
import { Search, Filter, Download, Star, Calendar, User } from 'lucide-react';
import { Resource } from '../App';
import { useAuth } from '../hooks/useAuth';

interface DashboardProps {
  resources: Resource[];
  onResourceSelect: (resource: Resource) => void;
}

const categories = [
  'All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 
  'Biology', 'Engineering', 'Business', 'Literature', 'History'
];

const fileTypes = ['All', 'PDF', 'DOC', 'PPT', 'XLS', 'TXT'];

export function Dashboard({ resources, onResourceSelect }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFileType, setSelectedFileType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    const matchesFileType = selectedFileType === 'All' || resource.fileType === selectedFileType;
    
    return matchesSearch && matchesCategory && matchesFileType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Resources</h1>
        <p className="text-gray-600">Discover and share knowledge with your peers</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search resources, topics, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">File Type</label>
                <div className="flex flex-wrap gap-2">
                  {fileTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedFileType(type)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedFileType === type
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <div
            key={resource.id}
            onClick={() => onResourceSelect(resource)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {resource.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  resource.fileType === 'PDF' ? 'bg-red-100 text-red-600' :
                  resource.fileType === 'DOC' ? 'bg-blue-100 text-blue-600' :
                  resource.fileType === 'PPT' ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {resource.fileType}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{resource.uploaderName || (user && String(resource.uploadedBy) === String(user.id) ? user.name : 'Unknown')}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(resource.uploadedAt).toLocaleDateString()}</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                  {resource.category}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {resource.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
}