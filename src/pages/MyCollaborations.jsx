import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

function MyCollaborations() {
  const navigate = useNavigate();

  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollaborations();
  }, []);

  const loadCollaborations = async () => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    try {
      // Get accepted collaboration requests
      const requestQuery = query(
        collection(db, "collaboration_requests"),
        where("requesterId", "==", auth.currentUser.uid),
        where("status", "==", "Accepted")
      );

      const requestSnapshot = await getDocs(requestQuery);

      const projectSnapshot = await getDocs(
        collection(db, "projects")
      );

      const projectList = projectSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      const acceptedProjects = requestSnapshot.docs
        .map((item) => {
          const request = {
            id: item.id,
            ...item.data(),
          };

          const project = projectList.find(
            (project) => project.id === request.projectId
          );

          if (!project) return null;

          return {
            ...request,
            project,
          };
        })
        .filter(Boolean);

      setCollaborations(acceptedProjects);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

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
          }}
        >
          🤝 My Collaborations
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Projects you have been accepted to collaborate on.
        </p>

        {loading ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              textAlign: "center",
              borderRadius: "12px",
            }}
          >
            <h3>⏳ Loading Collaborations...</h3>
          </div>
        ) : collaborations.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              textAlign: "center",
              borderRadius: "12px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h2>📭 No Accepted Collaborations</h2>

            <p>
              You don't have any accepted collaboration projects yet.
            </p>
          </div>
        ) : (
          collaborations.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: "white",
                padding: "25px",
                marginBottom: "20px",
                borderRadius: "12px",
                boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  color: "#222",
                }}
              >
                {item.project.title}
              </h2>

              <p>
                <strong>Description:</strong>{" "}
                {item.project.description}
              </p>

              <p>
                <strong>Category:</strong>{" "}
                {item.project.category}
              </p>

              <p>
                <strong>Current Progress:</strong>{" "}
                {item.project.progress}%
              </p>

              <p>
                <strong>Collaboration Status:</strong>{" "}
                <span
                  style={{
                    color: "#16a34a",
                    fontWeight: "bold",
                  }}
                >
                  ✅ Accepted
                </span>
              </p>

              {item.project.github ? (
                <a
                  href={item.project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "10px",
                    padding: "10px 18px",
                    backgroundColor: "#24292f",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "6px",
                  }}
                >
                  💻 Open GitHub Project
                </a>
              ) : (
                <p style={{ color: "#dc2626" }}>
                  ⚠ GitHub link is not available.
                </p>
              )}
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
    </div>
  );
}

export default MyCollaborations;