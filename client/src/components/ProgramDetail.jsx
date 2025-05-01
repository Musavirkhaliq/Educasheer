import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaPlay, FaChalkboardTeacher, FaSignal, FaLock } from 'react-icons/fa';
import { FiVideo } from 'react-icons/fi';
import { BiTime, BiCategory } from 'react-icons/bi';
import CommentSection from './comments/CommentSection';

const ProgramDetail = () => {
  const { programId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchProgramDetails = async () => {
      try {
        // Make the request without requiring authentication
        const response = await axios.get(`/api/v1/programs/${programId}`);
        setProgram(response.data.data);
      } catch (error) {
        console.error('Error fetching program details:', error);
        setError(error.response?.data?.message || 'Failed to load program details');
      } finally {
        setLoading(false);
      }
    };

    fetchProgramDetails();
  }, [programId]);

  const handleEnroll = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/programs/${programId}` } });
      return;
    }

    setEnrolling(true);

    try {
      await axios.post(`/api/v1/programs/${programId}/enroll`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Update the program state to reflect enrollment
      setProgram(prev => ({
        ...prev,
        enrolledStudents: [...(prev.enrolledStudents || []), currentUser._id]
      }));

    } catch (error) {
      console.error('Error enrolling in program:', error);
      alert(error.response?.data?.message || 'Failed to enroll in program');
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = () => {
    // Use the isEnrolled flag from the backend if available
    if (program?.isEnrolled !== undefined) {
      return program.isEnrolled;
    }
    // Fallback to the old method
    if (!currentUser || !program) return false;
    return program.enrolledStudents?.some(student => student === currentUser._id);
  };

  const canEdit = () => {
    if (!currentUser || !program) return false;
    return currentUser.role === 'admin' || program.creator?._id === currentUser._id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4] mb-4"></div>
          <p className="text-gray-600">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-lg shadow-sm" role="alert">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-2 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Program Not Found</h3>
          <p className="text-gray-600 mb-4">The program you're looking for doesn't exist or has been removed.</p>
          <Link to="/programs" className="inline-block bg-[#00bcd4] text-white px-5 py-2.5 rounded-lg hover:bg-[#01427a] transition-all duration-300">
            Browse Programs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
      {/* Program Header with Background Image */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${program.thumbnail})`,
            filter: 'blur(2px)',
            transform: 'scale(1.1)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30"></div>
        <div className="absolute inset-0 flex items-center justify-between p-6 md:p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">{program.title}</h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="bg-[#01427a]/90 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {program.level}
              </span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {program.category}
              </span>
            </div>
          </div>

          {canEdit() && (
            <Link
              to={`/programs/edit/${program._id}`}
              className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <FaEdit className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Program Info Section */}
        <div className="lg:col-span-2">
          {!program.isPublished && (
            <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg mb-6 border border-yellow-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>This program is not published yet. Only you can see it.</span>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <img
              src={program.creator?.avatar}
              alt={program.creator?.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#00bcd4]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{program.creator?.fullName}</h3>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">Program Creator</span>
              </div>
              <p className="text-sm text-gray-500">@{program.creator?.username}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 inline-block relative">
              About This Program
              <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#01427a] rounded-full"></span>
            </h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{program.description}</p>
          </div>

          {program.tags?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 inline-block relative">
                Topics Covered
                <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#01427a] rounded-full"></span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {program.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-[#01427a]/10 hover:border-[#01427a]/30 transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Program Courses Section */}
          {program.courses?.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold inline-block relative">
                  Courses in this Program
                  <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#01427a] rounded-full"></span>
                </h2>

                {(isEnrolled() || canEdit()) && (
                  <Link
                    to={`/courses/${program.courses[0]._id}`}
                    className="bg-[#00bcd4] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <FaPlay className="w-4 h-4" />
                    Start Learning
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {program.courses.map((course, index) => (
                  <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 lg:w-1/4">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <div className="p-5 flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                {course.level}
                              </span>
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                <FiVideo className="w-3 h-3" />
                                {course.videos?.length || 0} videos
                              </span>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-[#01427a]">
                            {index + 1}/{program.courses.length}
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                        {(isEnrolled() || canEdit()) ? (
                          <Link
                            to={`/courses/${course._id}`}
                            className="inline-block bg-[#00bcd4]/10 text-[#00bcd4] px-4 py-2 rounded-lg hover:bg-[#00bcd4]/20 transition-all duration-300 text-sm font-medium"
                          >
                            View Course
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <FaLock className="w-4 h-4" />
                            <span className="text-sm">Enroll in program to access</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Section */}
        <div className="lg:pl-6">
          <div className="sticky top-20">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-[#01427a]">${program.price.toFixed(2)}</span>
                    {program.originalPrice > program.price && (
                      <span className="text-lg text-gray-400 line-through ml-2">${program.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  {program.price === 0 && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Free</span>
                  )}
                </div>

                {isEnrolled() ? (
                  <div className="mb-6">
                    <button
                      className="w-full bg-green-500 text-white py-3.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default shadow-sm"
                      disabled
                    >
                      <FaPlay className="w-4 h-4" />
                      Enrolled
                    </button>
                    <Link
                      to={`/courses/${program.courses[0]?._id}`}
                      className="w-full mt-3 bg-[#00bcd4] text-white py-3.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
                    >
                      <FaPlay className="w-4 h-4" />
                      Continue Learning
                    </Link>
                  </div>
                ) : (
                  <div className="mb-6">
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling || !program.isPublished}
                      className={`w-full py-3.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-300 ${
                        !program.isPublished
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#01427a] text-white hover:bg-[#01427a]/80'
                      }`}
                    >
                      {enrolling ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                          Enroll in Program
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!program.isPublished && (
                  <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg mb-6 border border-yellow-200 flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>This program is not published yet</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#01427a]/10 p-2 rounded-lg">
                      <FaChalkboardTeacher className="w-5 h-5 text-[#01427a]" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Courses</p>
                      <p className="font-medium">{program.courses?.length || 0} courses</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-[#01427a]/10 p-2 rounded-lg">
                      <BiTime className="w-5 h-5 text-[#01427a]" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Duration</p>
                      <p className="font-medium">{program.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-[#01427a]/10 p-2 rounded-lg">
                      <FaSignal className="w-5 h-5 text-[#01427a]" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Level</p>
                      <p className="font-medium">{program.level}</p>
                    </div>
                  </div>

                  {program.enrolledStudents?.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="bg-[#01427a]/10 p-2 rounded-lg">
                        <FaChalkboardTeacher className="w-5 h-5 text-[#01427a]" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Students</p>
                        <p className="font-medium">{program.enrolledStudents.length} enrolled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <div className="mt-12 px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 inline-block relative">
            Discussion
            <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#01427a] rounded-full"></span>
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <CommentSection programId={program._id} type="program" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
