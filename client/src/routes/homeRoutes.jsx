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
];
