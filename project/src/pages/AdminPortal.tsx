import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  LogOut, Users, BookOpen, Settings, BarChart3, 
  MessageSquare, Upload, Plus, Edit, Trash2, 
  School, UserCheck, FileText, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import KodeitLogo from '../components/KodeitLogo';
import AnimatedButton from '../components/AnimatedButton';
import AudioButton from '../components/AudioButton';

// AddContentForm component
const AddContentForm: React.FC<{
  onClose: () => void;
  onSubmit: (content: any) => void;
  initialValues?: any;
}> = ({ onClose, onSubmit, initialValues }) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [type, setType] = useState(initialValues?.type || 'Math');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [status, setStatus] = useState(initialValues?.status || 'Draft');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialValues?.id || Date.now(),
      title,
      type,
      description,
      status,
      downloads: initialValues?.downloads || 0,
      file: file ? URL.createObjectURL(file) : initialValues?.file || null,
      thumbnail: thumbnail ? URL.createObjectURL(thumbnail) : initialValues?.thumbnail || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form
        className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md space-y-4 relative"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-2">Add New Content</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type/Category</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option>Math</option>
            <option>Puzzle</option>
            <option>Song</option>
            <option>Activity</option>
            <option>Game</option>
            <option>Task</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option>Draft</option>
            <option>Published</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload File (image, video, PDF, HTML)</label>
          <input
            type="file"
            accept="image/*,video/*,application/pdf,text/html"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail (optional, image only)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setThumbnail(e.target.files?.[0] || null)}
          />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
          >
            Add Content
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminPortal: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;
  const [activeTab, setActiveTab] = useState('overview');
  const [contentLibrary, setContentLibrary] = useState<any[]>([]);
  const [showAddContent, setShowAddContent] = useState(false);
  const [editContentId, setEditContentId] = useState<number | null>(null);
  const [editInitialValues, setEditInitialValues] = useState<any>(null);
  const API_URL = 'http://localhost:3000/api/content';

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await axios.get(API_URL);
      setContentLibrary(res.data);
    } catch (err) {
      console.error('Failed to fetch content:', err);
    }
  };

  const handleAddContent = async (content: any) => {
    try {
      const formData = new FormData();
      formData.append('title', content.title);
      formData.append('type', content.type);
      formData.append('description', content.description);
      formData.append('status', content.status);
      if (content.file instanceof File) formData.append('file', content.file);
      if (content.thumbnail instanceof File) formData.append('thumbnail', content.thumbnail);
      if (editContentId !== null) {
        // Edit
        await axios.put(`${API_URL}/${editContentId}`, content);
        setEditContentId(null);
        setEditInitialValues(null);
      } else {
        // Add
        await axios.post(API_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowAddContent(false);
      fetchContent();
    } catch (err) {
      alert('Failed to save content.');
      console.error(err);
    }
  };

  const handleEdit = (item: any) => {
    setEditContentId(item.id);
    setEditInitialValues(item);
    setShowAddContent(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchContent();
      } catch (err) {
        alert('Failed to delete content.');
      }
    }
  };

  // Mock data - in a real app, this would come from APIs
  const systemStats = {
    totalUsers: 1247,
    totalChildren: 892,
    totalTeachers: 45,
    totalSchools: 12,
    activeToday: 234,
    totalActivities: 156,
    completionRate: 78,
    avgSessionTime: 23 // minutes
  };

  const recentActivity = [
    { type: 'user_registration', message: 'New parent registered: Sarah Johnson', time: '2 hours ago' },
    { type: 'content_upload', message: 'New activity added to Literacy Hub', time: '4 hours ago' },
    { type: 'teacher_join', message: 'Teacher Maria Garcia joined Lincoln Elementary', time: '1 day ago' },
    { type: 'feedback', message: 'Parent feedback received: "Love the AR features!"', time: '1 day ago' }
  ];

  const schools = [
    { id: 1, name: 'Lincoln Elementary', teachers: 8, students: 156, status: 'Active' },
    { id: 2, name: 'Sunshine Preschool', teachers: 5, students: 89, status: 'Active' },
    { id: 3, name: 'Rainbow Academy', teachers: 12, students: 234, status: 'Active' },
    { id: 4, name: 'Little Learners', teachers: 3, students: 45, status: 'Pending' }
  ];

  const feedbackMessages = [
    {
      id: 1,
      parent: 'Sarah Johnson',
      message: 'My daughter Emma loves the AR features! She spends hours exploring.',
      rating: 5,
      date: '2024-01-15'
    },
    {
      id: 2,
      parent: 'Michael Smith',
      message: 'Great app but would love more math activities for older kids.',
      rating: 4,
      date: '2024-01-14'
    },
    {
      id: 3,
      parent: 'Jennifer Davis',
      message: 'The voice narration is perfect for my pre-reader. Thank you!',
      rating: 5,
      date: '2024-01-13'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{systemStats.totalUsers}</div>
          <p className="text-gray-600">Total Users</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{systemStats.totalChildren}</div>
          <p className="text-gray-600">Children</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <School className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{systemStats.totalTeachers}</div>
          <p className="text-gray-600">Teachers</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{systemStats.activeToday}</div>
          <p className="text-gray-600">Active Today</p>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Usage Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-bold text-green-600">{systemStats.completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${systemStats.completionRate}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Session Time</span>
              <span className="font-bold text-blue-600">{systemStats.avgSessionTime} min</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Activities</span>
              <span className="font-bold text-purple-600">{systemStats.totalActivities}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Content Library</h2>
        <AnimatedButton className="flex items-center space-x-2" onClick={() => { setShowAddContent(true); setEditContentId(null); setEditInitialValues(null); }}>
          <Plus className="h-4 w-4" />
          <span>Add Content</span>
        </AnimatedButton>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contentLibrary.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'Published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.downloads?.toLocaleString?.() ?? 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAddContent && (
        <AddContentForm
          onClose={() => { setShowAddContent(false); setEditContentId(null); setEditInitialValues(null); }}
          onSubmit={handleAddContent}
          initialValues={editInitialValues}
        />
      )}
    </div>
  );

  const renderSchoolManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">School Management</h2>
        <AnimatedButton className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add School</span>
        </AnimatedButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schools.map((school) => (
          <div key={school.id} className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{school.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  school.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {school.status}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="text-indigo-600 hover:text-indigo-900">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{school.teachers}</div>
                <p className="text-sm text-gray-600">Teachers</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{school.students}</div>
                <p className="text-sm text-gray-600">Students</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Parent Feedback</h2>
      
      <div className="space-y-4">
        {feedbackMessages.map((feedback) => (
          <div key={feedback.id} className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800">{feedback.parent}</h3>
                <p className="text-sm text-gray-600">{feedback.date}</p>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-lg ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-700">{feedback.message}</p>
            <div className="mt-4 flex space-x-2">
              <AnimatedButton variant="secondary" size="sm">
                Reply
              </AnimatedButton>
              <AnimatedButton variant="primary" size="sm">
                Mark as Resolved
              </AnimatedButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'content', label: 'Content', icon: BookOpen },
    { id: 'schools', label: 'Schools', icon: School },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100">
      <AudioButton />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <KodeitLogo size="md" />
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Admin: {user.name}</span>
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </AnimatedButton>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white rounded-2xl p-1 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'content' && renderContentManagement()}
          {activeTab === 'schools' && renderSchoolManagement()}
          {activeTab === 'feedback' && renderFeedback()}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">System Settings</h3>
              <p className="text-gray-600">Advanced configuration options coming soon...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPortal;