import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ChevronRight
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

interface StudentEnrollment {
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
  const [loading, setLoading] = useState(true);
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [currentEnrollmentType, setCurrentEnrollmentType] = useState<'book' | 'unit' | 'lesson' | null>(null);
  const [currentEnrollmentId, setCurrentEnrollmentId] = useState<number | null>(null);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      // Get teacher's assigned books with detailed information
      const teacherId = localStorage.getItem('userId'); // Assuming teacher ID is stored
      console.log('Teacher ID from localStorage:', teacherId);
      
      if (!teacherId) {
        console.error('Teacher ID not found in localStorage');
        alert('Teacher ID not found. Please log in again.');
        return;
      }
      
      console.log('Fetching books for teacher ID:', teacherId);
      const booksResponse = await api.get(`/activities/teacher-books/${teacherId}`);
      console.log('Books response:', booksResponse.data);
      setBooks(booksResponse.data || []);

      // Get all students for enrollment
      console.log('Fetching students...');
      const studentsResponse = await api.get('/children/all');
      console.log('Students response:', studentsResponse.data);
      setStudents(studentsResponse.data.children || []);

    } catch (error) {
      console.error('Error loading teacher data:', error);
      alert('Error loading teacher data: ' + (error as Error).message);
    } finally {
      setLoading(false);
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
      
      // Reset and reload
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <p className="ml-2">Loading teacher data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Dashboard</h1>
        <p className="text-gray-600">Manage your assigned books and student enrollments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned Books</p>
              <p className="text-2xl font-bold text-gray-900">{books.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Units</p>
              <p className="text-2xl font-bold text-gray-900">
                {books.reduce((sum, book) => sum + (book.units?.length || 0), 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">
                {books.reduce((sum, book) => sum + (book.units?.reduce((unitSum, unit) => unitSum + (unit.total_lessons || 0), 0) || 0), 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {books.reduce((sum, book) => sum + book.enrolled_students, 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Debug Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
      >
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>Teacher ID: {localStorage.getItem('userId') || 'Not found'}</p>
          <p>Books loaded: {books.length}</p>
          <p>Students loaded: {students.length}</p>
          <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
          <button 
            onClick={loadTeacherData}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
          >
            Reload Data
          </button>
        </div>
      </motion.div>

      {/* Books List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Your Assigned Books</h2>
        </div>

        {books.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p>No books assigned to you yet. Contact your administrator.</p>
            <p className="text-sm mt-2">Make sure you have books assigned via the Admin Book Assignment page.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {books.map((book) => (
              <div key={book.book_id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleBookExpansion(book.book_id)}
                      className="mr-3 text-gray-500 hover:text-gray-700"
                    >
                      {expandedBooks.has(book.book_id) ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                    <div>
                      <h3 className="text-lg font-semibold">{book.book_title}</h3>
                      <p className="text-sm text-gray-500">{book.grade_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Students</div>
                      <div className="font-semibold">{book.enrolled_students}</div>
                    </div>
                    <button
                      onClick={() => openEnrollmentModal('book', book.book_id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <UserPlus size={16} />
                      <span>Enroll Students</span>
                    </button>
                  </div>
                </div>

                {expandedBooks.has(book.book_id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-8 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Units</div>
                        <div className="text-2xl font-bold">{book.units?.length || 0}</div>
                        <div className="text-xs text-green-600">{book.units?.filter(u => u.is_unlocked).length || 0} unlocked</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Lessons</div>
                        <div className="text-2xl font-bold">{book.units?.reduce((sum, unit) => sum + (unit.total_lessons || 0), 0) || 0}</div>
                        <div className="text-xs text-green-600">{book.units?.reduce((sum, unit) => sum + (unit.unlocked_lessons || 0), 0) || 0} unlocked</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Students</div>
                        <div className="text-2xl font-bold">{book.enrolled_students}</div>
                        <div className="text-xs text-blue-600">enrolled</div>
                      </div>
                    </div>

                    {/* Units */}
                    {book.units && book.units.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Units</h4>
                        <div className="space-y-3">
                          {book.units.map((unit) => (
                            <div key={unit.unit_id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <button
                                    onClick={() => toggleUnitExpansion(unit.unit_id)}
                                    className="mr-3 text-gray-500 hover:text-gray-700"
                                  >
                                    {expandedUnits.has(unit.unit_id) ? (
                                      <ChevronDown size={16} />
                                    ) : (
                                      <ChevronRight size={16} />
                                    )}
                                  </button>
                                  <div>
                                    <div className="font-medium">Unit {unit.unit_number}: {unit.unit_title}</div>
                                    <div className="text-sm text-gray-500">{unit.enrolled_students} students enrolled</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    unit.is_unlocked 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {unit.is_unlocked ? 'Unlocked' : 'Locked'}
                                  </span>
                                  <button
                                    onClick={() => openEnrollmentModal('unit', unit.unit_id)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                                  >
                                    <UserPlus size={14} />
                                    <span>Enroll</span>
                                  </button>
                                </div>
                              </div>

                              {expandedUnits.has(unit.unit_id) && unit.lessons && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="ml-8 space-y-2"
                                >
                                  {unit.lessons.map((lesson) => (
                                    <div key={lesson.lesson_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                      <div>
                                        <div className="font-medium">Lesson {lesson.lesson_number}: {lesson.lesson_title}</div>
                                        <div className="text-sm text-gray-500">{lesson.enrolled_students} students enrolled</div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                          lesson.is_unlocked 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {lesson.is_unlocked ? 'Unlocked' : 'Locked'}
                                        </span>
                                        <button
                                          onClick={() => openEnrollmentModal('lesson', lesson.lesson_id)}
                                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                                        >
                                          <UserPlus size={14} />
                                          <span>Enroll</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Enrollment Modal */}
      {currentEnrollmentType && currentEnrollmentId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{getEnrollmentTitle()}</h3>
              <button
                onClick={() => setCurrentEnrollmentType(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AlertCircle size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Select students to enroll:</p>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedStudents.includes(student.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleStudentSelect(student.id)}
                  >
                    <div className="flex items-center justify-between">
                                           <div>
                       <div className="font-medium">{student.first_name} {student.last_name} ({student.username})</div>
                       <div className="text-sm text-gray-500">Age: {student.age} | {student.gender} | Parent: {student.parent_name}</div>
                     </div>
                      {selectedStudents.includes(student.id) && (
                        <CheckCircle className="text-blue-500" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCurrentEnrollmentType(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEnrollStudents}
                disabled={enrolling || selectedStudents.length === 0}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:cursor-not-allowed"
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
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TeacherDashboard; 