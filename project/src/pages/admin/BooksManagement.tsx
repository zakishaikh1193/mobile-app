import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, Filter, BookOpen, GraduationCap,
  ArrowLeft, School, X, Check, Eye, EyeOff
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '../../components/AnimatedButton';
import AudioButton from '../../components/AudioButton';

interface Book {
  id: number;
  title: string;
  description: string;
  cover_image?: string;
  order_number: number;
  is_active: boolean;
  academic_year: string;
  created_at: string;
  updated_at: string;
  grade_id: number;
  grade_name: string;
}

interface Grade {
  id: number;
  name: string;
  description: string;
  academic_year: string;
}

const BooksManagement: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade_id: '',
    order_number: 1,
    academic_year: '2024-2025',
    is_active: true
  });

  useEffect(() => {
    fetchBooks();
    fetchGrades();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/education/books');
      // The API returns { success: true, books: [...] }
      setBooks(response.data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]); // Ensure books is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await api.get('/education/grades');
      // The API returns { success: true, grades: [...] }
      setGrades(response.data.grades || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setGrades([]); // Ensure grades is always an array
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingBook) {
        await api.put(`/education/books/${editingBook.id}`, formData);
      } else {
        await api.post('/education/books', formData);
      }
      
      fetchBooks();
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await api.delete(`/education/books/${id}`);
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      description: book.description,
      grade_id: book.grade_id.toString(),
      order_number: book.order_number,
      academic_year: book.academic_year,
      is_active: book.is_active
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      grade_id: '',
      order_number: 1,
      academic_year: '2024-2025',
      is_active: true
    });
  };

  const filteredBooks = (Array.isArray(books) ? books : []).filter(book => {
    const matchesSearch = book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade ? book?.grade_id === selectedGrade : true;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100">
      <AudioButton />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </AnimatedButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Books Management</h1>
                <p className="text-gray-600">Manage educational books by grade</p>
              </div>
            </div>
            <AnimatedButton
              variant="primary"
              onClick={() => {
                setEditingBook(null);
                resetForm();
                setShowAddForm(true);
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Book</span>
            </AnimatedButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedGrade || ''}
              onChange={(e) => setSelectedGrade(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade.id} value={grade.id}>{grade.name}</option>
              ))}
            </select>
            <AnimatedButton variant="secondary" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </AnimatedButton>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : filteredBooks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Books Found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first book</p>
              <AnimatedButton
                variant="primary"
                onClick={() => {
                  setEditingBook(null);
                  resetForm();
                  setShowAddForm(true);
                }}
              >
                Add First Book
              </AnimatedButton>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.grade_name}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    book.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {book.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">{book.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Order: {book.order_number}</span>
                  <span className="text-sm text-gray-500">{book.academic_year}</span>
                </div>
                
                <div className="flex space-x-2">
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(book)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </AnimatedButton>
                                     <AnimatedButton 
                     variant="secondary" 
                     onClick={() => handleDelete(book.id)}
                     className="text-red-600 hover:text-red-700"
                   >
                     <Trash2 className="h-4 w-4" />
                   </AnimatedButton>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingBook(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Mathematics Book 1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <select
                  value={formData.grade_id}
                  onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a grade</option>
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>{grade.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe this book..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number *
                  </label>
                  <input
                    type="number"
                    value={formData.order_number}
                    onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 2024-2025"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <AnimatedButton 
                  variant="secondary" 
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </AnimatedButton>
                <AnimatedButton 
                  variant="primary" 
                  className="flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Save</span>
                </AnimatedButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BooksManagement; 