import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyAccount from "./pages/VerifyAccount";
import ForgotPassword from "./pages/ForgotPassword";
import NewPassword from "./pages/NewPassword";
import Dashboard from "./pages/Dashboard";
import AssignmentDetail from "./pages/AssignmentDetail";
import CreateInstallment from "./pages/CreateInstallment";
import InstallmentsList from "./pages/InstallmentsList";
import InstallmentEdit from "./pages/InstallmentEdit";
import PropertyList from "./pages/PropertyList";
import PropertyAdd from "./pages/PropertyAdd";
import PropertyView from "./pages/PropertyView";
import InstallmentApplications from "./pages/InstallmentApplications";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import CasesList from "./pages/CasesList";
import CaseDetail from "./pages/CaseDetail";
import CommissionTracking from "./pages/CommissionTracking";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/assignment/:assignmentId"
            element={
              <ProtectedRoute>
                <AssignmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/installments/create"
            element={
              <ProtectedRoute>
                <CreateInstallment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/installments/list"
            element={
              <ProtectedRoute>
                <InstallmentsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/installments/edit/:id"
            element={
              <ProtectedRoute>
                <InstallmentEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/installments/applications"
            element={
              <ProtectedRoute>
                <InstallmentApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/property/list"
            element={
              <ProtectedRoute>
                <PropertyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/property/add"
            element={
              <ProtectedRoute>
                <PropertyAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="/property/edit/:id"
            element={
              <ProtectedRoute>
                <PropertyAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="/property/view/:id"
            element={
              <ProtectedRoute>
                <PropertyView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/view"
            element={
              <ProtectedRoute>
                <ProfileView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedRoute>
                <CasesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/detail/:caseId"
            element={
              <ProtectedRoute>
                <CaseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commission/tracking"
            element={
              <ProtectedRoute>
                <CommissionTracking />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Catch-all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
