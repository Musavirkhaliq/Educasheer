import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCog, FaList, FaBook } from 'react-icons/fa';
import { testSeriesAPI } from '../../services/testSeriesAPI';
import { toast } from 'react-hot-toast';
import TestSeriesForm from './TestSeriesForm';
import TestSeriesSectionManager from './TestSeriesSectionManager';

const TestSeriesEditPage = () => {
  const { testSeriesId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [testSeries, setTestSeries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestSeries();
  }, [testSeriesId]);

  const fetchTestSeries = async () => {
    try {
      setLoading(true);
      const response = await testSeriesAPI.getTestSeriesById(testSeriesId);
      setTestSeries(response.data.data);
    } catch (error) {
      console.error('Error fetching test series:', error);
      toast.error('Failed to load test series');
      navigate('/admin/test-series');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSeriesUpdate = () => {
    fetchTestSeries();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (!testSeries) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Series Not Found</h2>
        <p className="text-gray-600 mb-4">The test series you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/admin/test-series')}
          className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors"
        >
          Back to Test Series
        </button>
      </div>
    );
  }

  const tabs = [
    {
      id: 'details',
      label: 'Details',
      icon: FaCog,
      description: 'Edit basic information and settings'
    },
    {
      id: 'sections',
      label: 'Sections',
      icon: FaList,
      description: 'Organize tests into sections/chapters'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/test-series')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaBook className="text-[#00bcd4]" />
                {testSeries.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {testSeries.totalQuizzes} tests • {testSeries.totalQuestions} questions • {testSeries.estimatedDuration} min
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              testSeries.isPublished 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {testSeries.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#00bcd4] text-[#00bcd4]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Descriptions */}
        <div className="px-6 py-3 bg-gray-50">
          <p className="text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'details' && (
          <div className="p-6">
            <TestSeriesForm 
              isEditing={true} 
              onUpdate={handleTestSeriesUpdate}
            />
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="p-6">
            <TestSeriesSectionManager
              testSeriesId={testSeriesId}
              testSeries={testSeries}
              onUpdate={handleTestSeriesUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSeriesEditPage;