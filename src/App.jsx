import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadProject from "./pages/UploadProject";
import BrowseProjects from "./pages/BrowseProjects";
import MyProjects from "./pages/MyProjects";
import EditProject from "./pages/EditProject";
import CollaborationRequests from "./pages/CollaborationRequests";
import MyCollaborations from "./pages/MyCollaborations";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Student Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Project Pages */}
      <Route path="/upload" element={<UploadProject />} />
      <Route path="/browse" element={<BrowseProjects />} />
      <Route path="/myprojects" element={<MyProjects />} />
      <Route path="/edit/:id" element={<EditProject />} />

      {/* Collaboration */}
      <Route
        path="/collaboration-requests"
        element={<CollaborationRequests />}
      />

      <Route
        path="/my-collaborations"
        element={<MyCollaborations />}
      />

      {/* Admin Pages */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* Notifications */}
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
  );
}

export default App;