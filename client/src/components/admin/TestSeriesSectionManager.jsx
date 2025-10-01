import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaGripVertical, 
  FaChevronDown, 
  FaChevronRight,
  FaSave,
  FaTimes,
  FaBook,
  FaListOl
} from 'react-icons/fa';
import { testSeriesAPI } from '../../services/testSeriesAPI';
import { quizAPI } from '../../services/quizAPI';
import { toast } from 'react-hot-toast';

const TestSeriesSectionManager = ({ testSeriesId, testSeries, onUpdate }) => {
  const [sections, setSections] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [editingSection, setEditingSection] = useState(null);
  const [newSection, setNewSection] = useState({ title: '', description: '' });
  const [showAddSection, setShowAddSection] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (testSeries) {
      setSections(testSeries.sections?.sort((a, b) => (a.order || 0) - (b.order || 0)) || []);
      fetchAvailableQuizzes();
    }
  }, [testSeries]);

  const fetchAvailableQuizzes = async () => {
    try {
      const response = await quizAPI.getAllQuizzes();
      // Filter quizzes that belong to this test series but are not in any section
      const allQuizzes = response.data.data || [];
      
      // Handle both populated and non-populated testSeries references
      const testSeriesQuizzes = allQuizzes.filter(quiz => {
        const quizTestSeriesId = typeof quiz.testSeries === 'object' 
          ? quiz.testSeries?._id 
          : quiz.testSeries;
        return quizTestSeriesId === testSeriesId;
      });
      
      // Also include quizzes from the legacy quizzes array
      const legacyQuizIds = new Set(testSeries.quizzes?.map(q => typeof q === 'object' ? q._id : q) || []);
      const legacyQuizzes = allQuizzes.filter(quiz => legacyQuizIds.has(quiz._id));
      
      // Combine both sources and remove duplicates
      const allTestSeriesQuizzes = [...testSeriesQuizzes];
      legacyQuizzes.forEach(quiz => {
        if (!allTestSeriesQuizzes.find(q => q._id === quiz._id)) {
          allTestSeriesQuizzes.push(quiz);
        }
      });
      
      const quizzesInSections = new Set();
      testSeries.sections?.forEach(section => {
        section.quizzes?.forEach(quiz => {
          const quizId = typeof quiz === 'object' ? quiz._id : quiz;
          quizzesInSections.add(quizId);
        });
      });

      const available = allTestSeriesQuizzes.filter(quiz => 
        !quizzesInSections.has(quiz._id)
      );
      
      console.log('Available quizzes for sections:', available);
      setAvailableQuizzes(available);
    } catch (error) {
      console.error('Error fetching available quizzes:', error);
      toast.error('Failed to fetch available quizzes');
    }
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAddSection = async () => {
    if (!newSection.title.trim()) {
      toast.error('Section title is required');
      return;
    }

    setLoading(true);
    try {
      console.log('Adding section:', { testSeriesId, section: newSection });
      const response = await testSeriesAPI.addSection(testSeriesId, {
        title: newSection.title,
        description: newSection.description,
        order: sections.length
      });
      console.log('Add section response:', response);
      
      setNewSection({ title: '', description: '' });
      setShowAddSection(false);
      toast.success('Section added successfully');
      onUpdate();
    } catch (error) {
      console.error('Error adding section:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add section';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = async (sectionId, updates) => {
    setLoading(true);
    try {
      await testSeriesAPI.updateSection(testSeriesId, sectionId, updates);
      toast.success('Section updated successfully');
      setEditingSection(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId, sectionTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${sectionTitle}"? Quizzes will be moved back to the main list.`)) {
      return;
    }

    setLoading(true);
    try {
      await testSeriesAPI.deleteSection(testSeriesId, sectionId);
      toast.success('Section deleted successfully');
      onUpdate();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuizToSection = async (sectionId, quizId) => {
    setLoading(true);
    try {
      console.log('Adding quiz to section:', { testSeriesId, sectionId, quizId });
      const response = await testSeriesAPI.addQuizToSection(testSeriesId, sectionId, quizId);
      console.log('Add quiz to section response:', response);
      toast.success('Quiz added to section');
      onUpdate();
      fetchAvailableQuizzes();
    } catch (error) {
      console.error('Error adding quiz to section:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add quiz to section';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveQuizFromSection = async (sectionId, quizId) => {
    setLoading(true);
    try {
      await testSeriesAPI.removeQuizFromSection(testSeriesId, sectionId, quizId);
      toast.success('Quiz removed from section');
      onUpdate();
      fetchAvailableQuizzes();
    } catch (error) {
      console.error('Error removing quiz from section:', error);
      toast.error('Failed to remove quiz from section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Section Management</h3>
        <button
          onClick={() => setShowAddSection(true)}
          className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors flex items-center gap-2"
          disabled={loading}
        >
          <FaPlus />
          Add Section
        </button>
      </div>

      {/* Add New Section Form */}
      {showAddSection && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Add New Section</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Title *
              </label>
              <input
                type="text"
                value={newSection.title}
                onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                placeholder="e.g., Chapter 1: Introduction"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newSection.description}
                onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                rows="2"
                placeholder="Optional description for this section"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddSection}
                disabled={loading}
                className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors flex items-center gap-2"
              >
                <FaSave />
                Save Section
              </button>
              <button
                onClick={() => {
                  setShowAddSection(false);
                  setNewSection({ title: '', description: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <FaBook className="text-gray-400 text-4xl mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Sections Yet</h4>
            <p className="text-gray-600 mb-4">
              Create sections to organize your tests into chapters or topics for better navigation.
            </p>
            <button
              onClick={() => setShowAddSection(true)}
              className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors flex items-center gap-2 mx-auto"
            >
              <FaPlus />
              Add First Section
            </button>
          </div>
        ) : (
          sections.map((section, index) => {
            const isExpanded = expandedSections.has(section._id);
            const isEditing = editingSection === section._id;

            return (
              <div key={section._id} className="bg-white border border-gray-200 rounded-lg">
                {/* Section Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <FaGripVertical className="text-gray-400 cursor-move" />
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="flex items-center gap-2 text-left"
                    >
                      {isExpanded ? (
                        <FaChevronDown className="text-gray-400" />
                      ) : (
                        <FaChevronRight className="text-gray-400" />
                      )}
                      <div className="w-8 h-8 bg-[#00bcd4] text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                    </button>
                    <div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            defaultValue={section.title}
                            className="font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                            onBlur={(e) => {
                              if (e.target.value !== section.title) {
                                handleUpdateSection(section._id, { title: e.target.value });
                              } else {
                                setEditingSection(null);
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-900">{section.title}</h4>
                          {section.description && (
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mr-4">
                      <div className="flex items-center gap-1">
                        <FaListOl />
                        <span>{section.quizzes?.length || 0} tests</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingSection(isEditing ? null : section._id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section._id, section.title)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      disabled={loading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-4">
                    <div className="space-y-3">
                      {/* Quizzes in Section */}
                      {section.quizzes?.map((quiz) => (
                        <div
                          key={quiz._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h5 className="font-medium text-gray-900">{quiz.title}</h5>
                            <p className="text-sm text-gray-600">
                              {quiz.questions?.length || 0} questions • {quiz.timeLimit || 0} min
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveQuizFromSection(section._id, quiz._id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            disabled={loading}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}

                      {/* Add Quiz to Section */}
                      {availableQuizzes.length > 0 && (
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Add Quiz to Section:</h6>
                          <div className="space-y-2">
                            {availableQuizzes.map((quiz) => (
                              <div
                                key={quiz._id}
                                className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded"
                              >
                                <div>
                                  <span className="font-medium text-gray-900">{quiz.title}</span>
                                  <span className="text-sm text-gray-600 ml-2">
                                    ({quiz.questions?.length || 0} questions)
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleAddQuizToSection(section._id, quiz._id)}
                                  className="text-[#00bcd4] hover:text-[#0097a7] transition-colors"
                                  disabled={loading}
                                >
                                  <FaPlus />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Available Quizzes (not in any section) */}
      {availableQuizzes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-3">
            Unorganized Tests ({availableQuizzes.length})
          </h4>
          <p className="text-sm text-yellow-700 mb-3">
            These tests are not assigned to any section. Consider organizing them into sections for better user navigation.
          </p>
          <div className="space-y-2">
            {availableQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="flex items-center justify-between p-2 bg-white border border-yellow-200 rounded"
              >
                <div>
                  <span className="font-medium text-gray-900">{quiz.title}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({quiz.questions?.length || 0} questions)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSeriesSectionManager;