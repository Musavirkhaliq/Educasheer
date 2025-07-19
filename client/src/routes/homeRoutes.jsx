import React, { Suspense } from "react";
import Home from "../pages/Home";
import TutorApplication from "../pages/TutorApplication";
import AdminDashboard from "../pages/AdminDashboard";
import VideosPage from "../pages/VideosPage";
import VideoUploadPage from "../pages/VideoUploadPage";
import VideoDetailPage from "../pages/VideoDetailPage";
import VideoEditPage from "../pages/VideoEditPage";
import CoursesPage from "../pages/CoursesPage";
import CourseCreatePage from "../pages/CourseCreatePage";
import CourseDetailPage from "../pages/CourseDetailPage";
import CourseEditPage from "../pages/CourseEditPage";
import CourseVideoPlayerPage from "../pages/CourseVideoPlayerPage";
import ProgramsPage from "../pages/ProgramsPage";
import MaterialUploadPage from "../pages/MaterialUploadPage";
import ProgramCreatePage from "../pages/ProgramCreatePage";
import ProgramDetailPage from "../pages/ProgramDetailPage";
import ProgramEditPage from "../pages/ProgramEditPage";
import ProfilePage from "../pages/ProfilePage";
import BlogsPage from "../pages/BlogsPage";
import BlogDetailPage from "../pages/BlogDetailPage";
import BlogCreatePage from "../pages/BlogCreatePage";
import BlogEditPage from "../pages/BlogEditPage";
import QRScannerTestPage from "../pages/QRScannerTestPage";
import InvoiceView from "../components/admin/InvoiceView";
import TestimonialPage from "../pages/TestimonialPage";
import CentersPage from "../pages/CentersPage";
import QuizManagementPage from "../pages/QuizManagementPage";
import QuizCreatePage from "../pages/QuizCreatePage";
import QuizEditPage from "../pages/QuizEditPage";
import QuizTakerPage from "../pages/QuizTakerPage";
import QuizDetailsPage from "../pages/QuizDetailsPage";
import QuizResultsPage from "../pages/QuizResultsPage";
import QuizAttemptsPage from "../pages/QuizAttemptsPage";
import CenterDetailPage from "../pages/CenterDetailPage";
import CenterCreatePage from "../pages/CenterCreatePage";
import CenterEditPage from "../pages/CenterEditPage";
import ContactPage from "../pages/ContactPage";
import GamificationPage from "../pages/GamificationPage";
import SeatBookingPage from "../pages/SeatBookingPage";
import MyBookingsPage from "../pages/MyBookingsPage";
import QRBookingPage from "../pages/QRBookingPage";
import QuizzesExamsPage from '../pages/QuizzesExamsPage';
import ExamsPage from '../pages/ExamsPage';
import CategoryManagementPage from '../pages/CategoryManagementPage';

