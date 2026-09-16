import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

function MyProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProjects = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      const projectsQuery = query(
        collection(db, "projects"),
        where("ownerId", "==", currentUser.uid)
      );

      const snapshot = await getDocs(projectsQuery);

      const projectList = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setProjects(projectList);
    } catch (error) {
      console.error("Error loading your projects:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
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
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      const selectedProject = projects.find(
        (project) => project.id === selectedProjectId
      );

      if (!selectedProject) {
        alert("Project not found.");
        return;
      }

      if (selectedProject.ownerId !== currentUser.uid) {
        alert("You can delete only your own projects.");
        return;
      }

      await deleteDoc(doc(db, "projects", selectedProjectId));

      alert("✅ Project Deleted Successfully!");

      setShowDeletePopup(false);
      setSelectedProjectId(null);

      await loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

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
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
            color: "#123c69",
          }}
        >
          📁 My Projects
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Manage projects owned by you.
        </p>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search your projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <p
            style={{
              marginBottom: 0,
              color: "#666",
            }}
          >
            Showing <strong>{filteredProjects.length}</strong> of{" "}
            <strong>{projects.length}</strong> projects
          </p>
        </div>

        {loading ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              textAlign: "center",
              borderRadius: "12px",
            }}
          >
            <h2>⏳ Loading Projects...</h2>
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

            <p>
              {projects.length === 0
                ? "You do not own any projects yet."
                : "Try searching with a different project name."}
            </p>
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
                boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  color: "#123c69",
                }}
              >
                {project.title || "Untitled Project"}
              </h2>

              <p>
                <strong>Description:</strong>{" "}
                {project.description || "Not Added"}
              </p>

              <p>
                <strong>Category:</strong>{" "}
                {project.category || "Not Added"}
              </p>

              <p>
                <strong>Progress:</strong> {project.progress || 0}%
              </p>

              <p>
                <strong>Status:</strong> {project.status || "Open"}
              </p>

              <div
                style={{
                  width: "100%",
                  height: "10px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "10px",
                  overflow: "hidden",
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    width: `${project.progress || 0}%`,
                    height: "100%",
                    backgroundColor: "#22c55e",
                  }}
                ></div>
              </div>

              <p>
                <strong>GitHub:</strong>{" "}
                {project.githubLink || project.github ? (
                  <a
                    href={project.githubLink || project.github}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                    }}
                  >
                    Open Repository
                  </a>
                ) : (
                  "Not Added"
                )}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => navigate(`/edit/${project.id}`)}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => openDeletePopup(project.id)}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ⬅ Back to Dashboard
          </button>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.55)",
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
              borderRadius: "14px",
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

            <h2
              style={{
                color: "#123c69",
                marginBottom: "12px",
              }}
            >
              Delete Project?
            </h2>

            <p
              style={{
                color: "#555",
                lineHeight: "1.6",
              }}
            >
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
                  borderRadius: "6px",
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
                  borderRadius: "6px",
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

export default MyProjects;