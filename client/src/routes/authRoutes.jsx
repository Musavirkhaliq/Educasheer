import React, { Suspense } from "react";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

export const authRoutes = [
  {
    path: "login",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "signup",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <Signup />
      </Suspense>
    ),
  },
  {
    path: "verify-email",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <VerifyEmail />
      </Suspense>
    ),
  },
  {
    path: "forgot-password",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <ForgotPassword />
      </Suspense>
    ),
  },
  {
    path: "reset-password",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <ResetPassword />
      </Suspense>
    ),
  },
];
