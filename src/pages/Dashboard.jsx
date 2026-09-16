import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Project Collaborate System
            </h1>

            <p style={styles.subtitle}>
              Welcome to your dashboard
            </p>
          </div>

          <button
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Welcome Card */}
        <div style={styles.welcomeCard}>
          <h2 style={styles.welcomeTitle}>
            Welcome, Student 👋
          </h2>

          <p style={styles.welcomeText}>
            Upload incomplete projects, explore projects and
            collaborate with other students.
          </p>
        </div>

        {/* Student Dashboard Cards */}
        <div style={styles.cardGrid}>
          {/* Upload Project */}
          <div style={styles.card}>
            <div style={styles.icon}>📤</div>

            <h3 style={styles.cardTitle}>
              Upload Project
            </h3>

            <p style={styles.cardText}>
              Upload your incomplete software project.
            </p>

            <button
              style={styles.button}
              onClick={() => navigate("/upload")}
            >
              Upload Project
            </button>
          </div>

          {/* Browse Projects */}
          <div style={styles.card}>
            <div style={styles.icon}>🔍</div>

            <h3 style={styles.cardTitle}>
              Browse Projects
            </h3>

            <p style={styles.cardText}>
              View projects available for collaboration.
            </p>

            <button
              style={styles.button}
              onClick={() => navigate("/browse")}
            >
              Browse Projects
            </button>
          </div>

          {/* My Projects */}
          <div style={styles.card}>
            <div style={styles.icon}>📁</div>

            <h3 style={styles.cardTitle}>
              My Projects
            </h3>

            <p style={styles.cardText}>
              View, edit and delete your uploaded projects.
            </p>

            <button
              style={styles.button}
              onClick={() => navigate("/myprojects")}
            >
              My Projects
            </button>
          </div>

          {/* My Profile */}
          <div style={styles.card}>
            <div style={styles.icon}>👤</div>

            <h3 style={styles.cardTitle}>
              My Profile
            </h3>

            <p style={styles.cardText}>
              View your account details and profile information.
            </p>

            <button
              style={styles.button}
              onClick={() => navigate("/profile")}
            >
              My Profile
            </button>
          </div>

          {/* Notifications */}
          <div style={styles.card}>
            <div style={styles.icon}>🔔</div>

            <h3 style={styles.cardTitle}>
              Notifications
            </h3>

            <p style={styles.cardText}>
              Check your collaboration requests and notifications.
            </p>

            <button
              style={styles.button}
              onClick={() => navigate("/notifications")}
            >
              Notifications
            </button>
          </div>

          {/* Collaboration Requests */}
          <div style={styles.card}>
            <div style={styles.icon}>🤝</div>

            <h3 style={styles.cardTitle}>
              Collaboration Requests
            </h3>

            <p style={styles.cardText}>
              View and manage project collaboration requests.
            </p>

            <button
              style={styles.button}
              onClick={() => navigate("/collaboration-requests")}
            >
              View Requests
            </button>
          </div>

          {/* My Collaborations */}
          <div style={styles.card}>
            <div style={styles.icon}>👥</div>

            <h3 style={styles.cardTitle}>
              My Collaborations
            </h3>

            <p style={styles.cardText}>
              View projects you are collaborating on.
            </p>

            <button
              style={styles.button}
              onClick={() => navigate("/my-collaborations")}
            >
              My Collaborations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f7fb",
    padding: "25px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    backgroundColor: "#ffffff",
    padding: "20px 25px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    boxShadow: "0 3px 12px rgba(0, 0, 0, 0.08)",
  },

  title: {
    margin: "0",
    color: "#123c69",
    fontSize: "28px",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#666666",
    fontSize: "16px",
  },

  logoutButton: {
    backgroundColor: "#dc3545",
    color: "#ffffff",
    border: "none",
    padding: "12px 22px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  },

  welcomeCard: {
    backgroundColor: "#123c69",
    color: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    marginTop: "25px",
    boxShadow: "0 3px 12px rgba(0, 0, 0, 0.08)",
  },

  welcomeTitle: {
    margin: "0 0 10px",
    fontSize: "25px",
  },

  welcomeText: {
    margin: "0",
    fontSize: "17px",
    lineHeight: "1.6",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "22px",
    marginTop: "25px",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 3px 12px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
  },

  icon: {
    fontSize: "40px",
    marginBottom: "12px",
  },

  cardTitle: {
    color: "#123c69",
    margin: "0 0 10px",
    fontSize: "21px",
  },

  cardText: {
    color: "#666666",
    fontSize: "15px",
    lineHeight: "1.5",
    minHeight: "45px",
  },

  button: {
    width: "100%",
    backgroundColor: "#123c69",
    color: "#ffffff",
    border: "none",
    padding: "12px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
    marginTop: "15px",
  },
};

export default Dashboard;