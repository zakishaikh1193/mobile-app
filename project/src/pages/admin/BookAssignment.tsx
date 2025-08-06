import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'teacher';
}

interface Book {
  id: number;
  title: string;
  description: string;
  grade_name: string;
  is_active: boolean;
}

interface TeacherBookAssignment {
  id: number;
  teacher_id: number;
  book_id: number;
  teacher_name: string;
  book_title: string;
  grade_name: string;
  assigned_at: string;
  is_active: boolean;
}

const BookAssignment: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [assignments, setAssignments] = useState<TeacherBookAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  
  // Selection states
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  
  // Filter states
  const [teacherFilter, setTeacherFilter] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load teachers
      const teachersResponse = await api.get('/users?role=teacher');
      setTeachers(teachersResponse.data || []);

      // Load books
      const booksResponse = await api.get('/education/books');
      setBooks(booksResponse.data.books || []);

      // Load existing assignments
      const assignmentsResponse = await api.get('/activities/teacher-book-assignments/all');
      setAssignments(assignmentsResponse.data || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacherId: number) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleBookSelect = (bookId: number) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleAssignBooks = async () => {
    if (selectedTeachers.length === 0 || selectedBooks.length === 0) {
      alert('Please select at least one teacher and one book');
      return;
    }

    setAssigning(true);
    try {
      const promises = selectedTeachers.flatMap(teacherId =>
        selectedBooks.map(bookId =>
          api.post('/activities/teacher-book-assignments', {
            teacher_id: teacherId,
            book_id: bookId
          })
        )
      );

      await Promise.all(promises);
      alert(`Successfully assigned ${selectedBooks.length} book(s) to ${selectedTeachers.length} teacher(s)`);
      
      // Reset selections and reload data
      setSelectedTeachers([]);
      setSelectedBooks([]);
      loadData();
    } catch (error) {
      console.error('Error assigning books:', error);
      alert('Error assigning books to teachers');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (teacherId: number, bookId: number) => {
    if (confirm('Are you sure you want to remove this assignment?')) {
      try {
        await api.delete(`/activities/teacher-book-assignments/${teacherId}/${bookId}`);
        alert('Assignment removed successfully');
        loadData();
      } catch (error) {
        console.error('Error removing assignment:', error);
        alert('Error removing assignment');
      }
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.firstName.toLowerCase().includes(teacherFilter.toLowerCase()) ||
    teacher.lastName.toLowerCase().includes(teacherFilter.toLowerCase()) ||
    teacher.email.toLowerCase().includes(teacherFilter.toLowerCase())
  );

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookFilter.toLowerCase()) &&
    (gradeFilter === '' || book.grade_name.toLowerCase().includes(gradeFilter.toLowerCase()))
  );

  const getUniqueGrades = () => {
    const grades = books.map(book => book.grade_name);
    return [...new Set(grades)].sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Assignment Management</h1>
        <p className="text-gray-600">Assign books to teachers to enable them to manage student enrollments</p>
      </div>

      {/* Assignment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BookOpen className="mr-2" />
          Assign Books to Teachers
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teachers Selection */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Users className="mr-2" />
              Select Teachers ({selectedTeachers.length} selected)
            </h3>
            
            <input
              type="text"
              placeholder="Filter teachers..."
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedTeachers.includes(teacher.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleTeacherSelect(teacher.id)}
                >
                  <div className="flex items-center justify-between">
                                         <div>
                       <div className="font-medium">
                         {teacher.firstName} {teacher.lastName}
                       </div>
                       <div className="text-sm text-gray-500">{teacher.email}</div>
                     </div>
                    {selectedTeachers.includes(teacher.id) && (
                      <CheckCircle className="text-blue-500" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Books Selection */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <BookOpen className="mr-2" />
              Select Books ({selectedBooks.length} selected)
            </h3>
            
            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder="Filter books..."
                value={bookFilter}
                onChange={(e) => setBookFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Grades</option>
                {getUniqueGrades().map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedBooks.includes(book.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleBookSelect(book.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.grade_name}</div>
                    </div>
                    {selectedBooks.includes(book.id) && (
                      <CheckCircle className="text-blue-500" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleAssignBooks}
            disabled={assigning || selectedTeachers.length === 0 || selectedBooks.length === 0}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2 disabled:cursor-not-allowed"
          >
            {assigning ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            <span>
              {assigning 
                ? 'Assigning...' 
                : `Assign ${selectedBooks.length} Book(s) to ${selectedTeachers.length} Teacher(s)`
              }
            </span>
          </button>
        </div>
      </motion.div>

      {/* Current Assignments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>
        
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p>No book assignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Teacher</th>
                  <th className="text-left py-3 px-4">Book</th>
                  <th className="text-left py-3 px-4">Grade</th>
                  <th className="text-left py-3 px-4">Assigned Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{assignment.teacher_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{assignment.book_title}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                        {assignment.grade_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        assignment.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {assignment.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleRemoveAssignment(assignment.teacher_id, assignment.book_id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BookAssignment;