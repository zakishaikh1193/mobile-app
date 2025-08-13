import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Eye, 
  Star, 
  MessageSquare, 
  FileText,
  User,
  Calendar,
  Target,
  TrendingUp,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import api from '../services/api';

interface PendingAssessment {
  completion_id: number;
  child_id: number;
  child_name: string;
  child_username: string;
  child_avatar: string;
  activity_id: number;
  activity_title: string;
  activity_type: string;
  activity_description: string;
  lesson_id: number;
  lesson_title: string;
  unit_id: number;
  unit_title: string;
  book_id: number;
  book_title: string;
  grade_id: number;
  grade_name: string;
  completed_file_path: string;
  file_type: string;
  completion_data: any;
  time_spent_seconds: number;
  completed_at: string;
  status: string;
  teacher_feedback: string;
  teacher_notes: string;
  assessment_criteria: string;
  criteria_color: string;
  assessor_name: string;
  assessed_at: string;
}

interface AssessmentCriteria {
  id: number;
  name: string;
  description: string;
  level_order: number;
  color: string;
}

const TeacherAssessmentDashboard: React.FC = () => {
  const [pendingAssessments, setPendingAssessments] = useState<PendingAssessment[]>([]);
  const [assessmentCriteria, setAssessmentCriteria] = useState<AssessmentCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<PendingAssessment | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'assessed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadAssessmentData();
  }, []);

  const loadAssessmentData = async () => {
    setLoading(true);
    try {
      // Load pending assessments
      const assessmentsResponse = await api.get('/activities/pending-assessments');
      setPendingAssessments(assessmentsResponse.data.assessments || []);

      // Load assessment criteria
      const criteriaResponse = await api.get('/education/assessment-criteria');
      setAssessmentCriteria(criteriaResponse.data.criteria || []);

    } catch (error) {
      console.error('Error loading assessment data:', error);
      alert('Error loading assessment data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessActivity = async (assessmentData: {
    assessment_criteria_id: number;
    teacher_feedback: string;
    teacher_notes: string;
  }) => {
    if (!selectedAssessment) return;

    setAssessing(true);
    try {
      const teacherId = localStorage.getItem('userId');
      if (!teacherId) {
        alert('Teacher ID not found. Please log in again.');
        return;
      }

      const response = await api.put(`/activities/assess/${selectedAssessment.completion_id}`, {
        ...assessmentData,
        assessed_by: parseInt(teacherId)
      });

      if (response.data.success) {
        alert('Assessment saved successfully!');
        setShowAssessmentModal(false);
        setSelectedAssessment(null);
        loadAssessmentData(); // Refresh the list
      } else {
        alert('Failed to save assessment: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error assessing activity:', error);
      alert('Error saving assessment: ' + (error as Error).message);
    } finally {
      setAssessing(false);
    }
  };

  const viewCompletedFile = (assessment: PendingAssessment) => {
    // Construct the full URL for the completed file
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://prek-backend.bylinelms.com' 
      : 'http://localhost:3000';
    
    const fileUrl = `${baseUrl}/${assessment.completed_file_path}`;
    window.open(fileUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'assessed': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'assessed': return <CheckCircle className="h-4 w-4" />;
      case 'returned': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredAssessments = pendingAssessments.filter(assessment => {
    const matchesSearch = 
      assessment.child_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.activity_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.book_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const paginatedAssessments = filteredAssessments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading assessments...</p>
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Assessment Dashboard</h1>
              <p className="text-gray-600 text-lg">Review and assess student completed activities</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
          >
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pendingAssessments.filter(a => a.status === 'submitted').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assessed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pendingAssessments.filter(a => a.status === 'assessed').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Set(pendingAssessments.map(a => a.child_id)).size}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Time</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(pendingAssessments.reduce((sum, a) => sum + a.time_spent_seconds, 0) / Math.max(pendingAssessments.length, 1) / 60)}m
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by student name, activity, or book..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="submitted">Pending</option>
                <option value="assessed">Assessed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Assessments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-800">Student Submissions</h2>
            <p className="text-gray-600 mt-1">
              {filteredAssessments.length} submission{filteredAssessments.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {paginatedAssessments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No assessments found</h3>
              <p className="text-gray-500">All student submissions have been assessed or no submissions match your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedAssessments.map((assessment) => (
                <motion.div
                  key={assessment.completion_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {assessment.child_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assessment.child_name}
                        </h3>
                        <p className="text-sm text-gray-500">@{assessment.child_username}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            {assessment.activity_title}
                          </span>
                          <span className="text-sm text-gray-500">
                            • {assessment.book_title}
                          </span>
                          <span className="text-sm text-gray-500">
                            • {assessment.lesson_title}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(assessment.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatTimeSpent(assessment.time_spent_seconds)}
                          </span>
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(assessment.status)}`}>
                        {getStatusIcon(assessment.status)}
                        <span className="capitalize">{assessment.status}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewCompletedFile(assessment)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View completed work"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        
                        {assessment.status === 'submitted' && (
                          <button
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setShowAssessmentModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Star className="h-4 w-4" />
                            <span>Assess</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAssessments.length)} of {filteredAssessments.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Assessment Modal */}
        <AnimatePresence>
          {showAssessmentModal && selectedAssessment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAssessmentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">Assess Student Work</h3>
                  <p className="text-gray-600 mt-1">
                    {selectedAssessment.child_name} - {selectedAssessment.activity_title}
                  </p>
                </div>

                <div className="p-6">
                  <AssessmentForm
                    assessment={selectedAssessment}
                    criteria={assessmentCriteria}
                    onSubmit={handleAssessActivity}
                    onCancel={() => setShowAssessmentModal(false)}
                    loading={assessing}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Assessment Form Component
interface AssessmentFormProps {
  assessment: PendingAssessment;
  criteria: AssessmentCriteria[];
  onSubmit: (data: { assessment_criteria_id: number; teacher_feedback: string; teacher_notes: string }) => void;
  onCancel: () => void;
  loading: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ assessment, criteria, onSubmit, onCancel, loading }) => {
  const [selectedCriteria, setSelectedCriteria] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCriteria === 0) {
      alert('Please select an assessment criteria');
      return;
    }
    onSubmit({
      assessment_criteria_id: selectedCriteria,
      teacher_feedback: feedback,
      teacher_notes: notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Student Work Preview */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Student Work</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium text-gray-900">{assessment.child_name}</p>
              <p className="text-sm text-gray-600">{assessment.activity_title}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const baseUrl = process.env.NODE_ENV === 'production' 
                  ? 'https://prek-backend.bylinelms.com' 
                  : 'http://localhost:3000';
                const fileUrl = `${baseUrl}/${assessment.completed_file_path}`;
                window.open(fileUrl, '_blank');
              }}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
            >
              View Work
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Time Spent:</span>
              <span className="ml-2 font-medium">
                {Math.floor(assessment.time_spent_seconds / 60)}:{(assessment.time_spent_seconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Completed:</span>
              <span className="ml-2 font-medium">
                {new Date(assessment.completed_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Criteria */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Assessment Level</h4>
        <div className="grid grid-cols-1 gap-3">
          {criteria.map((criterion) => (
            <label
              key={criterion.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedCriteria === criterion.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="criteria"
                value={criterion.id}
                checked={selectedCriteria === criterion.id}
                onChange={(e) => setSelectedCriteria(parseInt(e.target.value))}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: criterion.color }}
                >
                  {selectedCriteria === criterion.id && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: criterion.color }}
                    />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{criterion.name}</div>
                  <div className="text-sm text-gray-600">{criterion.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Feedback</h4>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide constructive feedback for the student..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Notes */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Teacher Notes (Optional)</h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes for your records..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || selectedCriteria === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Save Assessment</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TeacherAssessmentDashboard;

