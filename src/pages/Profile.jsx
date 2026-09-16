import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

import {
  doc,
  getDoc,
} from "firebase/firestore";

function Profile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          alert("Please login first.");
          navigate("/login");
          return;
        }

        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          setUserData({
            ...userSnapshot.data(),
            email: currentUser.email,
          });
        } else {
          setUserData({
            name: currentUser.displayName || "User",
            email: currentUser.email,
            role: "Student",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not Available";
    }

    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString();
    }

    return new Date(dateValue).toLocaleDateString();
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f7fb",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>⏳ Loading Profile...</h2>
      </div>
    );
  }

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
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "35px",
          borderRadius: "15px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#123c69",
            marginBottom: "10px",
          }}
        >
          👤 My Profile
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          View your account information
        </p>

        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            backgroundColor: "#123c69",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "38px",
            fontWeight: "bold",
            margin: "0 auto 30px",
          }}
        >
          {userData?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                margin: 0,
                color: "#777",
                fontSize: "14px",
              }}
            >
              Full Name
            </p>

            <h3
              style={{
                margin: "6px 0 0",
                color: "#123c69",
                overflowWrap: "anywhere",
              }}
            >
              {userData?.name || "Not Available"}
            </h3>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                margin: 0,
                color: "#777",
                fontSize: "14px",
              }}
            >
              Email Address
            </p>

            <h3
              style={{
                margin: "6px 0 0",
                color: "#123c69",
                overflowWrap: "anywhere",
              }}
            >
              {userData?.email || "Not Available"}
            </h3>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                margin: 0,
                color: "#777",
                fontSize: "14px",
              }}
            >
              User Role
            </p>

            <span
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "7px 14px",
                borderRadius: "20px",
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
                fontWeight: "bold",
              }}
            >
              {userData?.role || "Student"}
            </span>
          </div>

          <div>
            <p
              style={{
                margin: 0,
                color: "#777",
                fontSize: "14px",
              }}
            >
              Account Created
            </p>

            <h3
              style={{
                margin: "6px 0 0",
                color: "#123c69",
              }}
            >
              {formatDate(userData?.createdAt)}
            </h3>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            width: "100%",
            marginTop: "25px",
            padding: "13px",
            backgroundColor: "#123c69",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Profile;