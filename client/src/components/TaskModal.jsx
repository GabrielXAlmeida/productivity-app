import { useState, useEffect } from "react";
import api from "../api/axios";

export default function TaskModal({ task, selectedDate, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    scheduled_date: selectedDate || "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        scheduled_date: task.scheduled_date || selectedDate || "",
      });
    }
  }, [task]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (task) {
        await api.put(`/tasks/${task.id}`, form);
      } else {
        await api.post("/tasks", form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao salvar tarefa");
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

          <div style={styles.buttons}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" style={styles.saveBtn}>
              {task ? "Salvar" : "Criar"}
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
  },
  modal: {
    background: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
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