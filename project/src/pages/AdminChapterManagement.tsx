import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, Lock, Unlock, Eye, Edit } from 'lucide-react';

interface Chapter {
  id: number;
  title: string;
  description: string;
  chapter_number: number;
  is_released: boolean;
  release_date: string | null;
  book_title: string;
  subject_name: string;
  grade_name: string;
  topic_count: number;
  activity_count: number;
}

const AdminChapterManagement: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/educational/admin/chapters', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setChapters(data.chapters);
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseChapter = async () => {
    if (!selectedChapter || !releaseDate || !releaseNotes) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/educational/admin/release-chapter', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId: selectedChapter.id,
          releaseDate,
          releaseNotes
        })
      });

      if (response.ok) {
        setShowReleaseModal(false);
        setSelectedChapter(null);
        setReleaseDate('');
        setReleaseNotes('');
        fetchChapters(); // Refresh the list
        alert('Chapter released successfully!');
      } else {
        alert('Failed to release chapter');
      }
    } catch (err) {
      console.error('Error releasing chapter:', err);
      alert('Error releasing chapter');
    }
  };

  const openReleaseModal = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setShowReleaseModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Chapter Management
        </h1>
        <p className="text-gray-600">
          Manage chapter releases and monitor educational content structure
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Chapters</p>
              <p className="text-2xl font-bold">{chapters.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Unlock className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Released</p>
              <p className="text-2xl font-bold">
                {chapters.filter(c => c.is_released).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Lock className="w-8 h-8 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Locked</p>
              <p className="text-2xl font-bold">
                {chapters.filter(c => !c.is_released).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold">
                {chapters.reduce((sum, c) => sum + c.activity_count, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Chapters</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chapter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Release Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chapters.map((chapter) => (
                <motion.tr
                  key={chapter.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {chapter.book_title}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{chapter.subject_name}</div>
                    <div className="text-sm text-gray-500">{chapter.grade_name}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      chapter.is_released 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {chapter.is_released ? 'Released' : 'Locked'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{chapter.topic_count} topics</div>
                    <div>{chapter.activity_count} activities</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {chapter.release_date ? (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(chapter.release_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-500">Not released</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!chapter.is_released && (
                      <button
                        onClick={() => openReleaseModal(chapter)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors"
                      >
                        Release
                      </button>
                    )}
                    {chapter.is_released && (
                      <span className="text-green-600">Released</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Release Modal */}
      {showReleaseModal && selectedChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Release Chapter: {selectedChapter.title}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Release Date
                </label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Release Notes
                </label>
                <textarea
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about this release..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowReleaseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReleaseChapter}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Release Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChapterManagement; 