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

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const projectSnapshot = await getDocs(
        collection(db, "projects")
      );

      const projectList = projectSnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setProjects(projectList);

      const requestSnapshot = await getDocs(
        collection(db, "collaboration_requests")
      );

      const requestList = requestSnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setRequests(requestList);
    } catch (error) {
      console.error("Error loading admin data:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDeletePopup = (id) => {
    setSelectedProjectId(id);
    setShowDeletePopup(true);
  };

  const closeDeletePopup = () => {
    if (deleting) return;

    setShowDeletePopup(false);
    setSelectedProjectId(null);
  };

  const deleteProject = async () => {
    if (!selectedProjectId) return;

    setDeleting(true);

    try {
      await deleteDoc(doc(db, "projects", selectedProjectId));

      alert("✅ Project Deleted Successfully!");

      setShowDeletePopup(false);
      setSelectedProjectId(null);

      await loadData();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert(error.message);
    } finally {
      setDeleting(false);
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
    project.title?.toLowerCase().includes(search.toLowerCase())
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

  const completedProjects = projects.filter(
    (project) => Number(project.progress || 0) === 100
  ).length;

  const inProgressProjects = projects.filter(
    (project) => Number(project.progress || 0) < 100
  ).length;

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  const getStatusText = (project) => {
    const progress = Number(project.progress || 0);

    if (progress === 100) {
      return "Completed";
    }

    if (progress > 0) {
      return "In Progress";
    }

    return project.status || "Open";
  };

  const getStatusStyle = (project) => {
    const status = getStatusText(project);

    if (status === "Completed") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "In Progress") {
      return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      backgroundColor: "#dbeafe",
      color: "#1d4ed8",
    };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "25px 15px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
            marginBottom: "25px",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "10px",
              color: "#123c69",
              fontSize: "clamp(25px, 5vw, 36px)",
            }}
          >
            👨‍💼 Admin Dashboard
          </h1>

          <p
            style={{
              color: "#666",
              lineHeight: "1.6",
              marginBottom: 0,
            }}
          >
            Manage and monitor all uploaded projects and collaboration
            activities.
          </p>

          {/* Project Statistics */}
          <h3
            style={{
              marginTop: "30px",
              color: "#123c69",
            }}
          >
            📊 Project Statistics
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "15px",
              marginTop: "15px",
            }}
          >
            <div
              style={{
                padding: "20px",
                backgroundColor: "#eff6ff",
                borderRadius: "12px",
                borderLeft: "5px solid #2563eb",
              }}
            >
              <h2 style={{ margin: 0, color: "#1d4ed8" }}>
                {projects.length}
              </h2>

              <p style={{ marginBottom: 0 }}>Total Projects</p>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#f0fdf4",
                borderRadius: "12px",
                borderLeft: "5px solid #16a34a",
              }}
            >
              <h2 style={{ margin: 0, color: "#15803d" }}>
                {completedProjects}
              </h2>

              <p style={{ marginBottom: 0 }}>Completed Projects</p>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fff7ed",
                borderRadius: "12px",
                borderLeft: "5px solid #ea580c",
              }}
            >
              <h2 style={{ margin: 0, color: "#c2410c" }}>
                {inProgressProjects}
              </h2>

              <p style={{ marginBottom: 0 }}>In Progress</p>
            </div>
          </div>

          {/* Collaboration Statistics */}
          <h3
            style={{
              marginTop: "30px",
              color: "#123c69",
            }}
          >
            🤝 Collaboration Statistics
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "15px",
              marginTop: "15px",
            }}
          >
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f3e8ff",
                borderRadius: "12px",
                borderLeft: "5px solid #9333ea",
              }}
            >
              <h2 style={{ margin: 0, color: "#7e22ce" }}>
                {requests.length}
              </h2>

              <p style={{ marginBottom: 0 }}>Total Requests</p>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fef3c7",
                borderRadius: "12px",
                borderLeft: "5px solid #d97706",
              }}
            >
              <h2 style={{ margin: 0, color: "#92400e" }}>
                {pendingRequests}
              </h2>

              <p style={{ marginBottom: 0 }}>Pending Requests</p>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#dcfce7",
                borderRadius: "12px",
                borderLeft: "5px solid #16a34a",
              }}
            >
              <h2 style={{ margin: 0, color: "#166534" }}>
                {acceptedRequests}
              </h2>

              <p style={{ marginBottom: 0 }}>Accepted Requests</p>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fee2e2",
                borderRadius: "12px",
                borderLeft: "5px solid #dc2626",
              }}
            >
              <h2 style={{ margin: 0, color: "#991b1b" }}>
                {rejectedRequests}
              </h2>

              <p style={{ marginBottom: 0 }}>Rejected Requests</p>
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
            boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          <p
            style={{
              color: "#666",
              marginBottom: 0,
              marginTop: "12px",
            }}
          >
            Showing{" "}
            <strong>{filteredProjects.length}</strong> of{" "}
            <strong>{projects.length}</strong> projects
          </p>
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
          filteredProjects.map((project) => {
            const progress = Math.min(
              100,
              Math.max(0, Number(project.progress || 0))
            );

            return (
              <div
                key={project.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "25px",
                  marginBottom: "20px",
                  boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "15px",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      color: "#123c69",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {project.title || "Untitled Project"}
                  </h2>

                  <span
                    style={{
                      ...getStatusStyle(project),
                      padding: "7px 13px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getStatusText(project)}
                  </span>
                </div>

                <p>
                  <strong>Description:</strong>{" "}
                  {project.description || "Not Added"}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {project.category || "Not Added"}
                </p>

                <p>
                  <strong>Progress:</strong> {progress}%
                </p>

                {/* Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "12px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "10px",
                    overflow: "hidden",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      backgroundColor:
                        progress === 100 ? "#16a34a" : "#2563eb",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                <button
                  onClick={() => openDeletePopup(project.id)}
                  style={{
                    padding: "11px 18px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  🗑️ Delete Project
                </button>
              </div>
            );
          })
        )}

        {/* Bottom Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "30px",
          }}
        >
          <button
            onClick={() => navigate("/notifications")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "7px",
              cursor: "pointer",
              fontSize: "14px",
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
              borderRadius: "7px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            boxSizing: "border-box",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              width: "100%",
              maxWidth: "420px",
              borderRadius: "15px",
              padding: "30px",
              textAlign: "center",
              boxShadow: "0 5px 25px rgba(0,0,0,0.25)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: "45px",
                marginBottom: "10px",
              }}
            >
              ⚠️
            </div>

            <h2 style={{ color: "#123c69" }}>
              Delete Project?
            </h2>

            <p style={{ color: "#555", lineHeight: "1.6" }}>
              Are you sure you want to delete{" "}
              <strong>
                {selectedProject?.title || "this project"}
              </strong>
              ?
            </p>

            <p
              style={{
                color: "#dc2626",
                fontSize: "14px",
              }}
            >
              This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "25px",
              }}
            >
              <button
                onClick={closeDeletePopup}
                disabled={deleting}
                style={{
                  padding: "11px 22px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "7px",
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={deleteProject}
                disabled={deleting}
                style={{
                  padding: "11px 22px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "7px",
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;