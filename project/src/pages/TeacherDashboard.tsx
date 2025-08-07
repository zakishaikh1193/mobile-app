import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  UserPlus,
  UserMinus,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  Star,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';

interface TeacherBook {
  book_id: number;
  book_title: string;
  book_description: string;
  grade_name: string;
  grade_id: number;
  enrolled_students: number;
  units?: TeacherUnit[];
}

interface TeacherUnit {
  unit_id: number;
  unit_title: string;
  unit_description: string;
  unit_number: number;
  is_unlocked: boolean;
  enrolled_students: number;
  total_lessons: number;
  unlocked_lessons: number;
  lessons?: TeacherLesson[];
}

interface TeacherLesson {
  lesson_id: number;
  lesson_title: string;
  lesson_number: number;
  is_unlocked: boolean;
  enrolled_students: number;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  age: number;
  gender: 'boy' | 'girl';
  parent_name: string;
}

interface EnrolledStudent {
  id: number;
  student_id: number;
  first_name: string;
  username: string;
  enrolled_date: string;
  is_active: boolean;
}

const TeacherDashboard: React.FC = () => {
  const [books, setBooks] = useState<TeacherBook[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [currentEnrollmentType, setCurrentEnrollmentType] = useState<'book' | 'unit' | 'lesson' | null>(null);
  const [currentEnrollmentId, setCurrentEnrollmentId] = useState<number | null>(null);
  const [showEnrolledStudents, setShowEnrolledStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'boy' | 'girl'>('all');

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const teacherId = localStorage.getItem('userId');
      
      if (!teacherId) {
        console.error('Teacher ID not found in localStorage');
        alert('Teacher ID not found. Please log in again.');
        return;
      }
      
      const booksResponse = await api.get(`/activities/teacher-books/${teacherId}`);
      setBooks(booksResponse.data || []);

      const studentsResponse = await api.get('/children/all');
      setStudents(studentsResponse.data.children || []);

    } catch (error) {
      console.error('Error loading teacher data:', error);
      alert('Error loading teacher data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledStudents = async (type: 'book' | 'unit' | 'lesson', id: number) => {
    try {
      let endpoint = '';
      switch (type) {
        case 'book':
          endpoint = `/activities/student-book-enrollments/${id}`;
          break;
        case 'unit':
          endpoint = `/activities/student-unit-enrollments/${id}`;
          break;
        case 'lesson':
          endpoint = `/activities/student-lesson-enrollments/${id}`;
          break;
      }
      
      const response = await api.get(endpoint);
      setEnrolledStudents(response.data || []);
      setShowEnrolledStudents(true);
    } catch (error) {
      console.error('Error loading enrolled students:', error);
    }
  };

  const toggleBookExpansion = (bookId: number) => {
    const newExpanded = new Set(expandedBooks);
    if (newExpanded.has(bookId)) {
      newExpanded.delete(bookId);
    } else {
      newExpanded.add(bookId);
    }
    setExpandedBooks(newExpanded);
  };

  const toggleUnitExpansion = (unitId: number) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    const filteredStudents = students.filter(student => {
      const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = filterGender === 'all' || student.gender === filterGender;
      return matchesSearch && matchesGender;
    });
    
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const openEnrollmentModal = (type: 'book' | 'unit' | 'lesson', id: number) => {
    setCurrentEnrollmentType(type);
    setCurrentEnrollmentId(id);
    setSelectedStudents([]);
  };

  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0 || !currentEnrollmentType || !currentEnrollmentId) {
      alert('Please select students to enroll');
      return;
    }

    setEnrolling(true);
    try {
      const teacherId = localStorage.getItem('userId');
      if (!teacherId) {
        alert('Teacher ID not found. Please log in again.');
        return;
      }
      let endpoint = '';
      let data: any = {
        student_ids: selectedStudents,
        enrolled_by: teacherId
      };

      switch (currentEnrollmentType) {
        case 'book':
          endpoint = '/activities/student-book-enrollments';
          data = { ...data, book_id: currentEnrollmentId };
          break;
        case 'unit':
          endpoint = '/activities/student-unit-enrollments';
          data = { ...data, unit_id: currentEnrollmentId };
          break;
        case 'lesson':
          endpoint = '/activities/student-lesson-enrollments';
          data = { ...data, lesson_id: currentEnrollmentId };
          break;
      }

      await api.post(endpoint, data);
      alert(`Successfully enrolled ${selectedStudents.length} student(s)`);
      
      setCurrentEnrollmentType(null);
      setCurrentEnrollmentId(null);
      setSelectedStudents([]);
      loadTeacherData();
    } catch (error) {
      console.error('Error enrolling students:', error);
      alert('Error enrolling students');
    } finally {
      setEnrolling(false);
    }
  };

  const getEnrollmentTitle = () => {
    if (!currentEnrollmentType || !currentEnrollmentId) return '';
    
    switch (currentEnrollmentType) {
      case 'book':
        const book = books.find(b => b.book_id === currentEnrollmentId);
        return `Enroll Students in Book: ${book?.book_title}`;
      case 'unit':
        const unit = books.flatMap(b => b.units || []).find(u => u.unit_id === currentEnrollmentId);
        return `Enroll Students in Unit: ${unit?.unit_title}`;
      case 'lesson':
        const lesson = books.flatMap(b => b.units || []).flatMap(u => u.lessons || []).find(l => l.lesson_id === currentEnrollmentId);
        return `Enroll Students in Lesson: ${lesson?.lesson_title}`;
      default:
        return '';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === 'all' || student.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  const totalUnits = books.reduce((sum, book) => sum + (book.units?.length || 0), 0);
  const totalLessons = books.reduce((sum, book) => sum + (book.units?.reduce((unitSum, unit) => unitSum + (unit.total_lessons || 0), 0) || 0), 0);
  const totalEnrolledStudents = books.reduce((sum, book) => sum + book.enrolled_students, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Teacher Dashboard</h1>
              <p className="text-gray-600 text-lg">Manage your assigned books and student enrollments</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <GraduationCap className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned Books</p>
                <p className="text-3xl font-bold text-gray-900">{books.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-3xl font-bold text-gray-900">{totalUnits}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                <p className="text-3xl font-bold text-gray-900">{totalLessons}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
                <p className="text-3xl font-bold text-gray-900">{totalEnrolledStudents}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Books List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-800">Your Assigned Books</h2>
            <p className="text-gray-600 mt-1">Manage content and student enrollments</p>
          </div>

          {books.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-yellow-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-10 w-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No books assigned yet</h3>
              <p className="text-gray-500 mb-4">Contact your administrator to get books assigned to your account.</p>
              <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-700">
                  <strong>Tip:</strong> Make sure you have books assigned via the Admin Book Assignment page.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {books.map((book, index) => (
                <motion.div
                  key={book.book_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleBookExpansion(book.book_id)}
                        className="mr-4 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        {expandedBooks.has(book.book_id) ? (
                          <ChevronDown size={24} />
                        ) : (
                          <ChevronRight size={24} />
                        )}
                      </button>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{book.book_title}</h3>
                        <p className="text-gray-500">{book.grade_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Students</div>
                        <div className="text-2xl font-bold text-blue-600">{book.enrolled_students}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadEnrolledStudents('book', book.book_id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Eye size={16} />
                          <span>View Enrolled</span>
                        </button>
                        <button
                          onClick={() => openEnrollmentModal('book', book.book_id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <UserPlus size={16} />
                          <span>Enroll Students</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedBooks.has(book.book_id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-10 space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                            <div className="text-sm text-blue-600 font-medium">Units</div>
                            <div className="text-3xl font-bold text-blue-700">{book.units?.length || 0}</div>
                            <div className="text-xs text-blue-600">{book.units?.filter(u => u.is_unlocked).length || 0} unlocked</div>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                            <div className="text-sm text-purple-600 font-medium">Lessons</div>
                            <div className="text-3xl font-bold text-purple-700">{book.units?.reduce((sum, unit) => sum + (unit.total_lessons || 0), 0) || 0}</div>
                            <div className="text-xs text-purple-600">{book.units?.reduce((sum, unit) => sum + (unit.unlocked_lessons || 0), 0) || 0} unlocked</div>
                          </div>
                          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                            <div className="text-sm text-green-600 font-medium">Students</div>
                            <div className="text-3xl font-bold text-green-700">{book.enrolled_students}</div>
                            <div className="text-xs text-green-600">enrolled</div>
                          </div>
                        </div>

                        {/* Units */}
                        {book.units && book.units.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                              <Target className="h-5 w-5 mr-2 text-blue-500" />
                              Units
                            </h4>
                            <div className="space-y-4">
                              {book.units.map((unit) => (
                                <div key={unit.unit_id} className="border border-gray-200 rounded-lg p-4 bg-white">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <button
                                        onClick={() => toggleUnitExpansion(unit.unit_id)}
                                        className="mr-3 text-gray-500 hover:text-blue-600 transition-colors"
                                      >
                                        {expandedUnits.has(unit.unit_id) ? (
                                          <ChevronDown size={20} />
                                        ) : (
                                          <ChevronRight size={20} />
                                        )}
                                      </button>
                                      <div>
                                        <div className="font-semibold text-gray-800">Unit {unit.unit_number}: {unit.unit_title}</div>
                                        <div className="text-sm text-gray-500">{unit.enrolled_students} students enrolled</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        unit.is_unlocked 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {unit.is_unlocked ? 'Unlocked' : 'Locked'}
                                      </span>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => loadEnrolledStudents('unit', unit.unit_id)}
                                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                                        >
                                          <Eye size={14} />
                                          <span>View</span>
                                        </button>
                                        <button
                                          onClick={() => openEnrollmentModal('unit', unit.unit_id)}
                                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                                        >
                                          <UserPlus size={14} />
                                          <span>Enroll</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <AnimatePresence>
                                    {expandedUnits.has(unit.unit_id) && unit.lessons && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="ml-8 space-y-3"
                                      >
                                        {unit.lessons.map((lesson) => (
                                          <div key={lesson.lesson_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                              <div className="font-medium text-gray-800">Lesson {lesson.lesson_number}: {lesson.lesson_title}</div>
                                              <div className="text-sm text-gray-500">{lesson.enrolled_students} students enrolled</div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                lesson.is_unlocked 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : 'bg-yellow-100 text-yellow-800'
                                              }`}>
                                                {lesson.is_unlocked ? 'Unlocked' : 'Locked'}
                                              </span>
                                              <div className="flex space-x-2">
                                                <button
                                                  onClick={() => loadEnrolledStudents('lesson', lesson.lesson_id)}
                                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                                                >
                                                  <Eye size={14} />
                                                  <span>View</span>
                                                </button>
                                                <button
                                                  onClick={() => openEnrollmentModal('lesson', lesson.lesson_id)}
                                                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                                                >
                                                  <UserPlus size={14} />
                                                  <span>Enroll</span>
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Enhanced Enrollment Modal */}
        <AnimatePresence>
          {currentEnrollmentType && currentEnrollmentId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{getEnrollmentTitle()}</h3>
                    <button
                      onClick={() => setCurrentEnrollmentType(null)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <AlertCircle size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Search and Filter */}
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <select
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value as 'all' | 'boy' | 'girl')}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Genders</option>
                        <option value="boy">Boys</option>
                        <option value="girl">Girls</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleSelectAllStudents}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <CheckCircle size={16} />
                          <span>
                            {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 
                              ? 'Deselect All' 
                              : 'Select All'}
                          </span>
                        </button>
                        <span className="text-sm text-gray-600">
                          {selectedStudents.length} of {filteredStudents.length} students selected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Students List */}
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredStudents.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No students found matching your search criteria.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                              selectedStudents.includes(student.id) ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => handleStudentSelect(student.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  student.gender === 'boy' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                                }`}>
                                  {student.first_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {student.first_name} {student.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    @{student.username} • Age: {student.age} • {student.gender} • Parent: {student.parent_name}
                                  </div>
                                </div>
                              </div>
                              {selectedStudents.includes(student.id) && (
                                <CheckCircle className="text-blue-500" size={20} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentEnrollmentType(null)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEnrollStudents}
                      disabled={enrolling || selectedStudents.length === 0}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:cursor-not-allowed"
                    >
                      {enrolling ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      <span>
                        {enrolling 
                          ? 'Enrolling...' 
                          : `Enroll ${selectedStudents.length} Student(s)`
                        }
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enrolled Students Modal */}
        <AnimatePresence>
          {showEnrolledStudents && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Enrolled Students</h3>
                    <button
                      onClick={() => setShowEnrolledStudents(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <AlertCircle size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {enrolledStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No students enrolled yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrolledStudents.map((enrollment) => (
                        <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">{enrollment.first_name.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{enrollment.first_name}</div>
                              <div className="text-sm text-gray-500">@{enrollment.username}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Enrolled</div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(enrollment.enrolled_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeacherDashboard; 