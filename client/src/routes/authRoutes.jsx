import React, { Suspense } from "react";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

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
];
