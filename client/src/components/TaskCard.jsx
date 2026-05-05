const PRIORITY_COLORS = {
  high: "#ff4d4d",
  medium: "#ffaa00",
  low: "#00c853",
};

const PRIORITY_LABELS = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export default function TaskCard({ task, onEdit, onDelete, onComplete, onReopen }) {
  const isCompleted = task.status === "completed";

  return (
    <div style={{ ...styles.card, ...(isCompleted ? styles.completed : {}) }}>
      <div style={styles.topRow}>
        <span
          style={{
            ...styles.priority,
            background: PRIORITY_COLORS[task.priority] || "#ccc",
          }}
        >
          {PRIORITY_LABELS[task.priority] || task.priority}
        </span>

        {!isCompleted && (
          <button style={styles.completeBtn} onClick={() => onComplete(task.id)} title="Concluir">
            ✓
          </button>
        )}
      </div>

      <p style={{ ...styles.title, ...(isCompleted ? styles.strikethrough : {}) }}>
        {task.title}
      </p>

      {task.description && (
        <p style={styles.description}>{task.description}</p>
      )}

      {isCompleted ? (
        <button style={styles.reopenBtn} onClick={() => onReopen(task.id)}>
          ↩ Reabrir
        </button>
      ) : (
        <div style={styles.actions}>
          <button style={styles.editBtn} onClick={() => onEdit(task)}>
            Editar
          </button>
          <button style={styles.deleteBtn} onClick={() => onDelete(task.id)}>
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#f9f9f9",
    borderRadius: "8px",
    padding: "0.6rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    border: "1px solid #eee",
  },
  completed: {
    opacity: 0.6,
    background: "#f0f0f0",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priority: {
    fontSize: "0.65rem",
    color: "#fff",
    padding: "0.15rem 0.5rem",
    borderRadius: "20px",
    fontWeight: "bold",
  },
  completeBtn: {
    background: "#00c853",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: "bold",
  },
  title: {
    fontSize: "0.85rem",
    color: "#333",
    margin: 0,
    fontWeight: "500",
  },
  strikethrough: {
    textDecoration: "line-through",
    color: "#999",
  },
  description: {
    fontSize: "0.75rem",
    color: "#888",
    margin: 0,
  },
  actions: {
    display: "flex",
    gap: "0.4rem",
    marginTop: "0.2rem",
  },
  editBtn: {
    flex: 1,
    padding: "0.25rem",
    borderRadius: "6px",
    border: "1px solid #6c63ff",
    background: "transparent",
    color: "#6c63ff",
    cursor: "pointer",
    fontSize: "0.75rem",
  },
  deleteBtn: {
    flex: 1,
    padding: "0.25rem",
    borderRadius: "6px",
    border: "none",
    background: "#ff4d4d",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.75rem",
  },
  reopenBtn: {
    padding: "0.25rem",
    borderRadius: "6px",
    border: "1px solid #999",
    background: "transparent",
    color: "#666",
    cursor: "pointer",
    fontSize: "0.75rem",
    width: "100%",
  },
};