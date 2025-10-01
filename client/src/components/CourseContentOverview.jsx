import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlay,
  FaVideo,
  FaGraduationCap,
  FaCheckCircle,
  FaBook,
  FaArrowRight,
  FaLock,
  FaTrophy,
  FaChartBar,
  FaStar,
  FaAward
} from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { quizAPI } from '../services/quizAPI';
import { useAuth } from '../context/AuthContext';

const CourseContentOverview = ({ course, isEnrolled, canEdit }) => {
  const { currentUser } = useAuth();
  const [testSeries, setTestSeries] = useState([]);
  const [videoProgress, setVideoProgress] = useState({});
  const [testSeriesProgress, setTestSeriesProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (course) {
      fetchCourseData();
    }
  }, [course, currentUser]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Fetch test series for this course
      const testSeriesResponse = await testSeriesAPI.getTestSeriesByCourse(course._id);
      const testSeriesData = testSeriesResponse.data.data || [];
      setTestSeries(testSeriesData);

      // Fetch progress data if user is enrolled
      if (isEnrolled && currentUser) {
        await fetchProgressData(testSeriesData);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async (testSeriesData) => {
    try {
      // Fetch test series progress
      const tsProgressMap = {};

      for (const ts of testSeriesData) {
        if (ts.quizzes && ts.quizzes.length > 0) {
          let completedQuizzes = 0;
          let totalScore = 0;
          let totalAttempts = 0;

          for (const quiz of ts.quizzes) {
            try {
              const attemptsResponse = await quizAPI.getUserQuizAttempts(quiz._id);
              const attempts = attemptsResponse.data.data || [];

              if (attempts.length > 0) {
                totalAttempts += attempts.length;
                const bestAttempt = attempts.reduce((best, current) =>
                  current.percentage > best.percentage ? current : best
                );

                if (bestAttempt.isCompleted) {
                  completedQuizzes++;
                  totalScore += bestAttempt.percentage;
                }
              }
            } catch (error) {
              console.error(`Error fetching attempts for quiz ${quiz._id}:`, error);
            }
          }

          tsProgressMap[ts._id] = {
            completedQuizzes,
            totalQuizzes: ts.quizzes.length,
            averageScore: completedQuizzes > 0 ? totalScore / completedQuizzes : 0,
            progressPercentage: ts.quizzes.length > 0 ? (completedQuizzes / ts.quizzes.length) * 100 : 0
          };
        }
      }

      setTestSeriesProgress(tsProgressMap);

      // TODO: Fetch video progress from course progress API
      // For now, we'll simulate video progress
      const videoProgressMap = {};
      if (course.videos) {
        course.videos.forEach((video, index) => {
          // Simulate some progress for demo
          videoProgressMap[video._id] = {
            completed: index < 2, // First 2 videos completed
            watchTime: index < 2 ? 100 : Math.random() * 50
          };
        });
      }
      setVideoProgress(videoProgressMap);

    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const calculateOverallProgress = () => {
    const totalVideos = course.videos?.length || 0;
    const totalTestSeries = testSeries.length;
    const totalItems = totalVideos + totalTestSeries;

    if (totalItems === 0) return 0;

    let completedItems = 0;

    // Count completed videos
    if (course.videos) {
      completedItems += course.videos.filter(video =>
        videoProgress[video._id]?.completed
      ).length;
    }

    // Count completed test series (at least 80% of quizzes completed)
    completedItems += testSeries.filter(ts => {
      const progress = testSeriesProgress[ts._id];
      return progress && progress.progressPercentage >= 80;
    }).length;

    return Math.round((completedItems / totalItems) * 100);
  };

  const getNextAction = () => {
    if (!isEnrolled) return null;

    // Find next incomplete video
    const nextVideo = course.videos?.find(video =>
      !videoProgress[video._id]?.completed
    );

    if (nextVideo) {
      return {
        type: 'video',
        title: nextVideo.title,
        link: `/courses/${course._id}/video/${nextVideo._id}`,
        icon: FaPlay
      };
    }

    // Find next incomplete test series
    const nextTestSeries = testSeries.find(ts => {
      const progress = testSeriesProgress[ts._id];
      return !progress || progress.progressPercentage < 100;
    });

    if (nextTestSeries) {
      return {
        type: 'test',
        title: nextTestSeries.title,
        link: `/test-series/${nextTestSeries._id}`,
        icon: FaGraduationCap
      };
    }

    return null;
  };

  const calculateTotalDuration = () => {
    if (!course?.videos) return '0m';

    const totalSeconds = course.videos.reduce((total, video) => {
      const parts = video.duration?.split(':').map(Number);
      let seconds = 0;

      if (parts?.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts?.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      }

      return total + seconds;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getAverageTestScore = () => {
    const scoresWithData = testSeries
      .map(ts => testSeriesProgress[ts._id]?.averageScore)
      .filter(score => score > 0);

    return scoresWithData.length > 0
      ? Math.round(scoresWithData.reduce((sum, score) => sum + score, 0) / scoresWithData.length)
      : 0;
  };



  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-3xl"></div>
          <div className="h-96 bg-gray-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const nextAction = getNextAction();
  const averageScore = getAverageTestScore();

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-2xl mb-4 shadow-sm">
          <FaBook className="text-blue-600 text-xl" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Course Content
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {isEnrolled
            ? "Track your progress and continue your learning journey"
            : "Discover the comprehensive content waiting for you"
          }
        </p>
      </div>

      {/* Enhanced Progress Dashboard - Only for enrolled users */}
      {isEnrolled && (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Progress Overview */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                    <FaTrophy className="text-3xl text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Learning Progress</h3>
                    <div className="text-blue-100 text-sm">
                      {course.videos?.length || 0} videos • {testSeries.length} test series
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative mb-4">
                  <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-4 rounded-full transition-all duration-700 shadow-lg"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-3xl font-bold mb-2">{overallProgress}% Complete</div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FaVideo className="text-blue-200" />
                    <span className="text-sm text-blue-100">Videos</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {course.videos?.filter(v => videoProgress[v._id]?.completed).length || 0}/{course.videos?.length || 0}
                  </div>
                </div>

                {testSeries.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FaAward className="text-purple-200" />
                      <span className="text-sm text-purple-100">Avg Score</span>
                    </div>
                    <div className="text-2xl font-bold">{averageScore}%</div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Action */}
            {nextAction && (
              <Link
                to={nextAction.link}
                className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-2xl font-medium transition-all duration-300 group"
              >
                <nextAction.icon className="group-hover:scale-110 transition-transform" />
                <span>Continue: {nextAction.title}</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Modern Content Cards Grid */}
      <div className={`grid gap-8 ${course.courseType === 'offline' || !course.videos || course.videos.length === 0
          ? 'grid-cols-1 max-w-3xl mx-auto'
          : 'grid-cols-1 lg:grid-cols-2'
        }`}>
        {/* Video Content Card */}
        {course.courseType !== 'offline' && course.videos && course.videos.length > 0 && (
          <div className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <FaVideo className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Video Lessons</h3>
                    <div className="text-blue-100 text-sm flex items-center gap-2">
                      <span>{course.videos.length} lessons</span>
                      <span>•</span>
                      <BiTime className="text-xs" />
                      <span>{calculateTotalDuration()}</span>
                    </div>
                  </div>
                </div>
                {isEnrolled && (
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {course.videos.filter(v => videoProgress[v._id]?.completed).length}
                    </div>
                    <div className="text-xs text-blue-100">completed</div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {isEnrolled ? (
                <>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">
                        {course.videos.filter(v => videoProgress[v._id]?.completed).length}/{course.videos.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${course.videos.length > 0 ?
                            (course.videos.filter(v => videoProgress[v._id]?.completed).length / course.videos.length) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Video List */}
                  <div className="space-y-3 mb-6">
                    {course.videos.slice(0, 4).map((video, index) => (
                      <Link
                        key={video._id}
                        to={`/courses/${course._id}/video/${video._id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 group"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${videoProgress[video._id]?.completed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                          }`}>
                          {videoProgress[video._id]?.completed ? (
                            <FaCheckCircle />
                          ) : (
                            <span className="font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                            {video.title}
                          </div>
                          <div className="text-xs text-gray-500">{video.duration}</div>
                        </div>
                        {!videoProgress[video._id]?.completed && (
                          <FaPlay className="text-blue-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </Link>
                    ))}

                    {course.videos.length > 4 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-gray-500">
                          +{course.videos.length - 4} more videos
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/courses/${course._id}/video/${course.videos[0]._id}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl group"
                  >
                    <FaPlay className="group-hover:scale-110 transition-transform" />
                    {videoProgress[course.videos[0]._id]?.completed ? 'Continue Learning' : 'Start Learning'}
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-2xl p-6 mb-4 inline-block">
                      <FaLock className="text-3xl text-gray-400 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Premium Content</h4>
                    <p className="text-gray-600 mb-4">Enroll to unlock all video lessons</p>
                  </div>
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 py-3 px-6 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    <FaLock />
                    Enroll to Access
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Course Materials Card for Offline Courses */}
        {course.courseType === 'offline' && isEnrolled && (
          <div className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <FaBook className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Course Materials</h3>
                  <div className="text-green-100 text-sm">
                    Notes, assignments, and resources
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center py-8">
                <div className="bg-green-100 rounded-2xl p-6 mb-4 inline-block">
                  <FaBook className="text-3xl text-green-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Study Materials</h4>
                <p className="text-gray-600 mb-6">Access comprehensive course materials and resources</p>

                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl group">
                  <FaBook className="group-hover:scale-110 transition-transform" />
                  View Materials
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Series Card */}
        <div className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <FaGraduationCap className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Test Series</h3>
                  <div className="text-purple-100 text-sm">
                    {testSeries.length} series • {testSeries.reduce((total, ts) => total + (ts.totalQuizzes || 0), 0)} tests
                  </div>
                </div>
              </div>
              {isEnrolled && testSeries.length > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {testSeries.filter(ts => {
                      const progress = testSeriesProgress[ts._id];
                      return progress && progress.progressPercentage >= 80;
                    }).length}
                  </div>
                  <div className="text-xs text-purple-100">completed</div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {testSeries.length > 0 ? (
              <>
                {/* Progress Bar for Enrolled Users */}
                {isEnrolled && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">
                        {testSeries.filter(ts => {
                          const progress = testSeriesProgress[ts._id];
                          return progress && progress.progressPercentage >= 80;
                        }).length}/{testSeries.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${testSeries.length > 0 ?
                            (testSeries.filter(ts => {
                              const progress = testSeriesProgress[ts._id];
                              return progress && progress.progressPercentage >= 80;
                            }).length / testSeries.length) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Test Series List */}
                <div className="space-y-3 mb-6">
                  {testSeries.slice(0, 4).map((ts, index) => {
                    const progress = testSeriesProgress[ts._id];
                    const isCompleted = progress && progress.progressPercentage >= 80;

                    return (
                      <Link
                        key={ts._id}
                        to={`/test-series/${ts._id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all duration-300 group"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${isCompleted
                            ? 'bg-green-100 text-green-600'
                            : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
                          }`}>
                          {isCompleted ? (
                            <FaCheckCircle />
                          ) : (
                            <span className="font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors truncate">
                            {ts.title}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{ts.totalQuizzes || 0} tests</span>
                            {isEnrolled && progress && progress.averageScore > 0 && (
                              <>
                                <span>•</span>
                                <span>{progress.averageScore.toFixed(0)}% avg</span>
                              </>
                            )}
                          </div>
                        </div>
                        {isEnrolled && progress && (
                          <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            {progress.progressPercentage.toFixed(0)}%
                          </div>
                        )}
                      </Link>
                    );
                  })}

                  {testSeries.length > 4 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-500">
                        +{testSeries.length - 4} more test series
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/test-series/${testSeries[0]._id}`}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl group"
                >
                  <FaGraduationCap className="group-hover:scale-110 transition-transform" />
                  {isEnrolled ? 'Start Tests' : 'View Test Series'}
                </Link>
              </>
            ) : (
              <>
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-2xl p-6 mb-4 inline-block">
                    <FaGraduationCap className="text-3xl text-gray-400 mx-auto" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">No Test Series</h4>
                  <p className="text-gray-600 mb-6">Test series will be added soon</p>
                </div>

                {canEdit ? (
                  <Link
                    to="/admin/test-series/create"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl group"
                  >
                    <FaGraduationCap className="group-hover:scale-110 transition-transform" />
                    Create Test Series
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 py-3 px-6 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    <FaGraduationCap />
                    No Tests Available
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Learning Analytics - Only for enrolled users */}
      {isEnrolled && (course.videos?.length > 0 || testSeries.length > 0) && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm mb-4">
              <FaChartBar className="text-blue-600 text-xl" />
              <h3 className="text-xl font-bold text-gray-800">Learning Analytics</h3>
            </div>
            <p className="text-gray-600">Track your progress across all course content</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {course.videos?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 group">
                <div className="bg-blue-100 rounded-xl p-3 mb-4 inline-block group-hover:bg-blue-200 transition-colors">
                  <FaVideo className="text-xl text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {course.videos.filter(v => videoProgress[v._id]?.completed).length}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">Videos Completed</div>
                <div className="text-xs text-gray-500">
                  of {course.videos.length} total lessons
                </div>
              </div>
            )}

            {testSeries.length > 0 && (
              <>
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 group">
                  <div className="bg-purple-100 rounded-2xl p-4 mb-4 inline-block group-hover:bg-purple-200 transition-colors">
                    <FaGraduationCap className="text-2xl text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {testSeries.filter(ts => {
                      const progress = testSeriesProgress[ts._id];
                      return progress && progress.completedQuizzes > 0;
                    }).length}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">Series Started</div>
                  <div className="text-xs text-gray-500">
                    of {testSeries.length} available
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 group">
                  <div className="bg-green-100 rounded-2xl p-4 mb-4 inline-block group-hover:bg-green-200 transition-colors">
                    <FaCheckCircle className="text-2xl text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {testSeries.reduce((total, ts) => {
                      const progress = testSeriesProgress[ts._id];
                      return total + (progress ? progress.completedQuizzes : 0);
                    }, 0)}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">Tests Completed</div>
                  <div className="text-xs text-gray-500">
                    across all series
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 group">
                  <div className="bg-orange-100 rounded-2xl p-4 mb-4 inline-block group-hover:bg-orange-200 transition-colors">
                    <FaTrophy className="text-2xl text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {testSeries.length > 0 ? Math.round(
                      testSeries.reduce((total, ts) => {
                        const progress = testSeriesProgress[ts._id];
                        return total + (progress ? progress.averageScore : 0);
                      }, 0) / testSeries.filter(ts => testSeriesProgress[ts._id]?.averageScore > 0).length
                    ) || 0 : 0}%
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">Average Score</div>
                  <div className="text-xs text-gray-500">
                    across completed tests
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContentOverview;