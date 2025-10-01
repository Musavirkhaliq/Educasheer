import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { testSeriesAPI } from '../../services/testSeriesAPI';
import { quizAPI } from '../../services/quizAPI';
import { courseAPI } from '../../services/courseAPI';
import { toast } from 'react-hot-toast';

const TestSeriesForm = ({ isEditing = false, onUpdate }) => {
  const navigate = useNavigate();
  const { testSeriesId } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    category: 'General',
    tags: [],
    difficulty: 'medium',
    examType: '',
    subject: '',
    price: 0,
    originalPrice: 0,
    instructions: '',
    allowReview: true,
    showResults: true,
    randomizeQuizOrder: false,
    maxAttempts: 0,
    validFrom: '',
    validUntil: '',
    thumbnail: '',
    quizzes: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        
        // Fetch available quizzes and courses
        const [quizzesResponse, coursesResponse] = await Promise.all([
          quizAPI.getAllQuizzes(),
          courseAPI.getAllCourses()
        ]);
        
        setAvailableQuizzes(quizzesResponse.data.data);
        setCourses(coursesResponse.data.data);
        
        // If editing, fetch test series data
        if (isEditing && testSeriesId) {
          const testSeriesResponse = await testSeriesAPI.getTestSeriesById(testSeriesId);
          const testSeriesData = testSeriesResponse.data.data;
          
          setFormData({
            title: testSeriesData.title || '',
            description: testSeriesData.description || '',
            course: testSeriesData.course?._id || '',
            category: testSeriesData.category || 'General',
            tags: testSeriesData.tags || [],
            difficulty: testSeriesData.difficulty || 'medium',
            examType: testSeriesData.examType || '',
            subject: testSeriesData.subject || '',
            price: testSeriesData.price || 0,
            originalPrice: testSeriesData.originalPrice || 0,
            instructions: testSeriesData.instructions || '',
            allowReview: testSeriesData.allowReview !== false,
            showResults: testSeriesData.showResults !== false,
            randomizeQuizOrder: testSeriesData.randomizeQuizOrder || false,
            maxAttempts: testSeriesData.maxAttempts || 0,
            validFrom: testSeriesData.validFrom ? new Date(testSeriesData.validFrom).toISOString().split('T')[0] : '',
            validUntil: testSeriesData.validUntil ? new Date(testSeriesData.validUntil).toISOString().split('T')[0] : '',
            thumbnail: testSeriesData.thumbnail || '',
            quizzes: testSeriesData.quizzes?.map(q => q._id) || []
          });
        }
      } catch (error) {
        console.error('Error initializing form:', error);
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [isEditing, testSeriesId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleQuizToggle = (quizId) => {
    setFormData(prev => ({
      ...prev,
      quizzes: prev.quizzes.includes(quizId)
        ? prev.quizzes.filter(id => id !== quizId)
        : [...prev.quizzes, quizId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        validFrom: formData.validFrom || undefined,
        validUntil: formData.validUntil || undefined
      };

      // Clean up empty string values that should be null/undefined for ObjectId fields
      if (submitData.course === '') {
        submitData.course = undefined;
      }

      // Clean up other empty string fields
      if (submitData.examType === '') {
        submitData.examType = undefined;
      }
      if (submitData.subject === '') {
        submitData.subject = undefined;
      }
      if (submitData.thumbnail === '') {
        submitData.thumbnail = undefined;
      }
      if (submitData.instructions === '') {
        submitData.instructions = undefined;
      }

      // Remove sections from form data as they are managed separately
      delete submitData.sections;

      console.log('Submitting test series data:', submitData);

      if (isEditing) {
        console.log('Updating test series:', testSeriesId);
        await testSeriesAPI.updateTestSeries(testSeriesId, submitData);
        toast.success('Test series updated successfully');
        if (onUpdate) {
          onUpdate();
        } else {
          // If no onUpdate callback, navigate back to list
          navigate('/admin/test-series');
        }
      } else {
        console.log('Creating new test series');
        await testSeriesAPI.createTestSeries(submitData);
        toast.success('Test series created successfully');
        navigate('/admin/test-series');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to save test series');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  const isStandalone = !onUpdate; // If no onUpdate callback, it's a standalone form

  if (isStandalone) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Edit Test Series' : 'Create Test Series'}
            </h1>
            <button
              onClick={() => navigate('/admin/test-series')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form content will be rendered here */}
            {renderFormContent()}
            
            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/test-series')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg hover:bg-[#0097a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaSave />
                {submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')} Test Series
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Embedded form (within edit page)
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderFormContent()}
        
        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg hover:bg-[#0097a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaSave />
            {submitting ? 'Saving...' : 'Update Test Series'}
          </button>
        </div>
      </form>
    </div>
  );

  function renderFormContent() {
    return (
      <>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
              placeholder="Enter test series title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course (Optional)
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            >
              <option value="">No Course (Standalone)</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Link this test series to a course to group related tests together
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            >
              <option value="General">General</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Management">Management</option>
              <option value="Government">Government</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="Enter test series description"
          />
        </div>

        {/* Exam Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Type
            </label>
            <input
              type="text"
              name="examType"
              value={formData.examType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
              placeholder="e.g., JEE, NEET, CAT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
              placeholder="e.g., Mathematics, Physics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors"
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

      </>
    );
  }
};

export default TestSeriesForm;
