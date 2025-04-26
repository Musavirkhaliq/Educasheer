import React, { lazy, Suspense } from "react";

import HomeOutlet from "../layouts/HomeOutlet";
import AuthLayout from "../layouts/AuthLayout";
import { homeRoutes } from "./homeRoutes";
import { authRoutes } from "./authRoutes";

export const routes = [
  {
    path: "/",
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <HomeOutlet />
      </Suspense>
    ),
    // Routes that need homeOutlet, meaning pages that need header and footer
    children: [...homeRoutes],
  },
  // Routes that don't need the header and footer
  {
    element: (
      <Suspense fallback={<h1>Loading</h1>}>
        <AuthLayout />
      </Suspense>
    ),
    children: [...authRoutes],
  },
];
