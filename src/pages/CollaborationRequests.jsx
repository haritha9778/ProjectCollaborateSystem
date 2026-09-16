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
  getDoc,
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
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        navigate("/login");
        return;
      }

      // Only requests for projects currently owned by this user
      const requestsQuery = query(
        collection(db, "collaboration_requests"),
        where("ownerId", "==", currentUser.uid)
      );

      const snapshot = await getDocs(requestsQuery);

      const requestList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setRequests(requestList);
    } catch (error) {
      console.error("Error loading collaboration requests:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (
    userId,
    title,
    message,
    projectId
  ) => {
    if (!userId) {
      return;
    }

    await addDoc(collection(db, "notifications"), {
      userId: userId,
      title: title,
      message: message,
      projectId: projectId,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  };

  const notifyAdmins = async (title, message, projectId) => {
    try {
      const adminQuery = query(
        collection(db, "users"),
        where("role", "==", "Admin")
      );

      const adminSnapshot = await getDocs(adminQuery);

      const adminNotifications = adminSnapshot.docs.map(
        async (adminDocument) => {
          await sendNotification(
            adminDocument.id,
            title,
            message,
            projectId
          );
        }
      );

      await Promise.all(adminNotifications);
    } catch (error) {
      console.error("Admin notification error:", error);
    }
  };

  const handleRequest = async (request, newStatus) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      setProcessingId(request.id);

      // Get project details
      const projectReference = doc(
        db,
        "projects",
        request.projectId
      );

      const projectSnapshot = await getDoc(projectReference);

      if (!projectSnapshot.exists()) {
        alert("Project not found.");
        return;
      }

      const projectData = projectSnapshot.data();

      // Check actual current project owner
      if (projectData.ownerId !== currentUser.uid) {
        alert(
          "You are not allowed to accept or reject this request."
        );
        return;
      }

      // Check request owner
      if (request.ownerId !== currentUser.uid) {
        alert(
          "You are not the owner of this collaboration request."
        );
        return;
      }

      // Only pending requests can be processed
      if (request.status !== "Pending") {
        alert("This request has already been processed.");
        return;
      }

      // Check whether project is already taken
      if (
        newStatus === "Accepted" &&
        (
          projectData.collaboratorId ||
          projectData.status === "In Progress" ||
          projectData.status === "Completed"
        )
      ) {
        alert("This project already has a collaborator.");
        return;
      }

      // Update collaboration request status
      await updateDoc(
        doc(db, "collaboration_requests", request.id),
        {
          status: newStatus,
        }
      );

      // IMPORTANT:
      // When Vino accepts Kamali's request,
      // Kamali becomes the new project owner.
      if (newStatus === "Accepted") {
        await updateDoc(projectReference, {
          ownerId: request.requesterId,
          collaboratorId: null,
          status: "In Progress",
        });
      }

      const notificationTitle =
        newStatus === "Accepted"
          ? "Collaboration Request Accepted"
          : "Collaboration Request Rejected";

      const notificationMessageForRequester =
        newStatus === "Accepted"
          ? `Your collaboration request for "${request.projectTitle}" has been accepted. You are now the owner of this project.`
          : `Your collaboration request for "${request.projectTitle}" has been rejected.`;

      const notificationMessageForOwner =
        newStatus === "Accepted"
          ? `You accepted the collaboration request for "${request.projectTitle}". Project ownership has been transferred to the requester.`
          : `You rejected the collaboration request for "${request.projectTitle}".`;

      const notificationMessageForAdmin =
        newStatus === "Accepted"
          ? `The collaboration request for "${request.projectTitle}" was accepted and project ownership was transferred to the requester.`
          : `The collaboration request for "${request.projectTitle}" was rejected.`;

      // Notification to requester
      await sendNotification(
        request.requesterId,
        notificationTitle,
        notificationMessageForRequester,
        request.projectId
      );

      // Notification to old owner
      await sendNotification(
        currentUser.uid,
        notificationTitle,
        notificationMessageForOwner,
        request.projectId
      );

      // Notification to admins
      await notifyAdmins(
        notificationTitle,
        notificationMessageForAdmin,
        request.projectId
      );

      alert(
        newStatus === "Accepted"
          ? "✅ Request accepted. Project ownership transferred successfully!"
          : "❌ Collaboration request rejected!"
      );

      await loadRequests();
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Error: " + error.message);
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
            color: "#123c69",
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
          Only current project owners can accept or reject requests.
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
              You don't have any collaboration requests for your projects.
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
                  color: "#123c69",
                }}
              >
                {request.projectTitle || "Untitled Project"}
              </h2>

              <p>
                <strong>Requester:</strong>{" "}
                {request.requesterEmail || "Not Available"}
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
                  {request.status || "Pending"}
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
                    {processingId === request.id
                      ? "Processing..."
                      : "✅ Accept"}
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
                    {processingId === request.id
                      ? "Processing..."
                      : "❌ Reject"}
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