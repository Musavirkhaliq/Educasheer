import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaChevronDown,
  FaChevronRight,
  FaClock,
  FaQuestionCircle,
  FaPlay,
  FaCheck,
  FaTimes,
  FaBook,
  FaListOl,
  FaTrophy,
  FaChartLine
} from 'react-icons/fa';

const TestSeriesSections = ({ testSeries, testSeriesId, userAttempts = {}, onQuizStart }) => {
  // Auto-expand all sections by default
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  // Update expanded sections when testSeries data changes
  useEffect(() => {
    if (testSeries?.sections) {
      const allSectionIds = new Set();
      testSeries.sections.forEach(section => {
        allSectionIds.add(section._id);
      });
      setExpandedSections(allSectionIds);
    }
  }, [testSeries]);

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleDescription = (sectionId, e) => {
    e.stopPropagation(); // Prevent section collapse/expand
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedDescriptions(newExpanded);
  };

  const getQuizStatus = (quiz) => {
    const attempts = userAttempts[quiz._id];
    if (!attempts || attempts.length === 0) {
      return { status: 'not-attempted', color: 'text-gray-500', icon: FaPlay };
    }

    // Find best attempt
    const bestAttempt = attempts.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );

    // Check if completed and passed
    if (!bestAttempt.isCompleted) {
      return { status: 'not-attempted', color: 'text-gray-500', icon: FaPlay };
    }

    const passed = bestAttempt.isPassed;
    return {
      status: passed ? 'passed' : 'failed',
      color: passed ? 'text-green-600' : 'text-red-600',
      icon: passed ? FaCheck : FaTimes,
      score: Math.round(bestAttempt.percentage * 100) / 100
    };
  };

  const getBestAttempt = (quizId) => {
    const attempts = userAttempts[quizId];
    if (!attempts || attempts.length === 0) return null;

    const bestAttempt = attempts.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );

    return bestAttempt.isCompleted ? bestAttempt : null;
  };

  // Calculate section progress - matching TestSeriesProgress logic
  const getSectionProgress = (section) => {
    const sectionQuizzes = section.quizzes || [];
    if (sectionQuizzes.length === 0) {
      return { completed: 0, passed: 0, total: 0, percentage: 0, averageScore: 0 };
    }

    let completedCount = 0;
    let passedCount = 0;
    let totalScore = 0;
    let totalMaxScore = 0;

    sectionQuizzes.forEach(quiz => {
      const attempts = userAttempts[quiz._id];
      if (attempts && attempts.length > 0) {
        // Find best attempt - matching parent logic
        const bestAttempt = attempts.reduce((best, current) =>
          (current.percentage || 0) > (best.percentage || 0) ? current : best
        );

        if (bestAttempt.isCompleted) {
          completedCount++;
          totalScore += bestAttempt.score || 0;
          totalMaxScore += bestAttempt.maxScore || 0;
          
          if (bestAttempt.isPassed) {
            passedCount++;
          }
        }
      }
    });

    const averageScore = completedCount > 0 && totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
    const completionPercentage = sectionQuizzes.length > 0 ? (completedCount / sectionQuizzes.length) * 100 : 0;

    return {
      completed: completedCount,
      passed: passedCount,
      total: sectionQuizzes.length,
      percentage: completionPercentage,
      averageScore: Math.round(averageScore * 100) / 100
    };
  };

  // Sort sections by order
  const sortedSections = testSeries.sections?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  const toggleAllSections = () => {
    if (expandedSections.size === sortedSections.length) {
      // All sections are expanded, collapse all
      setExpandedSections(new Set());
    } else {
      // Some or no sections are expanded, expand all
      const allSectionIds = new Set();
      sortedSections.forEach(section => {
        allSectionIds.add(section._id);
      });
      setExpandedSections(allSectionIds);
    }
  };

  // Check if we have sections or just legacy quizzes
  const hasOrganizedSections = sortedSections.length > 0;
  const legacyQuizzes = testSeries.quizzes?.filter(quiz => {
    // Only show quizzes that are not in any section
    return !sortedSections.some(section =>
      section.quizzes?.some(sectionQuiz => sectionQuiz._id === quiz._id)
    );
  }) || [];

  if (!hasOrganizedSections && legacyQuizzes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FaBook className="text-gray-400 text-4xl mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Available</h3>
        <p className="text-gray-600">
          This test series doesn't have any tests yet.
        </p>
      </div>
    );
  }

  // // Calculate overall progress - matching TestSeriesProgress logic
  // const calculateOverallProgress = () => {
  //   let totalTests = 0;
  //   let completedTests = 0;

  //   // Count tests in sections
  //   sortedSections.forEach(section => {
  //     section.quizzes?.forEach(quiz => {
  //       totalTests++;
  //       const attempts = userAttempts[quiz._id];
  //       if (attempts && attempts.length > 0) {
  //         const bestAttempt = attempts.reduce((best, current) =>
  //           (current.percentage || 0) > (best.percentage || 0) ? current : best
  //         );
  //         if (bestAttempt.isCompleted) {
  //           completedTests++;
  //         }
  //       }
  //     });
  //   });

  //   // Count legacy tests
  //   legacyQuizzes.forEach(quiz => {
  //     totalTests++;
  //     const attempts = userAttempts[quiz._id];
  //     if (attempts && attempts.length > 0) {
  //       const bestAttempt = attempts.reduce((best, current) =>
  //         (current.percentage || 0) > (best.percentage || 0) ? current : best
  //       );
  //       if (bestAttempt.isCompleted) {
  //         completedTests++;
  //       }
  //     }
  //   });

  //   return { totalTests, completedTests, percentage: totalTests > 0 ? (completedTests / totalTests) * 100 : 0 };
  // };

  // const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      {/* Overall Progress
      {(hasOrganizedSections || legacyQuizzes.length > 0) && (
        <div className="bg-gradient-to-r from-[#00bcd4] to-[#0097a7] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <FaTrophy className="text-3xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Overall Progress</h3>
                <p className="text-sm opacity-90 mt-1">
                  {overallProgress.completedTests} of {overallProgress.totalTests} tests completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(overallProgress.percentage)}%</div>
              <div className="w-32 bg-white/20 rounded-full h-3 mt-2">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-300 shadow-sm"
                  style={{ width: `${overallProgress.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Section Controls */}
      {hasOrganizedSections && (
        <div className="flex justify-between items-center px-1">
          <div className="text-sm font-medium text-gray-700">
            {sortedSections.length} {sortedSections.length === 1 ? 'section' : 'sections'}
          </div>
          <button
            onClick={toggleAllSections}
            className="text-sm font-medium text-[#00bcd4] hover:text-[#0097a7] transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#00bcd4]/10"
          >
            {expandedSections.size === sortedSections.length ? (
              <>
                <FaChevronRight className="text-xs" />
                Collapse All
              </>
            ) : (
              <>
                <FaChevronDown className="text-xs" />
                Expand All
              </>
            )}
          </button>
        </div>
      )}

      {/* Organized Sections */}
      {sortedSections.map((section, sectionIndex) => {
        const isExpanded = expandedSections.has(section._id);
        const sectionQuizzes = section.quizzes || [];
        const sectionProgress = getSectionProgress(section);
        const isDescriptionExpanded = expandedDescriptions.has(section._id);
        const descriptionLength = section.description?.length || 0;
        const shouldTruncate = descriptionLength > 100;

        return (
          <div key={section._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Section Header */}
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-l-[#00bcd4]"
              onClick={() => toggleSection(section._id)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <FaChevronDown className="text-[#00bcd4] text-lg" />
                  ) : (
                    <FaChevronRight className="text-gray-400 text-lg" />
                  )}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00bcd4] to-[#0097a7] text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-md">
                    {sectionIndex + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                  {section.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {shouldTruncate && !isDescriptionExpanded ? (
                        <>
                          {section.description.substring(0, 100)}...{' '}
                          <button
                            onClick={(e) => toggleDescription(section._id, e)}
                            className="text-[#00bcd4] hover:text-[#0097a7] font-medium inline-flex items-center gap-1"
                          >
                            more
                          </button>
                        </>
                      ) : (
                        <>
                          {section.description}
                          {shouldTruncate && (
                            <>
                              {' '}
                              <button
                                onClick={(e) => toggleDescription(section._id, e)}
                                className="text-[#00bcd4] hover:text-[#0097a7] font-medium inline-flex items-center gap-1"
                              >
                                less
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <FaListOl className="text-[#00bcd4]" />
                  <span className="font-medium">{sectionQuizzes.length} tests</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <FaClock className="text-[#00bcd4]" />
                  <span className="font-medium">
                    {sectionQuizzes.reduce((total, quiz) => total + (quiz.timeLimit || 0), 0)} min
                  </span>
                </div>
              </div>
            </div>

            {/* Section Progress Bar */}
            <div className="px-5 pb-4 border-t border-gray-100">
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <FaChartLine className="text-[#00bcd4]" />
                    <span className="text-sm font-medium text-gray-700">
                      Completed: {sectionProgress.completed}/{sectionProgress.total} tests
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Passed: {sectionProgress.passed}
                    </span>
                  </div>
                  {sectionProgress.averageScore > 0 && (
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-amber-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Avg: {sectionProgress.averageScore}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#00bcd4]">
                    {Math.round(sectionProgress.percentage)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div
                  className="bg-gradient-to-r from-[#00bcd4] to-[#0097a7] rounded-full h-2.5 transition-all duration-300 shadow-sm"
                  style={{ width: `${sectionProgress.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Section Content */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-5 space-y-3">
                  {sectionQuizzes.map((quiz, quizIndex) => {
                    const status = getQuizStatus(quiz);
                    const bestAttempt = getBestAttempt(quiz._id);
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={quiz._id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                            {quizIndex + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-base">{quiz.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                              <div className="flex items-center gap-1.5">
                                <FaQuestionCircle className="text-[#00bcd4]" />
                                <span>{quiz.questions?.length || 0} questions</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FaClock className="text-[#00bcd4]" />
                                <span>{quiz.timeLimit || 0} min</span>
                              </div>
                              {bestAttempt && (
                                <div className={`flex items-center gap-1.5 font-medium ${status.color}`}>
                                  <StatusIcon />
                                  <span>Best: {status.score}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/test-series/${testSeriesId}/quiz/${quiz._id}/take`}
                            className="text-sm font-medium px-4 py-2 bg-[#00bcd4] text-white rounded-lg hover:bg-[#0097a7] transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                          >
                            <FaPlay className="text-xs" />
                            {bestAttempt ? 'Retake' : 'Start'}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Legacy Quizzes (not in sections) */}
      {legacyQuizzes.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-5 border-b border-gray-200 border-l-4 border-l-orange-400 bg-gradient-to-r from-orange-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <FaBook className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Additional Tests</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Tests not organized in sections • {legacyQuizzes.length} {legacyQuizzes.length === 1 ? 'test' : 'tests'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3 bg-gray-50">
            {legacyQuizzes.map((quiz, quizIndex) => {
              const status = getQuizStatus(quiz);
              const bestAttempt = getBestAttempt(quiz._id);
              const StatusIcon = status.icon;

              return (
                <div
                  key={quiz._id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                      {quizIndex + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base">{quiz.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-1.5">
                          <FaQuestionCircle className="text-[#00bcd4]" />
                          <span>{quiz.questions?.length || 0} questions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaClock className="text-[#00bcd4]" />
                          <span>{quiz.timeLimit || 0} min</span>
                        </div>
                        {bestAttempt && (
                          <div className={`flex items-center gap-1.5 font-medium ${status.color}`}>
                            <StatusIcon />
                            <span>Best: {status.score}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/test-series/${testSeriesId}/quiz/${quiz._id}/take`}
                      className="text-sm font-medium px-4 py-2 bg-[#00bcd4] text-white rounded-lg hover:bg-[#0097a7] transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <FaPlay className="text-xs" />
                      {bestAttempt ? 'Retake' : 'Start'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSeriesSections;