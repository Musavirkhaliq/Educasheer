import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaSpinner } from "react-icons/fa";

const AddFeeForm = ({ users, selectedUser, onSuccess, onCancel, selectedCourseId, disableUserSelection = false }) => {
  const [userId, setUserId] = useState(selectedUser ? selectedUser._id : "");
  const [courseId, setCourseId] = useState(selectedCourseId || "");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [enrollingInCourse, setEnrollingInCourse] = useState(false);

  // Set minimum due date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDueDate = tomorrow.toISOString().split("T")[0];

  // Fetch enrolled courses for the selected user
  useEffect(() => {
    const fetchUserCourses = async () => {
      if (userId) {
        setLoading(true);
        try {
          // For admin, we need to get all courses and filter by enrolled students
          const response = await axios.get(`/api/v1/courses`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          });

          // Get all courses
          const fetchedAllCourses = response.data.data.courses || [];
          setAllCourses(fetchedAllCourses);

          // Filter courses where the user is enrolled
          const userCourses = [];

          // For each course, check if the user is enrolled
          for (const course of fetchedAllCourses) {
            try {
              const courseDetailResponse = await axios.get(`/api/v1/courses/${course._id}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
              });

              const courseDetail = courseDetailResponse.data.data;

              // Check if the user is in enrolledStudents
              if (courseDetail.enrolledStudents &&
                  courseDetail.enrolledStudents.includes(userId)) {
                userCourses.push(courseDetail);
              }
            } catch (error) {
              console.error(`Error fetching course ${course._id}:`, error);
            }
          }

          setCourses(userCourses);

          // If we have a pre-selected course ID, verify it's in the user's courses
          if (selectedCourseId && userCourses.some(course => course._id === selectedCourseId)) {
            setCourseId(selectedCourseId);
          }
        } catch (error) {
          setError("Failed to fetch user's courses");
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCourses();
  }, [userId, selectedCourseId]);

  // Function to enroll a user in a course
  const enrollUserInCourse = async (courseId) => {
    if (!userId || !courseId) {
      setError("User and course are required for enrollment");
      return;
    }

    setEnrollingInCourse(true);
    setError("");

    try {
      // Admin endpoint to enroll a user in a course
      await axios.post(
        `/api/v1/admin/users/${userId}/enroll`,
        { courseId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      // Show success message
      setSuccess(`User successfully enrolled in the course`);

      // Refresh the courses list
      const updatedCourses = [...courses];
      const enrolledCourse = allCourses.find(c => c._id === courseId);

      if (enrolledCourse) {
        updatedCourses.push(enrolledCourse);
        setCourses(updatedCourses);
        setCourseId(courseId); // Select the newly enrolled course
      }

      // Clear success message after a delay
      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to enroll user in the course. Please try again."
      );
    } finally {
      setEnrollingInCourse(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId || !courseId || !amount || !dueDate) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/fees",
        {
          userId,
          courseId,
          amount: parseFloat(amount),
          dueDate,
          description
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      onSuccess(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to create fee. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Student
        </label>
        {disableUserSelection || selectedUser ? (
          <div className="flex items-center bg-gray-100 p-3 rounded">
            <img
              src={selectedUser.avatar}
              alt={selectedUser.fullName}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <div className="font-medium">{selectedUser.fullName}</div>
              <div className="text-sm text-gray-500">{selectedUser.email}</div>
            </div>
          </div>
        ) : (
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          >
            <option value="">Select a student</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.fullName} ({user.email})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Course
        </label>

        {userId && (
          <div className="mb-2 relative">
            <input
              type="text"
              placeholder="Search courses..."
              className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={courseSearchQuery}
              onChange={(e) => setCourseSearchQuery(e.target.value)}
              disabled={loading || !userId}
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
        )}

        {userId && (
          <div className="mb-2 flex items-center">
            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-[#00bcd4] mr-2"
                checked={showAllCourses}
                onChange={() => setShowAllCourses(!showAllCourses)}
                disabled={loading || !userId}
              />
              Show all available courses
            </label>
          </div>
        )}

        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          disabled={loading || !userId}
        >
          <option value="">Select a course</option>
          {(showAllCourses ? allCourses : courses)
            .filter(course =>
              course.title.toLowerCase().includes(courseSearchQuery.toLowerCase())
            )
            .map((course) => {
              const isEnrolled = courses.some(c => c._id === course._id);
              return (
                <option key={course._id} value={course._id}>
                  {course.title} {isEnrolled ? "" : "(Not Enrolled)"}
                </option>
              );
            })
          }
        </select>

        {!userId && (
          <p className="text-sm text-gray-500 mt-1">
            Please select a student first
          </p>
        )}

        {userId && courses.length === 0 && !loading && (
          <p className="text-sm text-red-500 mt-1">
            This student is not enrolled in any courses
          </p>
        )}

        {userId && courseId && !courses.some(c => c._id === courseId) && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => enrollUserInCourse(courseId)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm flex items-center"
              disabled={enrollingInCourse}
            >
              {enrollingInCourse ? (
                <>
                  <FaSpinner className="animate-spin mr-1" /> Enrolling...
                </>
              ) : (
                <>
                  <FaPlus className="mr-1" /> Enroll in this course
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              The student must be enrolled in the course before you can create a fee
            </p>
          </div>
        )}

        {userId && courses.length > 0 && courseSearchQuery &&
         !(showAllCourses ? allCourses : courses).some(course =>
            course.title.toLowerCase().includes(courseSearchQuery.toLowerCase())
          ) && (
          <p className="text-sm text-yellow-500 mt-1">
            No courses match your search
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Amount ($)
        </label>
        <input
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Due Date
        </label>
        <input
          type="date"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={minDueDate}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Description (Optional)
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
        ></textarea>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[#00bcd4] hover:bg-[#01427a] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Fee"}
        </button>
      </div>
    </form>
  );
};

export default AddFeeForm;