export const homeRoutes = [
  {
    index: true,
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "become-tutor",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <TutorApplication />
      </Suspense>
    ),
  },
  {
    path: "admin",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <AdminDashboard />
      </Suspense>
    ),
  },
  {
    path: "admin/dashboard",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <AdminDashboard />
      </Suspense>
    ),
  },
  // Video routes
  {
    path: "videos",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <VideosPage />
      </Suspense>
    ),
  },
  {
    path: "videos/upload",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <VideoUploadPage />
      </Suspense>
    ),
  },
  {
    path: "videos/:videoId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <VideoDetailPage />
      </Suspense>
    ),
  },
  {
    path: "videos/edit/:videoId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <VideoEditPage />
      </Suspense>
    ),
  },
  // Course routes
  {
    path: "courses",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CoursesPage />
      </Suspense>
    ),
  },
  {
    path: "courses/create",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CourseCreatePage />
      </Suspense>
    ),
  },
  {
    path: "courses/:courseId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CourseDetailPage />
      </Suspense>
    ),
  },
  {
    path: "courses/edit/:courseId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CourseEditPage />
      </Suspense>
    ),
  },

  // Program routes
  {
    path: "programs",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <ProgramsPage />
      </Suspense>
    ),
  },
  {
    path: "programs/create",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <ProgramCreatePage />
      </Suspense>
    ),
  },
  {
    path: "programs/:programId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <ProgramDetailPage />
      </Suspense>
    ),
  },
  {
    path: "programs/edit/:programId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <ProgramEditPage />
      </Suspense>
    ),
  },
  {
    path: "courses/:courseId/video/:videoId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CourseVideoPlayerPage />
      </Suspense>
    ),
  },
  // Material routes
  {
    path: "videos/:videoId/materials/add",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <MaterialUploadPage />
      </Suspense>
    ),
  },
  {
    path: "courses/:courseId/materials/add",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <MaterialUploadPage />
      </Suspense>
    ),
  },
  // Profile route
  {
    path: "profile",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <ProfilePage />
      </Suspense>
    ),
  },
  // Blog routes
  {
    path: "blogs",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <BlogsPage />
      </Suspense>
    ),
  },
  {
    path: "blogs/create",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <BlogCreatePage />
      </Suspense>
    ),
  },
  {
    path: "blogs/:slug",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <BlogDetailPage />
      </Suspense>
    ),
  },
  // QR Code Test route
  {
    path: "qr-test",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <QRScannerTestPage />
      </Suspense>
    ),
  },
  {
    path: "blogs/edit/:blogId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <BlogEditPage />
      </Suspense>
    ),
  },
  // Invoice routes
  {
    path: "admin/invoice/:invoiceId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <InvoiceView />
      </Suspense>
    ),
  },
  // Testimonial routes
  {
    path: "testimonials/add",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <TestimonialPage />
      </Suspense>
    ),
  },
  // Center routes
  {
    path: "centers",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CentersPage />
      </Suspense>
    ),
  },
  {
    path: "centers/create",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CenterCreatePage />
      </Suspense>
    ),
  },
  {
    path: "centers/:centerId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CenterDetailPage />
      </Suspense>
    ),
  },
  {
    path: "centers/:centerId/edit",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CenterEditPage />
      </Suspense>
    ),
  },
  // Contact route
  {
    path: "contact",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <ContactPage />
      </Suspense>
    ),
  },
  // Gamification route
  {
    path: "gamification",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <GamificationPage />
      </Suspense>
    ),
  },
  // Quiz management routes (admin)
  {
    path: "admin/quizzes",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <QuizManagementPage />
      </Suspense>
    ),
  },
  {
    path: "admin/quizzes/create",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <QuizCreatePage />
      </Suspense>
    ),
  },
  {
    path: "admin/quizzes/edit/:quizId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <QuizEditPage />
      </Suspense>
    ),
  },
  // Category management routes (admin)
  {
    path: "admin/categories",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CategoryManagementPage />
      </Suspense>
    ),
  },
  // Quiz routes (student)
  {
    path: "courses/:courseId/quizzes/:quizId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <QuizDetailsPage />
      </Suspense>
    ),
  },
  {
    path: "courses/:courseId/quizzes/:quizId/take",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <QuizTakerPage />
      </Suspense>
    ),
  },
  {
    path: "courses/:courseId/quizzes/:quizId/results/:attemptId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <QuizResultsPage />
      </Suspense>
    ),
  },
  {
    path: "courses/:courseId/quizzes/:quizId/attempts",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <QuizAttemptsPage />
      </Suspense>
    ),
  },
  // Seat booking routes
  {
    path: "seat-booking",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <SeatBookingPage />
      </Suspense>
    ),
  },
  {
    path: "seat-booking/:centerId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <SeatBookingPage />
      </Suspense>
    ),
  },
  {
    path: "my-bookings",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <MyBookingsPage />
      </Suspense>
    ),
  },
  // QR booking route
  {
    path: "qr-booking",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <QRBookingPage />
      </Suspense>
    ),
  },
  {
    path: "quizzes-exams",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <QuizzesExamsPage />
      </Suspense>
    ),
  },
  {
    path: "exams",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <ExamsPage />
      </Suspense>
    ),
  },
];
