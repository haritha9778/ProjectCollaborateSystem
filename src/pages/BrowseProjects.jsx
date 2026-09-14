import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

function BrowseProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [requestingProject, setRequestingProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  // Load all projects
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
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Send collaboration request
  const requestCollaboration = async (project) => {
    try {
      const currentUser = auth.currentUser;

      // Check login
      if (!currentUser) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      // Check ownerId
      if (!project.ownerId) {
        alert(
          "This project does not have an owner. Please choose another project."
        );
        console.error(
          "Missing ownerId for project:",
          project
        );
        return;
      }

      // Prevent requesting own project
      if (project.ownerId === currentUser.uid) {
        alert(
          "You cannot request collaboration for your own project."
        );
        return;
      }

      setRequestingProject(project.id);

      // Check whether request already exists
      const requestQuery = query(
        collection(db, "collaboration_requests"),
        where("projectId", "==", project.id),
        where("requesterId", "==", currentUser.uid)
      );

      const requestSnapshot = await getDocs(requestQuery);

      if (!requestSnapshot.empty) {
        alert(
          "You have already sent a collaboration request for this project."
        );
        setRequestingProject(null);
        return;
      }

      // Add collaboration request
      await addDoc(
        collection(db, "collaboration_requests"),
        {
          projectId: project.id,
          ownerId: project.ownerId,
          requesterId: currentUser.uid,
          requesterEmail: currentUser.email || "",
          projectTitle: project.title || "Untitled Project",
          status: "Pending",
          requestedAt: serverTimestamp(),
        }
      );

      // Create notification for project owner
      await addDoc(
        collection(db, "notifications"),
        {
          userId: project.ownerId,
          title: "New Collaboration Request",
          message: `${currentUser.email} wants to collaborate on your project "${project.title}".`,
          projectId: project.id,
          isRead: false,
          createdAt: serverTimestamp(),
        }
      );

      alert(
        "🤝 Collaboration request sent successfully!"
      );
    } catch (error) {
      console.error(error);
      alert(
        "Failed to send request: " + error.message
      );
    } finally {
      setRequestingProject(null);
    }
  };

  // Get unique categories
  const categories = [
    "All",
    ...new Set(
      projects
        .map((project) => project.category)
        .filter(Boolean)
    ),
  ];

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      project.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

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
          📂 Browse Projects
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Explore incomplete projects and find projects to collaborate on.
        </p>

        {/* Search and Filter */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <input
              type="text"
              placeholder="🔍 Search projects by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1",
                minWidth: "250px",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "15px",
                minWidth: "180px",
                cursor: "pointer",
              }}
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category === "All"
                    ? "📂 All Categories"
                    : category}
                </option>
              ))}
            </select>
          </div>

          {/* Result Count */}
          <p
            style={{
              marginBottom: 0,
              marginTop: "15px",
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
            <h3>⏳ Loading Projects...</h3>
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
            <h2>🔍 No Projects Found</h2>
            <p>
              Try searching with a different project name
              or category.
            </p>
          </div>
        ) : (
          /* Project Cards */
          filteredProjects.map((project) => {
            const currentUser = auth.currentUser;

            const isOwnProject =
              currentUser &&
              project.ownerId === currentUser.uid;

            const isRequesting =
              requestingProject === project.id;

            return (
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
                {/* Project Title */}
                <h2
                  style={{
                    marginTop: 0,
                    color: "#222",
                  }}
                >
                  {project.title}
                </h2>

                {/* Description */}
                <p style={{ marginBottom: "10px" }}>
                  <strong>Description:</strong>{" "}
                  {project.description ||
                    "No description added"}
                </p>

                {/* Category */}
                <p style={{ marginBottom: "10px" }}>
                  <strong>Category:</strong>{" "}
                  {project.category || "Not specified"}
                </p>

                {/* Progress */}
                <p style={{ marginBottom: "8px" }}>
                  <strong>Progress:</strong>{" "}
                  {project.progress || 0}%
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
                      width: `${project.progress || 0}%`,
                      height: "100%",
                      backgroundColor: "#22c55e",
                    }}
                  ></div>
                </div>

                {/* GitHub */}
                <p style={{ marginBottom: "20px" }}>
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

                {/* Collaboration Button */}
                {!isOwnProject ? (
                  <button
                    onClick={() =>
                      requestCollaboration(project)
                    }
                    disabled={
                      isRequesting ||
                      !project.ownerId
                    }
                    style={{
                      padding: "11px 20px",
                      backgroundColor:
                        isRequesting ||
                        !project.ownerId
                          ? "#9ca3af"
                          : "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor:
                        isRequesting ||
                        !project.ownerId
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "15px",
                      fontWeight: "bold",
                    }}
                  >
                    {isRequesting
                      ? "⏳ Sending Request..."
                      : !project.ownerId
                      ? "⚠ Owner Not Available"
                      : "🤝 Request Collaboration"}
                  </button>
                ) : (
                  <button
                    disabled
                    style={{
                      padding: "11px 20px",
                      backgroundColor: "#e5e7eb",
                      color: "#666",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "not-allowed",
                      fontSize: "15px",
                    }}
                  >
                    📌 Your Project
                  </button>
                )}
              </div>
            );
          })
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

export default BrowseProjects;