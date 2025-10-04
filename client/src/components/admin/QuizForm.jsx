import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaFileImport } from 'react-icons/fa';
import { quizAPI } from '../../services/quizAPI';
import { courseAPI } from '../../services/courseAPI';
import { toast } from 'react-hot-toast';
import QuizJSONUpload from './QuizJSONUpload';
import ImageUpload from './ImageUpload';

// Removed the following imports as they are Node.js modules and cannot be used in the browser.
// import path from 'path';
// import multer from 'multer';

const QuizForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [testSeries, setTestSeries] = useState([]);
  const [sections, setSections] = useState([]);
  const [showJSONUpload, setShowJSONUpload] = useState(false);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [newSectionData, setNewSectionData] = useState({
    title: '',
    description: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    testSeries: '',
    section: '', // Add section field
    category: '',
    tags: [],
    difficulty: 'medium',
    timeLimit: 30,
    passingScore: 70,
    quizType: 'Topic Test',
    maxAttempts: 0,
    allowReview: true,
    showCorrectAnswers: true,
    randomizeQuestions: false,
    isPublished: false, // Add this to ensure quizzes start as drafts
    questions: []
  });

  const [tagInput, setTagInput] = useState('');

  // Fetch courses and quiz data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch courses
        const coursesResponse = await courseAPI.getAllCourses();
        setCourses(coursesResponse.data.data);

        // Fetch test series
        const { testSeriesAPI } = await import('../../services/testSeriesAPI');
        const testSeriesResponse = await testSeriesAPI.getAllTestSeries();
        setTestSeries(testSeriesResponse.data.data);

        // If editing, fetch quiz data
        if (isEditing && quizId) {
          const quizResponse = await quizAPI.getQuizById(quizId);
          const quizData = quizResponse.data.data;

          // Ensure all questions have proper structure
          const processedQuestions = (quizData.questions || []).map(question => ({
            ...question,
            options: question.options || [],
            text: question.text || '',
            type: question.type || 'multiple_choice',
            points: question.points || 1,
            explanation: question.explanation || '',
            correctAnswer: question.correctAnswer || ''
          }));

          setFormData({
            title: quizData.title || '',
            description: quizData.description || '',
            testSeries: quizData.testSeries?._id || '',
            section: quizData.section || '',
            category: quizData.category || '',
            tags: quizData.tags || [],
            difficulty: quizData.difficulty || 'medium',
            timeLimit: quizData.timeLimit || 30,
            passingScore: quizData.passingScore || 70,
            quizType: quizData.quizType || 'Topic Test',
            maxAttempts: quizData.maxAttempts || 0,
            allowReview: quizData.allowReview !== false,
            showCorrectAnswers: quizData.showCorrectAnswers !== false,
            randomizeQuestions: quizData.randomizeQuestions || false,
            isPublished: quizData.isPublished || false,
            questions: processedQuestions
          });

          // Load sections for the selected test series
          if (quizData.testSeries?._id) {
            loadSections(quizData.testSeries._id);
          }
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

  // Load sections for selected test series
  const loadSections = async (testSeriesId) => {
    if (!testSeriesId) {
      setSections([]);
      return;
    }

    try {
      const { testSeriesAPI } = await import('../../services/testSeriesAPI');
      const response = await testSeriesAPI.getTestSeriesById(testSeriesId);
      const testSeriesData = response.data.data;
      setSections(testSeriesData.sections || []);
    } catch (err) {
      console.error('Error loading sections:', err);
      setSections([]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If test series changes, load its sections and reset section selection
    if (name === 'testSeries') {
      loadSections(value);
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        section: '' // Reset section when test series changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
      image: '',
      options: [
        { text: '', isCorrect: false, image: '' },
        { text: '', isCorrect: false, image: '' }
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
    updatedQuestions[questionIndex].options.push({ text: '', isCorrect: false, image: '' });

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

  // Handle question image change
  const handleQuestionImageChange = (questionIndex, imageUrl) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].image = imageUrl;

    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Handle question image removal
  const handleQuestionImageRemove = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].image = '';

    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Handle option image change
  const handleOptionImageChange = (questionIndex, optionIndex, imageUrl) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex].image = imageUrl;

    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Handle option image removal
  const handleOptionImageRemove = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex].image = '';

    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Handle imported questions from JSON
  const handleQuestionsImported = (importedQuestions) => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, ...importedQuestions]
    }));
    setShowJSONUpload(false);
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    const currentTags = formData.tags || [];
    if (tag && !currentTags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...currentTags, tag]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle create new section
  const handleCreateSection = async () => {
    if (!formData.testSeries) {
      toast.error('Please select a test series first');
      return;
    }

    if (!newSectionData.title.trim()) {
      toast.error('Section title is required');
      return;
    }

    try {
      const { testSeriesAPI } = await import('../../services/testSeriesAPI');
      const response = await testSeriesAPI.addSection(formData.testSeries, {
        title: newSectionData.title.trim(),
        description: newSectionData.description.trim()
      });

      // Reload sections to get the updated list
      await loadSections(formData.testSeries);

      // Find the newly created section and select it
      const updatedTestSeries = response.data.data;
      const newSection = updatedTestSeries.sections[updatedTestSeries.sections.length - 1];

      setFormData(prev => ({
        ...prev,
        section: newSection._id
      }));

      // Reset form and close modal
      setNewSectionData({ title: '', description: '' });
      setShowCreateSection(false);

      toast.success('Section created successfully');
    } catch (err) {
      console.error('Error creating section:', err);
      toast.error(err.response?.data?.message || 'Failed to create section');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    if (!formData.testSeries) {
      toast.error('Please select a test series - all quizzes must belong to a test series');
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

      // Prepare data for submission
      const submitData = {
        ...formData
      };

      let savedQuiz;
      if (isEditing) {
        const response = await quizAPI.updateQuiz(quizId, submitData);
        savedQuiz = response.data.data;
        toast.success('Quiz updated successfully');
      } else {
        const response = await quizAPI.createQuiz(submitData);
        savedQuiz = response.data.data;
        toast.success('Quiz created successfully');
      }

      // If a section is selected, assign the quiz to that section
      if (formData.section && savedQuiz) {
        try {
          const { testSeriesAPI } = await import('../../services/testSeriesAPI');
          await testSeriesAPI.addQuizToSection(formData.testSeries, formData.section, savedQuiz._id);
          toast.success('Quiz assigned to section successfully');
        } catch (err) {
          console.error('Error assigning quiz to section:', err);
          toast.error('Quiz saved but failed to assign to section');
        }
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
                Test Series <span className="text-red-500">*</span>
              </label>
              <select
                name="testSeries"
                value={formData.testSeries}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select a test series</option>
                {testSeries.map(series => (
                  <option key={series._id} value={series._id}>
                    {series.title}
                    {series.course?.title && (
                      <span className="text-gray-500"> (Course: {series.course.title})</span>
                    )}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                All quizzes must belong to a test series. Test series can optionally be linked to courses.
              </p>
            </div>
          </div>

          {/* Section Selection */}
          {formData.testSeries && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section (Optional)
              </label>
              <div className="flex gap-2">
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">No section (assign to test series directly)</option>
                  {sections.map(section => (
                    <option key={section._id} value={section._id}>
                      {section.title}
                      {section.description && ` - ${section.description.substring(0, 50)}${section.description.length > 50 ? '...' : ''}`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCreateSection(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1"
                  title="Create new section"
                >
                  <FaPlus size={12} />
                  New Section
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sections help organize quizzes within a test series. You can create a new section or leave unassigned.
              </p>
            </div>
          )}

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

          {/* Category and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics, Science, Programming"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.tags || []).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Add tags (press Enter or comma to add)"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Tags help students find your quiz more easily. Use relevant keywords.
            </p>
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
                <option value="Topic Test">Topic Test</option>
                <option value="Subject Test">Subject Test</option>
                <option value="Multi Subject">Multi Subject</option>
                <option value="Full Test">Full Test</option>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-3">
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
              </div>

              <div className="space-y-3">
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

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#00bcd4] focus:ring-[#00bcd4] border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                    <span className="font-medium">Publish immediately</span>
                    <span className="block text-xs text-gray-500">
                      Uncheck to save as draft
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Questions</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowJSONUpload(!showJSONUpload)}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-600 transition-colors"
              >
                <FaFileImport size={14} /> Import JSON
              </button>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-[#00bcd4] text-white px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-[#0097a7] transition-colors"
              >
                <FaPlus size={14} /> Add Question
              </button>
            </div>
          </div>

          {/* JSON Upload Component */}
          {showJSONUpload && (
            <div className="mb-6">
              <QuizJSONUpload onQuestionsImported={handleQuestionsImported} />
            </div>
          )}

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

                  {/* Question Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Image (Optional)
                    </label>
                    <ImageUpload
                      currentImage={question.image}
                      onImageChange={(imageUrl) => handleQuestionImageChange(qIndex, imageUrl)}
                      onImageRemove={() => handleQuestionImageRemove(qIndex)}
                      placeholder="Upload question image"
                      size="medium"
                    />
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

                      <div className="space-y-4">
                        {(question.options || []).map((option, oIndex) => (
                          <div key={oIndex} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-3">
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

                            {/* Option Image Upload */}
                            <div className="ml-6">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Option Image (Optional)
                              </label>
                              <ImageUpload
                                currentImage={option.image}
                                onImageChange={(imageUrl) => handleOptionImageChange(qIndex, oIndex, imageUrl)}
                                onImageRemove={() => handleOptionImageRemove(qIndex, oIndex)}
                                placeholder="Upload option image"
                                size="small"
                              />
                            </div>
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

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              {formData.isPublished ? (
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  This quiz will be published and visible to students
                </div>
              ) : (
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  This quiz will be saved as a draft
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/quizzes')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0097a7] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>
                      {isEditing ? 'Update Quiz' : (formData.isPublished ? 'Create & Publish' : 'Save as Draft')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Create Section Modal */}
      {showCreateSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Section</h3>
              <button
                onClick={() => {
                  setShowCreateSection(false);
                  setNewSectionData({ title: '', description: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSectionData.title}
                  onChange={(e) => setNewSectionData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Chapter 1: Introduction"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newSectionData.description}
                  onChange={(e) => setNewSectionData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                  placeholder="Brief description of this section..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowCreateSection(false);
                  setNewSectionData({ title: '', description: '' });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSection}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1"
              >
                <FaPlus size={12} />
                Create Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizForm;