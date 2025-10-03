import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import TestSeriesLeaderboard from './TestSeriesLeaderboard';
import { useAuth } from '../context/AuthContext';
import { testSeriesAPI } from '../services/testSeriesAPI';

// Mock dependencies
vi.mock('../context/AuthContext');
vi.mock('../services/testSeriesAPI');
vi.mock('react-hot-toast', () => ({
  toast: {
    loading: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockLeaderboardData = {
  data: {
    data: {
      leaderboard: [
        {
          rank: 1,
          user: { id: '1', username: 'user1', fullName: 'User One' },
          averagePercentage: 95,
          completionPercentage: 100,
          completedQuizzes: 5,
          totalQuizzes: 5,
          totalTimeSpent: 3600,
          averageTimePerQuiz: 720,
        },
        {
          rank: 2,
          user: { id: '2', username: 'user2', fullName: 'User Two' },
          averagePercentage: 90,
          completionPercentage: 80,
          completedQuizzes: 4,
          totalQuizzes: 5,
          totalTimeSpent: 2880,
          averageTimePerQuiz: 720,
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalEntries: 2,
        hasNext: false,
        hasPrev: false,
      },
      userPosition: null,
    },
  },
};

describe('TestSeriesLeaderboard', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      currentUser: null,
    });
    testSeriesAPI.getPublicTestSeriesLeaderboard.mockResolvedValue(mockLeaderboardData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders leaderboard with pagination controls', async () => {
    render(<TestSeriesLeaderboard testSeriesId="test-series-1" />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    // Check if pagination info is displayed
    expect(screen.getByText(/Showing 1-2 of 2/)).toBeInTheDocument();
  });

  it('shows expand/compact toggle', async () => {
    render(<TestSeriesLeaderboard testSeriesId="test-series-1" />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    // Check for expand button
    const expandButton = screen.getByRole('button', { name: /expand/i });
    expect(expandButton).toBeInTheDocument();
  });

  it('handles pagination correctly', async () => {
    const multiPageData = {
      ...mockLeaderboardData,
      data: {
        ...mockLeaderboardData.data,
        data: {
          ...mockLeaderboardData.data.data,
          pagination: {
            currentPage: 1,
            totalPages: 2,
            totalEntries: 10,
            hasNext: true,
            hasPrev: false,
          },
        },
      },
    };

    testSeriesAPI.getPublicTestSeriesLeaderboard.mockResolvedValue(multiPageData);

    render(<TestSeriesLeaderboard testSeriesId="test-series-1" />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    // Check pagination controls
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });
});