import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [progress, setProgress] = useState("");
  const [github, setGithub] = useState("");

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const docRef = doc(db, "projects", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setTitle(data.title || "");
        setDescription(data.description || "");
        setCategory(data.category || "");
        setProgress(data.progress ?? "");
        setGithub(data.github || "");
      } else {
        alert("Project not found!");
        navigate("/myprojects");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const updateProject = async () => {
    if (
      title.trim() === "" ||
      description.trim() === "" ||
      category.trim() === "" ||
      progress === ""
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (Number(progress) < 0 || Number(progress) > 100) {
      alert("Progress must be between 0 and 100.");
      return;
    }

    try {
      // Update Project
      await updateDoc(doc(db, "projects", id), {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        progress: Number(progress),
        github: github.trim(),
      });

      // Create Notification
      await addDoc(collection(db, "notifications"), {
        title: "✏️ Project Updated",
        message: `The project "${title.trim()}" has been updated.`,
        type: "project_update",
        createdAt: serverTimestamp(),
      });

      alert("✅ Project Updated Successfully!");
      navigate("/myprojects");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div
      style={{
        width: "500px",
        margin: "40px auto",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        ✏️ Edit Project
      </h1>

      <input
        type="text"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          boxSizing: "border-box",
        }}
      />

      <br />
      <br />

      <textarea
        rows="5"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          boxSizing: "border-box",
        }}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          boxSizing: "border-box",
        }}
      />

      <br />
      <br />

      <input
        type="number"
        min="0"
        max="100"
        placeholder="Progress"
        value={progress}
        onChange={(e) => setProgress(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          boxSizing: "border-box",
        }}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="GitHub Link"
        value={github}
        onChange={(e) => setGithub(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          boxSizing: "border-box",
        }}
      />

      <br />
      <br />

      <button
        onClick={updateProject}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        💾 Update Project
      </button>

      <button
        onClick={() => navigate("/myprojects")}
        style={{
          marginLeft: "10px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export default EditProject;