import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(notificationsQuery);

      const notificationList = snapshot.docs.map(
        (docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })
      );

      setNotifications(notificationList);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";

    if (timestamp.toDate) {
      return timestamp
        .toDate()
        .toLocaleString("en-IN");
    }

    return new Date(timestamp).toLocaleString(
      "en-IN"
    );
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
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow:
              "0 3px 12px rgba(0,0,0,0.08)",
            marginBottom: "25px",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "10px",
            }}
          >
            🔔 Notifications
          </h1>

          <p
            style={{
              color: "#666",
              marginBottom: 0,
            }}
          >
            Stay updated with recent project activities.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "50px",
              textAlign: "center",
              borderRadius: "12px",
            }}
          >
            <h2>⏳ Loading Notifications...</h2>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div
            style={{
              backgroundColor: "white",
              padding: "50px",
              textAlign: "center",
              borderRadius: "12px",
              boxShadow:
                "0 3px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "50px" }}>
              🔔
            </div>

            <h2>No Notifications</h2>

            <p style={{ color: "#666" }}>
              New project activities will appear here.
            </p>
          </div>
        ) : (
          /* Notifications List */
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                backgroundColor: "white",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "12px",
                boxShadow:
                  "0 3px 12px rgba(0,0,0,0.08)",
                borderLeft:
                  "5px solid #2563eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: "15px",
                }}
              >
                <div>
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "8px",
                    }}
                  >
                    🔔{" "}
                    {notification.title ||
                      "Project Activity"}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 10px",
                      color: "#444",
                      lineHeight: "1.5",
                    }}
                  >
                    {notification.message ||
                      "New activity detected."}
                  </p>

                  <small
                    style={{
                      color: "#777",
                    }}
                  >
                    🕒{" "}
                    {formatDate(
                      notification.createdAt
                    )}
                  </small>
                </div>
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
            onClick={() =>
              navigate("/dashboard")
            }
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

export default Notifications;