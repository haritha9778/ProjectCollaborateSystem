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
  const [requestedProjects, setRequestedProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [requestingProject, setRequestingProject] = useState(null);

  useEffect(() => {
    loadProjects();
    loadRequestedProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectSnapshot = await getDocs(
        collection(db, "projects")
      );

      const projectList = projectSnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setProjects(projectList);
    } catch (error) {
      console.error("Error loading projects:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRequestedProjects = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return;
      }

      const requestQuery = query(
        collection(db, "collaboration_requests"),
        where("requesterId", "==", currentUser.uid)
      );

      const requestSnapshot = await getDocs(requestQuery);

      const requestedIds = requestSnapshot.docs
        .filter((docItem) => {
          const requestData = docItem.data();

          return (
            requestData.status === "Pending" ||
            requestData.status === "Accepted"
          );
        })
        .map((docItem) => docItem.data().projectId);

      setRequestedProjects(requestedIds);
    } catch (error) {
      console.error("Error loading requested projects:", error);
    }
  };

  const requestCollaboration = async (project) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      if (!project.ownerId) {
        alert("This project does not have an owner.");
        return;
      }

      if (project.ownerId === currentUser.uid) {
        alert("You cannot request collaboration for your own project.");
        return;
      }

      const isProjectTaken =
        project.collaboratorId ||
        project.status === "In Progress" ||
        project.status === "Accepted" ||
        project.status === "Completed";

      if (isProjectTaken) {
        alert(
          "This project is already taken. You cannot send another request."
        );
        return;
      }

      if (requestedProjects.includes(project.id)) {
        alert("You have already sent a collaboration request.");
        return;
      }

      setRequestingProject(project.id);

      const requestQuery = query(
        collection(db, "collaboration_requests"),
        where("projectId", "==", project.id),
        where("requesterId", "==", currentUser.uid)
      );

      const requestSnapshot = await getDocs(requestQuery);

      const existingRequest = requestSnapshot.docs.find((docItem) => {
        const requestData = docItem.data();

        return (
          requestData.status === "Pending" ||
          requestData.status === "Accepted"
        );
      });

      if (existingRequest) {
        setRequestedProjects((previous) => [
          ...previous,
          project.id,
        ]);

        alert("You have already sent a collaboration request.");
        return;
      }

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

      setRequestedProjects((previous) => [
        ...previous,
        project.id,
      ]);

      alert("🤝 Collaboration request sent successfully!");
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request: " + error.message);
    } finally {
      setRequestingProject(null);
    }
  };

  const categories = [
    "All",
    ...new Set(
      projects
        .map((project) => project.category)
        .filter((category) => category)
    ),
  ];

  const filteredProjects = projects.filter((project) => {
    const projectTitle = project.title || "";
    const projectDescription = project.description || "";
    const projectCategory = project.category || "";

    const searchText = search.toLowerCase();

    const matchesSearch =
      projectTitle.toLowerCase().includes(searchText) ||
      projectDescription.toLowerCase().includes(searchText) ||
      projectCategory.toLowerCase().includes(searchText);

    const matchesCategory =
      categoryFilter === "All" ||
      projectCategory === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h2>Loading Projects...</h2>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.topSection}>
        <div style={styles.headingSection}>
          <h1 style={styles.pageTitle}>Browse Projects</h1>

          <p style={styles.pageDescription}>
            Find incomplete software projects and collaborate with students.
          </p>
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <div style={styles.filterSection}>
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={styles.searchInput}
        />

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(event.target.value)
          }
          style={styles.categorySelect}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <div style={styles.emptyContainer}>
          <h2>No Projects Found</h2>
          <p>Try searching with a different keyword.</p>
        </div>
      ) : (
        <div style={styles.projectGrid}>
          {filteredProjects.map((project) => {
            const currentUser = auth.currentUser;

            const isOwnProject =
              currentUser &&
              project.ownerId === currentUser.uid;

            const isRequesting =
              requestingProject === project.id;

            const isRequestSent =
              requestedProjects.includes(project.id);

            const isProjectTaken =
              project.collaboratorId ||
              project.status === "In Progress" ||
              project.status === "Accepted" ||
              project.status === "Completed";

            const getStatusText = () => {
              if (project.status === "Completed") {
                return "Completed";
              }

              if (
                project.status === "In Progress" ||
                project.status === "Accepted" ||
                project.collaboratorId
              ) {
                return "In Progress";
              }

              return "Open";
            };

            const getStatusBackground = () => {
              if (project.status === "Completed") {
                return "#dcfce7";
              }

              if (
                project.status === "In Progress" ||
                project.status === "Accepted" ||
                project.collaboratorId
              ) {
                return "#fef3c7";
              }

              return "#e8f1ff";
            };

            const getStatusColor = () => {
              if (project.status === "Completed") {
                return "#166534";
              }

              if (
                project.status === "In Progress" ||
                project.status === "Accepted" ||
                project.collaboratorId
              ) {
                return "#92400e";
              }

              return "#123c69";
            };

            return (
              <div
                key={project.id}
                style={styles.projectCard}
              >
                <div style={styles.cardHeader}>
                  <h2 style={styles.projectTitle}>
                    {project.title || "Untitled Project"}
                  </h2>

                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusBackground(),
                      color: getStatusColor(),
                    }}
                  >
                    {getStatusText()}
                  </span>
                </div>

                <p style={styles.projectDescription}>
                  {project.description ||
                    "No description available."}
                </p>

                <div style={styles.projectDetails}>
                  <p>
                    <strong>Category:</strong>{" "}
                    {project.category || "Not Mentioned"}
                  </p>

                  <p>
                    <strong>Progress:</strong>{" "}
                    {project.progress || 0}%
                  </p>

                  <p>
                    <strong>GitHub:</strong>{" "}
                    {project.githubLink ? (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.githubLink}
                      >
                        View Repository
                      </a>
                    ) : (
                      "Not Added"
                    )}
                  </p>

                  {isProjectTaken && project.collaboratorId && (
                    <p style={styles.takenText}>
                      ✓ This project already has a collaborator.
                    </p>
                  )}
                </div>

                <div style={styles.progressHeader}>
                  <strong>Project Progress</strong>
                  <span>
                    {project.progress || 0}%
                  </span>
                </div>

                <div style={styles.progressBackground}>
                  <div
                    style={{
                      ...styles.progressBar,
                      width: `${Math.min(
                        Math.max(Number(project.progress) || 0,
                        0),
                        100
                      )}%`,
                    }}
                  ></div>
                </div>

                {isOwnProject ? (
                  <button
                    style={styles.ownProjectButton}
                    disabled
                  >
                    Your Project
                  </button>
                ) : isProjectTaken ? (
                  <button
                    style={styles.alreadyTakenButton}
                    disabled
                  >
                    ✓ Already Taken
                  </button>
                ) : isRequestSent ? (
                  <button
                    style={styles.requestSentButton}
                    disabled
                  >
                    ✓ Request Sent
                  </button>
                ) : (
                  <button
                    style={styles.requestButton}
                    onClick={() =>
                      requestCollaboration(project)
                    }
                    disabled={
                      isRequesting || !project.ownerId
                    }
                  >
                    {isRequesting
                      ? "⏳ Sending Request..."
                      : !project.ownerId
                      ? "Owner Not Available"
                      : "🤝 Request Collaboration"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "35px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  topSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  headingSection: {
    flex: 1,
    minWidth: "250px",
  },

  pageTitle: {
    color: "#123c69",
    fontSize: "34px",
    marginBottom: "8px",
    marginTop: 0,
  },

  pageDescription: {
    color: "#555",
    fontSize: "16px",
    margin: 0,
    lineHeight: "1.5",
  },

  backButton: {
    backgroundColor: "#123c69",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },

  filterSection: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  searchInput: {
    flex: 1,
    minWidth: "230px",
    padding: "14px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  categorySelect: {
    minWidth: "200px",
    padding: "14px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    backgroundColor: "white",
    boxSizing: "border-box",
  },

  projectGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
  },

  projectCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e1e5eb",
    minWidth: 0,
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },

  projectTitle: {
    color: "#123c69",
    fontSize: "22px",
    margin: 0,
    wordBreak: "break-word",
    flex: 1,
    minWidth: 0,
  },

  statusBadge: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  projectDescription: {
    color: "#555",
    lineHeight: "1.6",
    minHeight: "50px",
    marginBottom: "18px",
    wordBreak: "break-word",
  },

  projectDetails: {
    color: "#333",
    fontSize: "14px",
    lineHeight: "1.8",
    overflowWrap: "anywhere",
  },

  takenText: {
    color: "#15803d",
    fontWeight: "bold",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    color: "#123c69",
    fontSize: "14px",
    marginTop: "18px",
    marginBottom: "8px",
  },

  progressBackground: {
    height: "9px",
    backgroundColor: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "20px",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  },

  githubLink: {
    color: "#2563eb",
    textDecoration: "none",
    wordBreak: "break-word",
  },

  requestButton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#123c69",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  requestSentButton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#198754",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "not-allowed",
    boxSizing: "border-box",
  },

  alreadyTakenButton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#64748b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "not-allowed",
    boxSizing: "border-box",
  },

  ownProjectButton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#999",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "not-allowed",
    boxSizing: "border-box",
  },

  emptyContainer: {
    backgroundColor: "white",
    padding: "50px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#555",
    boxSizing: "border-box",
  },

  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
    color: "#123c69",
  },
};

export default BrowseProjects;