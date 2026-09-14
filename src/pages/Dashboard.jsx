import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const logoutUser = async () => {
    try {
      await signOut(auth);
      alert("Logged Out Successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  const buttonStyle = {
    width: "280px",
    padding: "14px",
    margin: "8px 0",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "650px",
          backgroundColor: "white",
          padding: "45px 30px",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "25px" }}>
          <h1
            style={{
              margin: "0 0 15px",
              fontSize: "38px",
              lineHeight: "1.2",
              whiteSpace: "nowrap",
            }}
          >
            🚀 Project Collaborate System
          </h1>

          <h2
            style={{
              margin: "10px 0",
              fontSize: "25px",
            }}
          >
            Welcome 👋
          </h2>

          <p
            style={{
              margin: "10px auto",
              color: "#666",
              fontSize: "16px",
              lineHeight: "1.5",
            }}
          >
            Collaborate with students, upload projects
            <br />
            and work together.
          </p>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #ddd",
            margin: "25px 0",
          }}
        />

        {/* Upload Project */}
        <button
          onClick={() => navigate("/upload")}
          style={{
            ...buttonStyle,
            backgroundColor: "#f1f1f1",
          }}
        >
          📤 Upload Project
        </button>

        {/* Browse Projects */}
        <button
          onClick={() => navigate("/browse")}
          style={{
            ...buttonStyle,
            backgroundColor: "#f1f1f1",
          }}
        >
          📂 Browse Projects
        </button>

        {/* My Projects */}
        <button
          onClick={() => navigate("/myprojects")}
          style={{
            ...buttonStyle,
            backgroundColor: "#f1f1f1",
          }}
        >
          📁 My Projects
        </button>

        {/* Collaboration Requests */}
        <button
          onClick={() =>
            navigate("/collaboration-requests")
          }
          style={{
            ...buttonStyle,
            backgroundColor: "#16a34a",
            color: "white",
          }}
        >
          🤝 Collaboration Requests
        </button>

        {/* My Collaborations */}
        <button
          onClick={() =>
            navigate("/my-collaborations")
          }
          style={{
            ...buttonStyle,
            backgroundColor: "#7c3aed",
            color: "white",
          }}
        >
          🤝 My Collaborations
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate("/notifications")}
          style={{
            ...buttonStyle,
            backgroundColor: "#2563eb",
            color: "white",
          }}
        >
          🔔 Notifications
        </button>

        {/* Logout */}
        <button
          onClick={logoutUser}
          style={{
            ...buttonStyle,
            backgroundColor: "#ff4d4d",
            color: "white",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;