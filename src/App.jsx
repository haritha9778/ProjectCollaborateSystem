import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

// Student Pages
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadProject from "./pages/UploadProject";
import BrowseProjects from "./pages/BrowseProjects";
import MyProjects from "./pages/MyProjects";
import EditProject from "./pages/EditProject";
import CollaborationRequests from "./pages/CollaborationRequests";
import MyCollaborations from "./pages/MyCollaborations";
import Notifications from "./pages/Notifications";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function LoadingPage() {
  return (
    <div style={styles.loadingPage}>
      <h2>Loading...</h2>
    </div>
  );
}

function StudentRoute({ children, user, loading }) {
  const location = useLocation();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

function AdminRoute({ children, user, role, loading }) {
  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (role !== "Admin" && role !== "admin") {
    alert("This account is not an Admin.");
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setLoading(true);
        setUser(currentUser);

        if (!currentUser) {
          setRole("");
          setLoading(false);
          return;
        }

        try {
          const userDocRef = doc(
            db,
            "users",
            currentUser.uid
          );

          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role || "Student");
          } else {
            setRole("Student");
          }
        } catch (error) {
          console.error("Error loading user role:", error);
          setRole("Student");
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={
          user ? (
            role === "Admin" || role === "admin" ? (
              <Navigate to="/admin-dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          <StudentRoute user={user} loading={loading}>
            <Dashboard />
          </StudentRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <StudentRoute user={user} loading={loading}>
            <UploadProject />
          </StudentRoute>
        }
      />

      <Route
        path="/browse"
        element={
          <StudentRoute user={user} loading={loading}>
            <BrowseProjects />
          </StudentRoute>
        }
      />

      <Route
        path="/myprojects"
        element={
          <StudentRoute user={user} loading={loading}>
            <MyProjects />
          </StudentRoute>
        }
      />

      <Route
        path="/edit/:id"
        element={
          <StudentRoute user={user} loading={loading}>
            <EditProject />
          </StudentRoute>
        }
      />

      <Route
        path="/collaboration-requests"
        element={
          <StudentRoute user={user} loading={loading}>
            <CollaborationRequests />
          </StudentRoute>
        }
      />

      <Route
        path="/my-collaborations"
        element={
          <StudentRoute user={user} loading={loading}>
            <MyCollaborations />
          </StudentRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <StudentRoute user={user} loading={loading}>
            <Notifications />
          </StudentRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <StudentRoute user={user} loading={loading}>
            <Profile />
          </StudentRoute>
        }
      />

      <Route
        path="/admin-login"
        element={
          user && (role === "Admin" || role === "admin") ? (
            <Navigate to="/admin-dashboard" replace />
          ) : (
            <AdminLogin />
          )
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute
            user={user}
            role={role}
            loading={loading}
          >
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

const styles = {
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f7fb",
    color: "#123c69",
    fontFamily: "Arial, sans-serif",
  },
};

export default App;