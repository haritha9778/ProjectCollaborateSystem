import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";

function UploadProject() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [progress, setProgress] = useState("");
  const [github, setGithub] = useState("");
  const [loading, setLoading] = useState(false);

  const saveProject = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !category ||
      progress === ""
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (Number(progress) < 0 || Number(progress) > 100) {
      alert("Progress must be between 0 and 100.");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // Save project
      const projectReference = await addDoc(
        collection(db, "projects"),
        {
          title: title.trim(),
          description: description.trim(),
          category: category,
          progress: Number(progress),
          githubLink: github.trim(),

          ownerId: currentUser.uid,

          status:
            Number(progress) === 100
              ? "Completed"
              : "Open",

          collaboratorId: null,

          createdAt: serverTimestamp(),
        }
      );

      // Notification for project owner
      await addDoc(collection(db, "notifications"), {
        userId: currentUser.uid,
        title: "Project Uploaded Successfully",
        message: `Your project "${title.trim()}" was uploaded successfully.`,
        projectId: projectReference.id,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      // Find Admin users
      const adminQuery = query(
        collection(db, "users"),
        where("role", "==", "Admin")
      );

      const adminSnapshot = await getDocs(adminQuery);

      // Notification only for Admin users
      const adminNotifications = adminSnapshot.docs.map(
        async (adminDocument) => {
          return addDoc(collection(db, "notifications"), {
            userId: adminDocument.id,
            title: "New Project Uploaded",
            message: `${currentUser.email} uploaded a new project "${title.trim()}".`,
            projectId: projectReference.id,
            isRead: false,
            createdAt: serverTimestamp(),
          });
        }
      );

      await Promise.all(adminNotifications);

      alert("✅ Project Uploaded Successfully!");

      navigate("/myprojects");
    } catch (error) {
      console.error("Error uploading project:", error);
      alert("Project upload failed: " + error.message);
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
          maxWidth: "650px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "35px",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginTop: 0,
            marginBottom: "10px",
            color: "#123c69",
          }}
        >
          📤 Upload Project
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Share your incomplete or completed project with other students.
        </p>

        <label>
          <strong>Project Title *</strong>
        </label>

        <input
          type="text"
          placeholder="Enter project title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <label>
          <strong>Project Description *</strong>
        </label>

        <textarea
          rows="5"
          placeholder="Describe your project..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "15px",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <label>
          <strong>Category *</strong>
        </label>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "15px",
            boxSizing: "border-box",
            backgroundColor: "white",
          }}
        >
          <option value="">Select Project Category</option>
          <option value="Web Development">Web Development</option>
          <option value="Mobile App">Mobile App</option>
          <option value="Java">Java</option>
          <option value="Python">Python</option>
          <option value="Data Science">Data Science</option>
          <option value="Other">Other</option>
        </select>

        <label>
          <strong>Project Progress (%) *</strong>
        </label>

        <input
          type="number"
          min="0"
          max="100"
          placeholder="Example: 50"
          value={progress}
          onChange={(event) => setProgress(event.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <label>
          <strong>GitHub Link</strong>
        </label>

        <input
          type="url"
          placeholder="https://github.com/username/project"
          value={github}
          onChange={(event) => setGithub(event.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "30px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={saveProject}
            disabled={loading}
            style={{
              padding: "12px 25px",
              backgroundColor: loading ? "#999" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
            }}
          >
            {loading ? "⏳ Uploading..." : "📤 Upload Project"}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "12px 25px",
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            ⬅ Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadProject;