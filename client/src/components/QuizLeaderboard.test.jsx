import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import QuizLeaderboard from './QuizLeaderboard';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/quizAPI';

// Mock dependencies
vi.mock('../context/AuthContext');
vi.mock('../services/quizAPI');
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
          user: { _id: '1', username: 'user1', fullName: 'User One' },
          bestPercentage: 95.5,
          bestScore: 19,
          totalAttempts: 3,
          timeSpent: 1200,
        },
        {
          rank: 2,
          user: { _id: '2', username: 'user2', fullName: 'User Two' },
          bestPercentage: 90.0,
          bestScore: 18,
          totalAttempts: 2,
          timeSpent: 1100,
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

// Mock old format (array) response
const mockOldFormatData = {
  data: {
    data: [
      {
        rank: 1,
        user: { _id: '1', username: 'user1', fullName: 'User One' },
        bestPercentage: 95.5,
        bestScore: 19,
        totalAttempts: 3,
      },
      {
        rank: 2,
        user: { _id: '2', username: 'user2', fullName: 'User Two' },
        bestPercentage: 90.0,
        bestScore: 18,
        totalAttempts: 2,
      },
    ],
  },
};

describe('QuizLeaderboard', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      currentUser: null,
    });
    quizAPI.getPublicQuizLeaderboard.mockResolvedValue(mockLeaderboardData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders leaderboard with pagination controls', async () => {
    render(<QuizLeaderboard quizId="quiz-1" />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    // Check if pagination info is displayed
    expect(screen.getByText(/Showing 1-2 of 2/)).toBeInTheDocument();
  });

  it('shows expand/compact toggle', async () => {
    render(<QuizLeaderboard quizId="quiz-1" />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    // Check for expand button
    const expandButton = screen.getByRole('button', { name: /expand/i });
    expect(expandButton).toBeInTheDocument();
  });

  it('handles old format API response (array)', async () => {
    quizAPI.getPublicQuizLeaderboard.mockResolvedValue(mockOldFormatData);

    render(<QuizLeaderboard quizId="quiz-1" />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    // Should still show data even with old format
    expect(screen.getByText('95.5%')).toBeInTheDocument();
    expect(screen.getByText('90.0%')).toBeInTheDocument();
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

    quizAPI.getPublicQuizLeaderboard.mockResolvedValue(multiPageData);

    render(<QuizLeaderboard quizId="quiz-1" />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    // Check pagination controls
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('shows user position when not in displayed list', async () => {
    const dataWithUserPosition = {
      ...mockLeaderboardData,
      data: {
        ...mockLeaderboardData.data,
        data: {
          ...mockLeaderboardData.data.data,
          userPosition: {
            rank: 5,
            bestPercentage: 75.0,
            totalAttempts: 2,
          },
        },
      },
    };

    useAuth.mockReturnValue({
      currentUser: { _id: 'current-user' },
    });

    quizAPI.getQuizLeaderboard.mockResolvedValue(dataWithUserPosition);

    render(<QuizLeaderboard quizId="quiz-1" />);

    await waitFor(() => {
      expect(screen.getByText('Your Position')).toBeInTheDocument();
      expect(screen.getByText('Rank #5')).toBeInTheDocument();
      expect(screen.getByText('75.0%')).toBeInTheDocument();
    });
  });

  it('handles empty leaderboard', async () => {
    const emptyData = {
      data: {
        data: {
          leaderboard: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalEntries: 0,
            hasNext: false,
            hasPrev: false,
          },
          userPosition: null,
        },
      },
    };

    quizAPI.getPublicQuizLeaderboard.mockResolvedValue(emptyData);

    render(<QuizLeaderboard quizId="quiz-1" />);

    await waitFor(() => {
      expect(screen.getByText('No attempts yet')).toBeInTheDocument();
      expect(screen.getByText('Be the first to attempt this quiz!')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    quizAPI.getPublicQuizLeaderboard.mockRejectedValue(new Error('API Error'));

    render(<QuizLeaderboard quizId="quiz-1" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load leaderboard')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });
});