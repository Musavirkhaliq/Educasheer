import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from 'react-icons/fa';
import { quizAPI } from '../../services/quizAPI';
import { courseAPI } from '../../services/courseAPI';
import { toast } from 'react-hot-toast';

const QuizForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    timeLimit: 30,
    passingScore: 70,
    quizType: 'quiz',
    maxAttempts: 0,
    allowReview: true,
    showCorrectAnswers: true,
    randomizeQuestions: false,
    questions: []
  });
  
  // Fetch courses and quiz data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses
        const coursesResponse = await courseAPI.getAllCourses();
        setCourses(coursesResponse.data.data);
        
        // If editing, fetch quiz data
        if (isEditing && quizId) {
          const quizResponse = await quizAPI.getQuizById(quizId);
          const quizData = quizResponse.data.data;
          
          setFormData({
            title: quizData.title || '',
            description: quizData.description || '',
            course: quizData.course?._id || '',
            timeLimit: quizData.timeLimit || 30,
            passingScore: quizData.passingScore || 70,
            quizType: quizData.quizType || 'quiz',
            maxAttempts: quizData.maxAttempts || 0,
            allowReview: quizData.allowReview !== false,
            showCorrectAnswers: quizData.showCorrectAnswers !== false,
            randomizeQuestions: quizData.randomizeQuestions || false,
            questions: quizData.questions || []
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isEditing, quizId]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle question changes
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  // Handle option changes
  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    const options = [...updatedQuestions[questionIndex].options];
    
    options[optionIndex] = {
      ...options[optionIndex],
      [field]: field === 'isCorrect' ? value : value
    };
    
    updatedQuestions[questionIndex].options = options;
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  // Add a new question
  const addQuestion = () => {
    const newQuestion = {
      text: '',
      type: 'multiple_choice',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: '',
      points: 1,
      explanation: ''
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };
  
  // Remove a question
  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  // Add an option to a question
  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.push({ text: '', isCorrect: false });
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  // Remove an option from a question
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    
    if (!formData.course) {
      toast.error('Please select a course');
      return;
    }
    
    if (formData.questions.length === 0) {
      toast.error('At least one question is required');
      return;
    }
    
    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      
      if (!question.text.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }
      
      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        if (question.options.length < 2) {
          toast.error(`Question ${i + 1} must have at least 2 options`);
          return;
        }
        
        if (!question.options.some(opt => opt.isCorrect)) {
          toast.error(`Question ${i + 1} must have at least one correct option`);
          return;
        }
        
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].text.trim()) {
            toast.error(`Option ${j + 1} for Question ${i + 1} text is required`);
            return;
          }
        }
      } else if (question.type === 'short_answer' && !question.correctAnswer.trim()) {
        toast.error(`Question ${i + 1} must have a correct answer`);
        return;
      }
    }
    
    try {
      setSubmitting(true);
      
      if (isEditing) {
        await quizAPI.updateQuiz(quizId, formData);
        toast.success('Quiz updated successfully');
      } else {
        await quizAPI.createQuiz(formData);
        toast.success('Quiz created successfully');
      }
      
      navigate('/admin/quizzes');
    } catch (err) {
      console.error('Error saving quiz:', err);
      toast.error(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00bcd4]"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin/quizzes')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">{isEditing ? 'Edit Quiz' : 'Create Quiz'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Quiz Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quiz Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Type
              </label>
              <select
                name="quizType"
                value={formData.quizType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleInputChange}
                min="1"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attempts (0 = unlimited)
              </label>
              <input
                type="number"
                name="maxAttempts"
                value={formData.maxAttempts}
                onChange={handleInputChange}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="flex items-center space-x-4 mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowReview"
                  name="allowReview"
                  checked={formData.allowReview}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#00bcd4] focus:ring-[#00bcd4] border-gray-300 rounded"
                />
                <label htmlFor="allowReview" className="ml-2 text-sm text-gray-700">
                  Allow Review
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showCorrectAnswers"
                  name="showCorrectAnswers"
                  checked={formData.showCorrectAnswers}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#00bcd4] focus:ring-[#00bcd4] border-gray-300 rounded"
                />
                <label htmlFor="showCorrectAnswers" className="ml-2 text-sm text-gray-700">
                  Show Correct Answers
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="randomizeQuestions"
                  name="randomizeQuestions"
                  checked={formData.randomizeQuestions}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#00bcd4] focus:ring-[#00bcd4] border-gray-300 rounded"
                />
                <label htmlFor="randomizeQuestions" className="ml-2 text-sm text-gray-700">
                  Randomize Questions
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Questions</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-[#00bcd4] text-white px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-[#0097a7] transition-colors"
            >
              <FaPlus size={14} /> Add Question
            </button>
          </div>
          
          {formData.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions added yet. Click "Add Question" to get started.
            </div>
          ) : (
            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Question {qIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                        rows="2"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="short_answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points
                        </label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Options for multiple choice and true/false questions */}
                  {(question.type === 'multiple_choice' || question.type === 'true_false') && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Options <span className="text-red-500">*</span>
                        </label>
                        {question.type === 'multiple_choice' && (
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-sm text-[#00bcd4] hover:text-[#0097a7] flex items-center gap-1"
                          >
                            <FaPlus size={12} /> Add Option
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type={question.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                              name={`question-${qIndex}-correct`}
                              checked={option.isCorrect}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, 'isCorrect', e.target.checked)}
                              className="h-4 w-4 text-[#00bcd4] focus:ring-[#00bcd4] border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-1"
                              placeholder="Option text"
                              required
                            />
                            {question.type === 'multiple_choice' && question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTrash size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Correct answer for short answer questions */}
                  {question.type === 'short_answer' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correct Answer <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={question.correctAnswer || ''}
                        onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={question.explanation || ''}
                      onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                      rows="2"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Explain the correct answer"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0097a7] transition-colors disabled:bg-gray-400"
          >
            {submitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>{isEditing ? 'Update Quiz' : 'Create Quiz'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
