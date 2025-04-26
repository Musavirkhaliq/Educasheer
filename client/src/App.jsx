import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";
import React, { useMemo } from "react";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  const router = useMemo(() => createBrowserRouter(routes), []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
