import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

const AddFeeForm = ({ users, selectedUser, onSuccess, onCancel, selectedCourseId, disableUserSelection = false }) => {
  const [userId, setUserId] = useState(selectedUser ? selectedUser._id : "");
  const [courseId, setCourseId] = useState(selectedCourseId || "");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");

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
          const allCourses = response.data.data.courses || [];

          // Filter courses where the user is enrolled
          const userCourses = [];

          // For each course, check if the user is enrolled
          for (const course of allCourses) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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

        {userId && courses.length > 0 && (
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

        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          disabled={loading || !userId}
        >
          <option value="">Select a course</option>
          {courses
            .filter(course =>
              course.title.toLowerCase().includes(courseSearchQuery.toLowerCase())
            )
            .map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))
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
        {userId && courses.length > 0 && courseSearchQuery &&
         !courses.some(course => course.title.toLowerCase().includes(courseSearchQuery.toLowerCase())) && (
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
