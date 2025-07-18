import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";
import React, { useMemo } from "react";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

const App = () => {
  const router = useMemo(() => createBrowserRouter(routes), []);

  // Google OAuth client ID from Google Cloud Console
  // This client ID should be configured with JavaScript origins for both:
  // - http://localhost:5174 (for development)
  // - https://learn.sukoonsphere.org (for production)

  // Get the Google Client ID from environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  // For development, you can use a placeholder client ID if none is provided
  // This ensures the GoogleOAuthProvider is always present, even if the actual login won't work
  const clientId = googleClientId || "placeholder-client-id.apps.googleusercontent.com";

  // Always render with GoogleOAuthProvider to avoid the "must be used within GoogleOAuthProvider" error
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
