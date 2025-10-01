import React, { useState, useEffect } from 'react';
import { testSeriesAPI } from '../../services/testSeriesAPI';
import { toast } from 'react-hot-toast';

const TestSectionDebug = () => {
  const [testSeries, setTestSeries] = useState([]);
  const [selectedTestSeries, setSelectedTestSeries] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTestSeries();
  }, []);

  const fetchTestSeries = async () => {
    try {
      const response = await testSeriesAPI.getAllTestSeries();
      setTestSeries(response.data.data || []);
    } catch (error) {
      console.error('Error fetching test series:', error);
      toast.error('Failed to fetch test series');
    }
  };

  const testAddSection = async () => {
    if (!selectedTestSeries) {
      toast.error('Please select a test series first');
      return;
    }

    setLoading(true);
    try {
      console.log('Testing add section for test series:', selectedTestSeries);
      const response = await testSeriesAPI.addSection(selectedTestSeries, {
        title: 'Test Section ' + Date.now(),
        description: 'This is a test section created at ' + new Date().toLocaleString(),
        order: 0
      });
      
      console.log('Add section response:', response);
      toast.success('Section added successfully!');
    } catch (error) {
      console.error('Error adding section:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      toast.error(`Failed to add section: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetTestSeries = async () => {
    if (!selectedTestSeries) {
      toast.error('Please select a test series first');
      return;
    }

    setLoading(true);
    try {
      const response = await testSeriesAPI.getTestSeriesById(selectedTestSeries);
      console.log('Test series with sections:', response.data.data);
      toast.success('Test series fetched successfully! Check console for details.');
    } catch (error) {
      console.error('Error fetching test series:', error);
      toast.error(`Failed to fetch test series: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAddQuizToSection = async () => {
    if (!selectedTestSeries) {
      toast.error('Please select a test series first');
      return;
    }

    setLoading(true);
    try {
      // First get the test series to find sections and quizzes
      const tsResponse = await testSeriesAPI.getTestSeriesById(selectedTestSeries);
      const testSeriesData = tsResponse.data.data;
      
      if (!testSeriesData.sections || testSeriesData.sections.length === 0) {
        toast.error('No sections found. Add a section first.');
        return;
      }

      if (!testSeriesData.quizzes || testSeriesData.quizzes.length === 0) {
        toast.error('No quizzes found in this test series.');
        return;
      }

      const firstSection = testSeriesData.sections[0];
      const firstQuiz = testSeriesData.quizzes[0];

      console.log('Testing add quiz to section:', {
        testSeriesId: selectedTestSeries,
        sectionId: firstSection._id,
        quizId: firstQuiz._id
      });

      const response = await testSeriesAPI.addQuizToSection(
        selectedTestSeries,
        firstSection._id,
        firstQuiz._id
      );
      
      console.log('Add quiz to section response:', response);
      toast.success('Quiz added to section successfully!');
    } catch (error) {
      console.error('Error adding quiz to section:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      toast.error(`Failed to add quiz to section: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Test Series Sections Debug</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Test Series
            </label>
            <select
              value={selectedTestSeries}
              onChange={(e) => setSelectedTestSeries(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            >
              <option value="">Choose a test series...</option>
              {testSeries.map(series => (
                <option key={series._id} value={series._id}>
                  {series.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              onClick={testAddSection}
              disabled={loading || !selectedTestSeries}
              className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Test Add Section'}
            </button>

            <button
              onClick={testGetTestSeries}
              disabled={loading || !selectedTestSeries}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Fetching...' : 'Test Get Test Series'}
            </button>

            <button
              onClick={testAddQuizToSection}
              disabled={loading || !selectedTestSeries}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Test Add Quiz to Section'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Select a test series from the dropdown</li>
              <li>Click "Test Add Section" to add a test section</li>
              <li>Click "Test Get Test Series" to fetch the updated test series with sections</li>
              <li>Click "Test Add Quiz to Section" to add a quiz to the first section</li>
              <li>Check the browser console for detailed responses</li>
              <li>Check the browser network tab for API calls</li>
            </ol>
          </div>

          {selectedTestSeries && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Test Series ID:</h4>
              <code className="text-sm text-blue-800">{selectedTestSeries}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSectionDebug;