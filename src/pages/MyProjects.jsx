import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

function MyProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "projects")
      );

      const projectList = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setProjects(projectList);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const deleteProject = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "projects", id));

      alert("✅ Project Deleted Successfully!");

      loadProjects();
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
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
        {/* Header */}
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
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
          Manage your uploaded projects.
        </p>

        {/* Search */}
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
            Showing{" "}
            <strong>{filteredProjects.length}</strong>{" "}
            of{" "}
            <strong>{projects.length}</strong>{" "}
            projects
          </p>
        </div>

        {/* Loading */}
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
                ? "You have not uploaded any projects yet."
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
                boxShadow:
                  "0 3px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  color: "#222",
                }}
              >
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
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    width: `${project.progress}%`,
                    height: "100%",
                    backgroundColor: "#22c55e",
                  }}
                ></div>
              </div>

              <p>
                <strong>GitHub:</strong>{" "}
                {project.github ? (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Repository
                  </a>
                ) : (
                  "Not Added"
                )}
              </p>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() =>
                    navigate(`/edit/${project.id}`)
                  }
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
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}

        {/* Back Button */}
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
    </div>
  );
}

export default MyProjects;