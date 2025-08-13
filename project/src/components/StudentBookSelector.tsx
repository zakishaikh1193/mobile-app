import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lock, Play, Users, GraduationCap, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface StudentBook {
  book_id: number;
  book_title: string;
  book_description: string;
  grade_name: string;
  enrolled_students: number;
  total_units: number;
  unlocked_units: number;
  total_lessons: number;
  unlocked_lessons: number;
}

const StudentBookSelector: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [books, setBooks] = useState<StudentBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      fetchStudentBooks();
    }, [childId]);

    const fetchStudentBooks = async () => {
      if (!childId) return;
      
      setLoading(true);
      try {
        // Get books that the student is enrolled in
        const response = await api.get(`/activities/child/${childId}/enrolled-books`);
        setBooks(response.data || []);
      } catch (error) {
        console.error('Error fetching student books:', error);
        setError('Failed to load your books');
      } finally {
        setLoading(false);
      }
    };

    const handleBookSelect = (bookId: number) => {
      navigate(`/letter-path/${childId}?bookId=${bookId}`);
    };

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading your books...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={fetchStudentBooks}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (books.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="bg-yellow-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No books assigned yet</h3>
            <p className="text-gray-500 mb-4">Your teacher hasn't assigned any books to you yet.</p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Ask your teacher to enroll you in a book through their dashboard.
              </p>
            </div>
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/parent/dashboard')}
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors shadow-md"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </button>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Books</h1>
                <p className="text-gray-600">Choose a book to start learning</p>
              </div>
              <div className="w-32"></div> {/* Spacer for centering */}
            </div>
          </motion.div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, index) => (
              <motion.div
                key={book.book_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{book.book_title}</h3>
                        <p className="text-sm text-gray-500">{book.grade_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{book.unlocked_units}/{book.total_units}</div>
                      <div className="text-xs text-gray-500">Units</div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {book.book_description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Lessons</span>
                      <span className="font-medium">{book.unlocked_lessons}/{book.total_lessons}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Students</span>
                      <span className="font-medium">{book.enrolled_students}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookSelect(book.book_id)}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Learning</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
             </div>
     );
};

export default StudentBookSelector;
