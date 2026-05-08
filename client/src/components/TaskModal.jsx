import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export default function TaskModal({ task, selectedDate, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    scheduled_date: selectedDate || "",
  });
  const [error, setError]         = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(task?.image_url || null);
  const [uploading, setUploading] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (task) {
      setForm({
        title:          task.title          || "",
        description:    task.description    || "",
        priority:       task.priority       || "medium",
        scheduled_date: task.scheduled_date || selectedDate || "",
      });
      setImagePreview(task.image_url || null);
    }
  }, [task]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleRemoveImage() {
    if (!task?.id || !task?.image_url) {
      // imagem ainda não salva — só limpa o preview local
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setRemovingImage(true);
    try {
      await api.delete(`/tasks/${task.id}/image`);
      setImagePreview(null);
      setImageFile(null);
    } catch {
      setError("Erro ao remover imagem.");
    } finally {
      setRemovingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      let savedTask;
      if (task) {
        const res = await api.put(`/tasks/${task.id}`, form);
        savedTask = res.data;
      } else {
        const res = await api.post("/tasks", form);
        savedTask = res.data;
      }

      // faz upload da imagem se houver arquivo novo
      if (imageFile && savedTask?.id) {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", imageFile);
        await api.post(`/tasks/${savedTask.id}/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao salvar tarefa");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>{task ? "Editar Tarefa" : "Nova Tarefa"}</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            name="title"
            placeholder="Título *"
            value={form.title}
            onChange={handleChange}
            required
          />
          <textarea
            style={{ ...styles.input, resize: "vertical", minHeight: "80px" }}
            name="description"
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={handleChange}
          />
          <select
            style={styles.input}
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="high">🔴 Alta</option>
            <option value="medium">🟡 Média</option>
            <option value="low">🟢 Baixa</option>
          </select>
          <input
            style={styles.input}
            type="date"
            name="scheduled_date"
            value={form.scheduled_date}
            onChange={handleChange}
          />

          {/* Seção de imagem */}
          <div style={styles.imageSection}>
            {imagePreview ? (
              <div style={styles.previewWrap}>
                <img src={imagePreview} alt="Preview" style={styles.previewImg} />
                <button
                  type="button"
                  style={styles.removeImageBtn}
                  onClick={handleRemoveImage}
                  disabled={removingImage}
                >
                  {removingImage ? "Removendo..." : "✕ Remover imagem"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                style={styles.uploadBtn}
                onClick={() => fileInputRef.current.click()}
              >
                📷 Adicionar imagem
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          <div style={styles.buttons}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" style={styles.saveBtn} disabled={uploading}>
              {uploading ? "Salvando..." : task ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "1rem", 
  },
  modal: {
    background: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  title: {
    margin: "0 0 1.5rem",
    color: "#333",
    fontSize: "1.2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  // Imagem
  imageSection: {
    marginTop: "0.25rem",
  },
  previewWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  previewImg: {
    width: "100%",
    maxHeight: "180px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #eee",
  },
  removeImageBtn: {
    padding: "0.4rem",
    borderRadius: "6px",
    border: "1px solid #ffcccc",
    background: "#fff5f5",
    color: "#ff4d4d",
    cursor: "pointer",
    fontSize: "0.8rem",
    width: "100%",
  },
  uploadBtn: {
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1.5px dashed #ccc",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    fontSize: "0.85rem",
    width: "100%",
  },

  buttons: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  cancelBtn: {
    flex: 1,
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
  },
  saveBtn: {
    flex: 1,
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    background: "#6c63ff",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
  },
};