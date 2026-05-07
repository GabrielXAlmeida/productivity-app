import { useState } from "react";

export default function HabitCard({ habit, checkedToday, streak, onToggleCheckin, onDelete, onEdit }) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await onToggleCheckin(habit.id, checkedToday);
    setLoading(false);
  }

  return (
    <div style={{ ...styles.card, ...(checkedToday ? styles.cardDone : {}) }}>
      <div style={styles.top}>
        <div style={styles.info}>
          <span style={styles.name}>{habit.name}</span>
          {habit.category && (
            <span style={styles.category}>{habit.category}</span>
          )}
        </div>
        <div style={styles.actions}>
          <button style={styles.iconBtn} onClick={() => onEdit(habit)} title="Editar">✏️</button>
          <button style={styles.iconBtn} onClick={() => onDelete(habit.id)} title="Deletar">🗑️</button>
        </div>
      </div>

      <div style={styles.bottom}>
        <div style={styles.streak}>
          <span style={styles.streakIcon}>🔥</span>
          <span style={styles.streakNum}>{streak}</span>
          <span style={styles.streakLabel}>dias seguidos</span>
        </div>

        <button
          style={{ ...styles.checkBtn, ...(checkedToday ? styles.checkBtnDone : {}) }}
          onClick={handleToggle}
          disabled={loading}
        >
          {loading ? "..." : checkedToday ? "✓ Feito" : "Marcar hoje"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "14px",
    padding: "1rem 1.1rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
    border: "2px solid transparent",
    transition: "border 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  cardDone: {
    border: "2px solid #6c63ff",
    background: "#faf9ff",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.5rem",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    flex: 1,
  },
  name: {
    fontWeight: "700",
    fontSize: "0.95rem",
    color: "#222",
  },
  category: {
    fontSize: "0.72rem",
    color: "#888",
    background: "#f0f0f0",
    borderRadius: "20px",
    padding: "0.15rem 0.5rem",
    width: "fit-content",
    textTransform: "capitalize",
  },
  actions: {
    display: "flex",
    gap: "0.2rem",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: "0.2rem",
    borderRadius: "6px",
    opacity: 0.6,
    transition: "opacity 0.15s",
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streak: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  streakIcon: {
    fontSize: "1rem",
  },
  streakNum: {
    fontWeight: "800",
    fontSize: "1.1rem",
    color: "#6c63ff",
  },
  streakLabel: {
    fontSize: "0.72rem",
    color: "#aaa",
  },
  checkBtn: {
    padding: "0.35rem 0.85rem",
    borderRadius: "20px",
    border: "2px solid #6c63ff",
    background: "transparent",
    color: "#6c63ff",
    fontWeight: "600",
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  checkBtnDone: {
    background: "#6c63ff",
    color: "#fff",
  },
};