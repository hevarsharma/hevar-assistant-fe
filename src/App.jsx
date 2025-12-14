import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import DocumentManager from "./pages/DocumentManager";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* 🔐 Protected Route Wrapper */
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 🔓 Public Routes (Same UI, different tabs) */}
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* 🔐 Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentManager />
              </ProtectedRoute>
            }
          />

          {/* 🧭 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
