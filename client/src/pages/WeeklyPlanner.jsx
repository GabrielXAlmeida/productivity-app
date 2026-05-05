import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import api from "../api/axios";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import WeekNav from "../components/WeekNav";

dayjs.extend(isoWeek);

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export default function WeeklyPlanner() {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const weekCode = `${currentWeek.isoWeekYear()}-W${String(currentWeek.isoWeek()).padStart(2, "0")}`;

  useEffect(() => {
    fetchTasks();
  }, [currentWeek]);

  async function fetchTasks() {
    try {
      const res = await api.get(`/tasks?week=${weekCode}`);
      setTasks(res.data);
    } catch {
      console.error("Erro ao buscar tarefas");
    }
  }

  function getTasksForDay(dayIndex) {
    const date = currentWeek.startOf("isoWeek").add(dayIndex, "day").format("YYYY-MM-DD");
    return tasks.filter((t) => t.scheduled_date === date);
  }

  function handleNewTask(date) {
    setEditingTask(null);
    setSelectedDate(date);
    setModalOpen(true);
  }

  function handleEditTask(task) {
    setEditingTask(task);
    setSelectedDate(task.scheduled_date);
    setModalOpen(true);
  }

  async function handleDeleteTask(id) {
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  }

  async function handleCompleteTask(id) {
    await api.patch(`/tasks/${id}/complete`);
    fetchTasks();
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📅 Weekly Planner</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>Sair</button>
      </div>

      {/* Navegação de semana */}
      <WeekNav currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />

      {/* Grade de dias */}
      <div style={styles.grid}>
        {DAYS.map((day, i) => {
          const date = currentWeek.startOf("isoWeek").add(i, "day").format("YYYY-MM-DD");
          const dayTasks = getTasksForDay(i);
          const isToday = date === dayjs().format("YYYY-MM-DD");

          return (
            <div key={day} style={{ ...styles.column, ...(isToday ? styles.todayColumn : {}) }}>
              <div style={styles.dayHeader}>
                <span style={styles.dayName}>{day}</span>
                <span style={styles.dayDate}>
                  {currentWeek.startOf("isoWeek").add(i, "day").format("DD/MM")}
                </span>
              </div>

              <div style={styles.taskList}>
                {dayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onComplete={handleCompleteTask}
                  />
                ))}
              </div>

              <button style={styles.addBtn} onClick={() => handleNewTask(date)}>
                + Adicionar
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          selectedDate={selectedDate}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f2f5",
    padding: "1.5rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  headerTitle: {
    fontSize: "1.5rem",
    color: "#333",
    margin: 0,
  },
  logoutBtn: {
    padding: "0.4rem 1rem",
    borderRadius: "8px",
    border: "none",
    background: "#ff4d4d",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  column: {
    background: "#fff",
    borderRadius: "12px",
    padding: "0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minHeight: "300px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  todayColumn: {
    border: "2px solid #6c63ff",
  },
  dayHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  dayName: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "0.9rem",
  },
  dayDate: {
    fontSize: "0.75rem",
    color: "#999",
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    flex: 1,
  },
  addBtn: {
    marginTop: "auto",
    padding: "0.4rem",
    borderRadius: "8px",
    border: "1px dashed #ccc",
    background: "transparent",
    color: "#999",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
};