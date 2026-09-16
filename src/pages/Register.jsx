import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";

import { createUserWithEmailAndPassword } from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const registerUser = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    try {
      // Create Firebase Authentication account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      // Save user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: serverTimestamp(),
      });

      alert("Registration Successful! 🎉");

      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f7fb",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: "center",
            fontSize: "48px",
            marginBottom: "10px",
          }}
        >
          🚀
        </div>

        {/* Title */}
        <h1
          style={{
            textAlign: "center",
            margin: "0 0 10px",
            fontSize: "30px",
            color: "#111827",
          }}
        >
          Project Collaborate
        </h1>

        <h2
          style={{
            textAlign: "center",
            margin: "0 0 10px",
            fontSize: "22px",
            color: "#374151",
          }}
        >
          Create Account
        </h2>

        <p
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#6b7280",
          }}
        >
          Join students and collaborate on projects.
        </p>

        {/* Full Name */}
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            color: "#374151",
          }}
        >
          Full Name
        </label>

        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "15px",
            marginBottom: "20px",
            boxSizing: "border-box",
          }}
        />

        {/* Email */}
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            color: "#374151",
          }}
        >
          Email
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "15px",
            marginBottom: "20px",
            boxSizing: "border-box",
          }}
        />

        {/* Password */}
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            color: "#374151",
          }}
        >
          Password
        </label>

        <div
          style={{
            position: "relative",
            width: "100%",
            marginBottom: "25px",
          }}
        >
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 48px 14px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: "21px",
              padding: "4px",
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Register Button */}
        <button
          onClick={registerUser}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          📝 Create Account
        </button>

        {/* Login */}
        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#6b7280",
          }}
        >
          Already have an account?
        </p>

        <Link
          to="/login"
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            padding: "12px",
            border: "1px solid #2563eb",
            borderRadius: "8px",
            color: "#2563eb",
            fontWeight: "bold",
            textDecoration: "none",
            boxSizing: "border-box",
          }}
        >
          🔐 Back to Login
        </Link>
      </div>
    </div>
  );
}

export default Register;