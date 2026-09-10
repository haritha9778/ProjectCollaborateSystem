import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginUser = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      alert("✅ Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      alert("Login Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f5f7fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px 20px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
          boxSizing: "border-box",
        }}
      >
        {/* Logo / Title */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              lineHeight: "1",
              marginBottom: "12px",
            }}
          >
            🚀
          </div>

          <h1
            style={{
              margin: "0",
              padding: "0",
              fontSize: "28px",
              lineHeight: "1.3",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Project Collaborate
          </h1>

          <h2
            style={{
              margin: "10px 0 0 0",
              padding: "0",
              fontSize: "20px",
              lineHeight: "1.3",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Student Login
          </h2>

          <p
            style={{
              margin: "12px 0 0 0",
              padding: "0",
              fontSize: "15px",
              lineHeight: "1.5",
              color: "#6b7280",
            }}
          >
            Login to manage and collaborate on projects.
          </p>
        </div>

        {/* Email */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "15px",
              fontWeight: "600",
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
              height: "48px",
              padding: "0 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "15px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loginUser();
              }
            }}
            style={{
              width: "100%",
              height: "48px",
              padding: "0 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={loginUser}
          disabled={loading}
          style={{
            width: "100%",
            height: "48px",
            backgroundColor: loading
              ? "#9ca3af"
              : "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading ? "⏳ Logging in..." : "🔐 Login"}
        </button>

        {/* Register Section */}
        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
          }}
        >
          <p
            style={{
              margin: "0 0 12px 0",
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Don't have an account?
          </p>

          <button
            onClick={() => navigate("/register")}
            style={{
              width: "100%",
              height: "46px",
              backgroundColor: "#ffffff",
              color: "#2563eb",
              border: "1px solid #2563eb",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📝 Create Account
          </button>
        </div>

        {/* Admin Login */}
        <button
          onClick={() => navigate("/admin-login")}
          style={{
            width: "100%",
            height: "46px",
            marginTop: "12px",
            backgroundColor: "#111827",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          👨‍💼 Admin Login
        </button>
      </div>
    </div>
  );
}

export default Login;