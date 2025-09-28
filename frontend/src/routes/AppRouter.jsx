import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import AdminUsersPage from "../pages/AdminUsersPage";
import Header from "../components/Header";
import PrivateRoute from "../components/PrivateRoute";
import ForgotPasswordPage from "../pages/ResetPasswordPgage";

export default function AppRouter() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminUsersPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
