import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit, Trash2, TrendingUp, ArrowLeft, 
  Check, X, Search, Filter, Lock, Unlock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '../../components/AnimatedButton';
import AudioButton from '../../components/AudioButton';
import api from '../../services/api';

interface Unit {
  id: number;
  title: string;
  description: string;
  unit_number: number;
  is_active: boolean;
  is_unlocked: boolean;
  unlocked_by?: number;
  unlocked_at?: string;
  created_at: string;
  updated_at: string;
  book_id: number;
  book_title: string;
  grade_id: number;
  grade_name: string;
}

interface Book {
  id: number;
  title: string;
  description: string;
  grade_id: number;
  grade_name: string;
}

const UnitsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    book_id: '',
    unit_number: 1,
    is_active: true
  });

  useEffect(() => {
    fetchUnits();
    fetchBooks();
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await api.get('/education/units');
      // Handle both response formats: response.data.units or response.data
      const unitsData = response.data.units || response.data;
      setUnits(Array.isArray(unitsData) ? unitsData : []);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]); // Ensure units is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await api.get('/education/books');
      // Handle both response formats: response.data.books or response.data
      const booksData = response.data.books || response.data;
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]); // Ensure books is always an array
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingUnit) {
        await api.put(`/education/units/${editingUnit.id}`, formData);
      } else {
        await api.post('/education/units', formData);
      }
      
      fetchUnits();
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving unit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;
    
    try {
      await api.delete(`/education/units/${id}`);
      fetchUnits();
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  const handleToggleLock = async (unit: Unit) => {
    try {
      const url = `/api/education/units/${unit.id}/${unit.is_unlocked ? 'lock' : 'unlock'}`;
      const response = await api.post(url, {
        unlockNotes: 'Unlocked by admin'
      });
      
      const data = response.data;
      if (data.success) {
        fetchUnits();
      }
    } catch (error) {
      console.error('Error toggling unit lock:', error);
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      title: unit.title,
      description: unit.description,
      book_id: unit.book_id.toString(),
      unit_number: unit.unit_number,
      is_active: unit.is_active
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      book_id: '',
      unit_number: 1,
      is_active: true
    });
  };

  const filteredUnits = (Array.isArray(units) ? units : []).filter(unit => {
    const matchesSearch = unit?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBook = selectedBook ? unit?.book_id === selectedBook : true;
    return matchesSearch && matchesBook;
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
                <h1 className="text-2xl font-bold text-gray-800">Units Management</h1>
                <p className="text-gray-600">Manage learning units/levels</p>
              </div>
            </div>
            <AnimatedButton
              variant="primary"
              onClick={() => {
                setEditingUnit(null);
                resetForm();
                setShowAddForm(true);
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Unit</span>
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
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
                            <select
                  value={selectedBook || ''}
                  onChange={(e) => setSelectedBook(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Books</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>{book.title}</option>
                  ))}
                </select>
            <AnimatedButton variant="secondary" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </AnimatedButton>
          </div>
        </div>

        {/* Units Grid */}
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
          ) : filteredUnits.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Units Found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first unit</p>
              <AnimatedButton
                variant="primary"
                onClick={() => {
                  setEditingUnit(null);
                  resetForm();
                  setShowAddForm(true);
                }}
              >
                Add First Unit
              </AnimatedButton>
            </div>
          ) : (
            filteredUnits.map((unit) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{unit.title}</h3>
                    <p className="text-sm text-gray-600">{unit.book_title}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    unit.is_unlocked 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {unit.is_unlocked ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">{unit.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Unit {unit.unit_number}</span>
                  <span className="text-sm text-gray-500">{unit.grade_name}</span>
                </div>
                
                <div className="flex space-x-2">
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(unit)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </AnimatedButton>
                  <AnimatedButton
                    variant={unit.is_unlocked ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleToggleLock(unit)}
                    className="flex-1"
                  >
                    {unit.is_unlocked ? (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        Lock
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 mr-1" />
                        Unlock
                      </>
                    )}
                  </AnimatedButton>
                </div>
                
                <div className="flex space-x-2 mt-2">
                                     <AnimatedButton 
                     variant="secondary" 
                     onClick={() => handleDelete(unit.id)}
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
                {editingUnit ? 'Edit Unit' : 'Add New Unit'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingUnit(null);
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
                  Unit Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Basic Counting"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book *
                </label>
                <select
                  value={formData.book_id}
                  onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a book</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>{book.title}</option>
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
                  placeholder="Describe this unit..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Number *
                </label>
                <input
                  type="number"
                  value={formData.unit_number}
                  onChange={(e) => setFormData({ ...formData, unit_number: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                  required
                />
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

export default UnitsManagement; 