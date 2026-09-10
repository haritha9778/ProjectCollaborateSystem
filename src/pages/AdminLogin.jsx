import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const adminEmail = "haritha4887@gmail.com";

  const loginAdmin = async () => {
    if (email === "" || password === "") {
      alert("Please fill all fields.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (email !== adminEmail) {
        alert("❌ This account is not an Admin.");
        return;
      }

      alert("✅ Admin Login Successful");
      navigate("/admin-dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "60px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >
      <h1>👨‍💼 Admin Login</h1>

      <input
        type="email"
        placeholder="Admin Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
        }}
      />

      <button
        onClick={loginAdmin}
        style={{
          width: "100%",
          padding: "12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Login as Admin
      </button>

      <br />
      <br />

      <button
        onClick={() => navigate("/login")}
        style={{
          width: "100%",
          padding: "12px",
        }}
      >
        ⬅ Back to Student Login
      </button>
    </div>
  );
}

export default AdminLogin;