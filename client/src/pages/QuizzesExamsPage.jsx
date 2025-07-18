import React, { useState, useEffect } from 'react';
import { quizAPI } from '../services/quizAPI';

const categories = [
  '', 'NEET', 'Physics', 'Chemistry', 'Biology', 'Maths', 'JEE', 'General Knowledge', 'Other'
];

const QuizzesExamsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState(''); // quiz or exam
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line
  }, [search, category, type]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (type) params.type = type;
      const response = await quizAPI.getAllQuizzes(params);
      setQuizzes(response.data.data || []);
    } catch (err) {
      setError('Failed to load quizzes/exams.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Find Quizzes & Exams</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-1/3"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-1/4"
        >
          <option value="">All Categories</option>
          {categories.filter(c => c).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-1/4"
        >
          <option value="">All Types</option>
          <option value="quiz">Quiz</option>
          <option value="exam">Exam</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-red-600 py-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No quizzes or exams found.</div>
          ) : quizzes.map(quiz => (
            <div key={quiz._id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-lg mb-1">{quiz.title}</h3>
              <div className="text-sm text-gray-600 mb-2">{quiz.description}</div>
              <div className="flex flex-wrap gap-2 text-xs mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{quiz.quizType === 'quiz' ? 'Quiz' : 'Exam'}</span>
                {quiz.category && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">{quiz.category}</span>}
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{quiz.questions?.length || 0} questions</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{quiz.timeLimit} min</span>
              </div>
              <button className="mt-2 bg-[#00bcd4] text-white px-4 py-1 rounded hover:bg-[#0097a7]">View</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizzesExamsPage; 