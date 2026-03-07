import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AgentLayout from "./components/AgentLayout";
import Login from "./pages/Login";
import LoginWithToken from "./pages/LoginWithToken";
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
import PropertyApplications from "./pages/PropertyApplications";
import InstallmentApplications from "./pages/InstallmentApplications";
import InsuranceApplications from "./pages/InsuranceApplications";
import InsurancePlanCreate from "./pages/InsurancePlanCreate";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import CasesList from "./pages/CasesList";
import CaseDetail from "./pages/CaseDetail";
import CommissionTracking from "./pages/CommissionTracking";
import InsurancePlanList from "./pages/InsurancePlanList";
import LinkedPartners from "./pages/LinkedPartners";
import Wallet from "./pages/Wallet";
import CompleteProfile from "./pages/CompleteProfile";
import "./App.css";

function LoginPage() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  if (token && token.trim()) return <LoginWithToken />;
  return <Login />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="/dashboard" element={<AgentLayout><Dashboard /></AgentLayout>} />
          <Route path="/dashboard/assignment/:assignmentId" element={<AgentLayout><AssignmentDetail /></AgentLayout>} />
          <Route path="/installments/create" element={<AgentLayout><CreateInstallment /></AgentLayout>} />
          <Route path="/installments/list" element={<AgentLayout><InstallmentsList /></AgentLayout>} />
          <Route path="/installments/edit/:id" element={<AgentLayout><InstallmentEdit /></AgentLayout>} />
          <Route path="/installments/applications" element={<AgentLayout><InstallmentApplications /></AgentLayout>} />
          <Route path="/property/list" element={<AgentLayout><PropertyList /></AgentLayout>} />
          <Route path="/property/add" element={<AgentLayout><PropertyAdd /></AgentLayout>} />
          <Route path="/property/edit/:id" element={<AgentLayout><PropertyAdd /></AgentLayout>} />
          <Route path="/property/view/:id" element={<AgentLayout><PropertyView /></AgentLayout>} />
          <Route path="/property/applications" element={<AgentLayout><PropertyApplications /></AgentLayout>} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
          <Route path="/profile" element={<AgentLayout><Profile /></AgentLayout>} />
          <Route path="/profile/view" element={<AgentLayout><ProfileView /></AgentLayout>} />
          <Route path="/cases" element={<AgentLayout><CasesList /></AgentLayout>} />
          <Route path="/cases/detail/:caseId" element={<AgentLayout><CaseDetail /></AgentLayout>} />
          <Route path="/commission/tracking" element={<AgentLayout><CommissionTracking /></AgentLayout>} />
          <Route path="/linked-partners" element={<AgentLayout><LinkedPartners /></AgentLayout>} />
          <Route path="/wallet" element={<AgentLayout><Wallet /></AgentLayout>} />
          <Route path="/insurance/list" element={<AgentLayout><InsurancePlanList /></AgentLayout>} />
          <Route path="/insurance/applications" element={<AgentLayout><InsuranceApplications /></AgentLayout>} />
          <Route path="/insurance/create" element={<AgentLayout><InsurancePlanCreate /></AgentLayout>} />
          <Route path="/insurance/edit/:id" element={<AgentLayout><InsurancePlanList /></AgentLayout>} />
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
