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
  {
    path: "courses/:courseId/video/:videoId",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <CourseVideoPlayerPage />
      </Suspense>
    ),
  },
];
