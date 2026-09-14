import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

function AdminDashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // Load Projects
      const projectSnapshot = await getDocs(
        collection(db, "projects")
      );

      const projectList = projectSnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setProjects(projectList);

      // Load Collaboration Requests
      const requestSnapshot = await getDocs(
        collection(db, "collaboration_requests")
      );

      const requestList = requestSnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setRequests(requestList);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteProject = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "projects", id));

      alert("✅ Project Deleted Successfully!");

      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
      navigate("/admin-login");
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const acceptedRequests = requests.filter(
    (request) => request.status === "Accepted"
  ).length;

  const rejectedRequests = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
            marginBottom: "25px",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "10px",
            }}
          >
            👨‍💼 Admin Dashboard
          </h1>

          <p style={{ color: "#666" }}>
            Manage and monitor all uploaded projects and collaboration
            activities.
          </p>

          {/* Project Statistics */}
          <h3 style={{ marginTop: "25px" }}>
            📊 Project Statistics
          </h3>

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              marginTop: "15px",
            }}
          >
            <div
              style={{
                padding: "20px",
                backgroundColor: "#eff6ff",
                borderRadius: "10px",
                minWidth: "180px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {projects.length}
              </h2>

              <p style={{ marginBottom: 0 }}>
                Total Projects
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#f0fdf4",
                borderRadius: "10px",
                minWidth: "180px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {
                  projects.filter(
                    (project) =>
                      Number(project.progress) === 100
                  ).length
                }
              </h2>

              <p style={{ marginBottom: 0 }}>
                Completed Projects
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fff7ed",
                borderRadius: "10px",
                minWidth: "180px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {
                  projects.filter(
                    (project) =>
                      Number(project.progress) < 100
                  ).length
                }
              </h2>

              <p style={{ marginBottom: 0 }}>
                In Progress
              </p>
            </div>
          </div>

          {/* Collaboration Statistics */}
          <h3 style={{ marginTop: "30px" }}>
            🤝 Collaboration Statistics
          </h3>

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              marginTop: "15px",
            }}
          >
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f3e8ff",
                borderRadius: "10px",
                minWidth: "180px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {requests.length}
              </h2>

              <p style={{ marginBottom: 0 }}>
                Total Requests
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fef3c7",
                borderRadius: "10px",
                minWidth: "180px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {pendingRequests}
              </h2>

              <p style={{ marginBottom: 0 }}>
                Pending Requests
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#dcfce7",
                borderRadius: "10px",
                minWidth: "180px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {acceptedRequests}
              </h2>

              <p style={{ marginBottom: 0 }}>
                Accepted Requests
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fee2e2",
                borderRadius: "10px",
                minWidth: "180px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {rejectedRequests}
              </h2>

              <p style={{ marginBottom: 0 }}>
                Rejected Requests
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search projects..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Projects */}
        {loading ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              textAlign: "center",
              borderRadius: "12px",
            }}
          >
            <h2>⏳ Loading Dashboard...</h2>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              textAlign: "center",
              borderRadius: "12px",
            }}
          >
            <h2>📂 No Projects Found</h2>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "25px",
                marginBottom: "20px",
                boxShadow:
                  "0 3px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                {project.title}
              </h2>

              <p>
                <strong>Description:</strong>{" "}
                {project.description}
              </p>

              <p>
                <strong>Category:</strong>{" "}
                {project.category}
              </p>

              <p>
                <strong>Progress:</strong>{" "}
                {project.progress}%
              </p>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "10px",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: `${project.progress}%`,
                    height: "100%",
                    backgroundColor: "#22c55e",
                  }}
                />
              </div>

              <button
                onClick={() =>
                  deleteProject(project.id)
                }
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                🗑️ Delete Project
              </button>
            </div>
          ))
        )}

        {/* Bottom Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "30px",
          }}
        >
          <button
            onClick={() =>
              navigate("/notifications")
            }
            style={{
              padding: "12px 20px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🔔 Notifications
          </button>

          <button
            onClick={logoutAdmin}
            style={{
              padding: "12px 20px",
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;