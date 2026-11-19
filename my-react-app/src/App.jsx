import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./useAuth";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ChangePassword from "./pages/ChangePassword";
import Login from "./pages/Login";
import Records from "./pages/Records";
import Register from "./pages/Register";
import Status from "./pages/Status";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className="container">Loading...</main>;
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route
            path="/"
            element={<Navigate to={user ? "/records" : "/login"} replace />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <Records />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route path="/status" element={<Status />} />
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </main>
    </>
  );
}
