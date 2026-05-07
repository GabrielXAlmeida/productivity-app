import { useState, useEffect } from "react";
import dayjs from "dayjs";
import api from "../api/axios";
import HabitCard from "./HabitCard";

export default function HabitsSection() {
  const [habits, setHabits] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [checkedToday, setCheckedToday] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", target_days: "" });
  const [loading, setLoading] = useState(true);

  const today = dayjs().format("YYYY-MM-DD");
  const thisMonth = dayjs().format("YYYY-MM");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await api.get("/habits");
      const habitsData = res.data;
      setHabits(habitsData);

      const [streakResults, checkinResults] = await Promise.all([
        Promise.all(habitsData.map((h) => fetchStreak(h.id))),
        Promise.all(habitsData.map((h) => fetchTodayCheckin(h.id))),
      ]);

      const streakMap = {};
      const checkinMap = {};
      habitsData.forEach((h, i) => {
        streakMap[h.id] = streakResults[i];
        checkinMap[h.id] = checkinResults[i];
      });

      setStreaks(streakMap);
      setCheckedToday(checkinMap);
    } catch {
      console.error("Erro ao buscar hábitos");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStreak(habitId) {
    try {
      const res = await api.get(`/habits/${habitId}/streak`);
      return res.data.streak;
    } catch {
      return 0;
    }
  }

  async function fetchTodayCheckin(habitId) {
    try {
      const res = await api.get(`/checkins?habitId=${habitId}&month=${thisMonth}`);
      const todayEntry = res.data.find((c) => c.checked_date === today);
      return todayEntry ? todayEntry.id : null;
    } catch {
      return null;
    }
  }

  async function handleToggleCheckin(habitId, isChecked) {
    if (isChecked) {
      const checkinId = checkedToday[habitId];
      await api.delete(`/checkins/${checkinId}`);
      setCheckedToday((prev) => ({ ...prev, [habitId]: null }));
      setStreaks((prev) => ({ ...prev, [habitId]: Math.max(0, (prev[habitId] || 1) - 1) }));
    } else {
      const res = await api.post("/checkins", { habit_id: habitId, checked_date: today });
      setCheckedToday((prev) => ({ ...prev, [habitId]: res.data.id }));
      setStreaks((prev) => ({ ...prev, [habitId]: (prev[habitId] || 0) + 1 }));
    }
  }

  async function handleDeleteHabit(id) {
    if (!confirm("Deletar este hábito e todos os check-ins?")) return;
    await api.delete(`/habits/${id}`);
    fetchAll();
  }

  function handleEditHabit(habit) {
    setEditingHabit(habit);
    setForm({
      name: habit.name,
      category: habit.category || "",
      target_days: habit.target_days ?? "",
    });
    setModalOpen(true);
  }

  function handleNewHabit() {
    setEditingHabit(null);
    setForm({ name: "", category: "", target_days: "" });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return alert("Nome é obrigatório.");

    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      target_days: form.target_days !== "" ? parseInt(form.target_days) : null,
    };

    if (editingHabit) {
      const res = await api.put(`/habits/${editingHabit.id}`, payload);
      // atualiza só o hábito editado localmente, sem refazer fetchAll
      setHabits((prev) => prev.map((h) => h.id === editingHabit.id ? res.data : h));
    } else {
      await api.post("/habits", payload);
      fetchAll();
    }

    setModalOpen(false);
  }

  if (loading) {
    return <div style={styles.loading}>Carregando hábitos...</div>;
  }

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>🌱 Hábitos</h2>
        <button style={styles.addBtn} onClick={handleNewHabit}>+ Novo hábito</button>
      </div>

      {habits.length === 0 ? (
        <div style={styles.empty}>
          <p>Nenhum hábito cadastrado ainda.</p>
          <button style={styles.addBtnEmpty} onClick={handleNewHabit}>Criar meu primeiro hábito</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              checkedToday={!!checkedToday[habit.id]}
              streak={streaks[habit.id] ?? 0}
              onToggleCheckin={handleToggleCheckin}
              onDelete={handleDeleteHabit}
              onEdit={handleEditHabit}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <div style={styles.overlay} onClick={() => setModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>
              {editingHabit ? "Editar hábito" : "Novo hábito"}
            </h3>

            <label style={styles.label}>Nome *</label>
            <input
              style={styles.input}
              placeholder="Ex: Beber água"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />

            <label style={styles.label}>Categoria</label>
            <input
              style={styles.input}
              placeholder="Ex: saúde, estudo..."
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            />

            <label style={styles.label}>Meta (dias por semana)</label>
            <input
              style={styles.input}
              type="number"
              min="1"
              max="7"
              placeholder="Ex: 5"
              value={form.target_days}
              onChange={(e) => setForm((p) => ({ ...p, target_days: e.target.value }))}
            />

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button style={styles.saveBtn} onClick={handleSave}>
                {editingHabit ? "Salvar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  section: {
    marginTop: "1.5rem",
    padding: "1.25rem",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#333",
    margin: 0,
  },
  addBtn: {
    padding: "0.4rem 1rem",
    borderRadius: "20px",
    border: "none",
    background: "#6c63ff",
    color: "#fff",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "0.85rem",
  },
  loading: {
    textAlign: "center",
    color: "#aaa",
    padding: "2rem",
  },
  empty: {
    textAlign: "center",
    color: "#aaa",
    padding: "2rem 1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  addBtnEmpty: {
    padding: "0.5rem 1.25rem",
    borderRadius: "20px",
    border: "none",
    background: "#6c63ff",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    padding: "1.75rem",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  },
  modalTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#222",
    margin: "0 0 0.5rem",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#555",
    marginTop: "0.5rem",
  },
  input: {
    padding: "0.55rem 0.75rem",
    borderRadius: "8px",
    border: "1.5px solid #e0e0e0",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  cancelBtn: {
    padding: "0.45rem 1rem",
    borderRadius: "8px",
    border: "1.5px solid #ddd",
    background: "transparent",
    color: "#666",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  saveBtn: {
    padding: "0.45rem 1.25rem",
    borderRadius: "8px",
    border: "none",
    background: "#6c63ff",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
};