import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function CollaborationRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    try {
      const q = query(
        collection(db, "collaboration_requests"),
        where("ownerId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);

      const requestList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setRequests(requestList);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (request, newStatus) => {
    setProcessingId(request.id);

    try {
      // Update request status
      await updateDoc(
        doc(db, "collaboration_requests", request.id),
        {
          status: newStatus,
        }
      );

      // Send notification to requester
      await addDoc(collection(db, "notifications"), {
        userId: request.requesterId,
        title:
          newStatus === "Accepted"
            ? "Collaboration Request Accepted"
            : "Collaboration Request Rejected",
        message:
          newStatus === "Accepted"
            ? `Your collaboration request for "${request.projectTitle}" has been accepted.`
            : `Your collaboration request for "${request.projectTitle}" has been rejected.`,
        projectId: request.projectId,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      alert(
        newStatus === "Accepted"
          ? "✅ Collaboration request accepted!"
          : "❌ Collaboration request rejected!"
      );

      loadRequests();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setProcessingId(null);
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
          🤝 Collaboration Requests
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Manage requests received for your projects.
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
            <h3>⏳ Loading Requests...</h3>
          </div>
        ) : requests.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              textAlign: "center",
              borderRadius: "12px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h2>📭 No Collaboration Requests</h2>
            <p>
              You don't have any collaboration requests yet.
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
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
                {request.projectTitle}
              </h2>

              <p>
                <strong>Requester:</strong>{" "}
                {request.requesterEmail}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color:
                      request.status === "Accepted"
                        ? "#16a34a"
                        : request.status === "Rejected"
                        ? "#dc2626"
                        : "#d97706",
                  }}
                >
                  {request.status}
                </span>
              </p>

              {request.status === "Pending" && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() =>
                      handleRequest(request, "Accepted")
                    }
                    disabled={processingId === request.id}
                    style={{
                      padding: "10px 18px",
                      backgroundColor:
                        processingId === request.id
                          ? "#999"
                          : "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor:
                        processingId === request.id
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    ✅ Accept
                  </button>

                  <button
                    onClick={() =>
                      handleRequest(request, "Rejected")
                    }
                    disabled={processingId === request.id}
                    style={{
                      padding: "10px 18px",
                      backgroundColor:
                        processingId === request.id
                          ? "#999"
                          : "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor:
                        processingId === request.id
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
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

export default CollaborationRequests;