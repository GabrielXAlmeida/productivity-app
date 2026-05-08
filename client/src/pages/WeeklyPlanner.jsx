import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import api from "../api/axios";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import WeekNav from "../components/WeekNav";
import HabitsSection from "../components/HabitsSection";

dayjs.extend(isoWeek);

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const globalStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default function WeeklyPlanner() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("planner");
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const weekCode = `${currentWeek.isoWeekYear()}-W${String(currentWeek.isoWeek()).padStart(2, "0")}`;

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < 768); }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    const date = currentWeek.startOf("week").add(dayIndex, "day").format("YYYY-MM-DD");
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

  async function handleReopenTask(id) {
    await api.patch(`/tasks/${id}/reopen`);
    fetchTasks();
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const weekStart = currentWeek.startOf("week");
  const weekEnd   = currentWeek.endOf("week");
  const weekLabel = `${weekStart.format("DD/MM")} — ${weekEnd.format("DD/MM")} · ${weekStart.format("YYYY")}`;

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📅 Weekly Planner</h1>
        <div style={styles.headerActions}>
          <button style={styles.dashboardBtn} onClick={() => navigate("/dashboard")}>
            📊 Dashboard
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === "planner" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("planner")}
        >
          📋 Planner
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "habits" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("habits")}
        >
          🌱 Hábitos
        </button>
      </div>

      <div key={activeTab} style={styles.tabContent}>
        {activeTab === "planner" && (
          <>
            {/* WeekNav — compacto no mobile, original no desktop */}
            {isMobile ? (
              <div style={styles.weekNavMobile}>
                <button style={styles.navBtn} onClick={() => setCurrentWeek(currentWeek.subtract(1, "week"))}>
                  ←
                </button>
                <span style={styles.weekLabelMobile}>{weekLabel}</span>
                <button style={styles.navBtn} onClick={() => setCurrentWeek(currentWeek.add(1, "week"))}>
                  →
                </button>
                <button style={styles.todayBtn} onClick={() => setCurrentWeek(dayjs())}>
                  Hoje
                </button>
              </div>
            ) : (
              <WeekNav currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />
            )}

            {/* DESKTOP — grid horizontal de 7 colunas */}
            {!isMobile && (
              <div style={styles.grid}>
                {DAYS.map((day, i) => {
                  const date = currentWeek.startOf("week").add(i, "day").format("YYYY-MM-DD");
                  const dayTasks = getTasksForDay(i);
                  const isToday = date === dayjs().format("YYYY-MM-DD");

                  return (
                    <div key={day} style={{ ...styles.column, ...(isToday ? styles.todayColumn : {}) }}>
                      <div style={styles.dayHeader}>
                        <span style={styles.dayName}>{day}</span>
                        <span style={styles.dayDate}>
                          {currentWeek.startOf("week").add(i, "day").format("DD/MM")}
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
                            onReopen={handleReopenTask}
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
            )}

            {/* MOBILE — lista vertical */}
            {isMobile && (
              <div style={styles.dayList}>
                {DAYS.map((day, i) => {
                  const date = currentWeek.startOf("week").add(i, "day").format("YYYY-MM-DD");
                  const dayTasks = getTasksForDay(i);
                  const isToday = date === dayjs().format("YYYY-MM-DD");

                  return (
                    <div key={day} style={{ ...styles.dayRow, ...(isToday ? styles.todayRow : {}) }}>
                      {/* Label lateral */}
                      <div style={styles.dayLabel}>
                        <span style={{ ...styles.dayLabelName, ...(isToday ? styles.todayLabelName : {}) }}>
                          {day}
                        </span>
                        <span style={styles.dayLabelDate}>
                          {currentWeek.startOf("week").add(i, "day").format("DD/MM")}
                        </span>
                      </div>

                      {/* Conteúdo */}
                      <div style={styles.dayContent}>
                        {dayTasks.length === 0 && (
                          <p style={styles.emptyDay}>Nenhuma tarefa</p>
                        )}
                        {dayTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onComplete={handleCompleteTask}
                            onReopen={handleReopenTask}
                          />
                        ))}
                        <button style={styles.addBtnMobile} onClick={() => handleNewTask(date)}>
                          + Adicionar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
          </>
        )}

        {activeTab === "habits" && <HabitsSection />}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f2f5",
    padding: "1.5rem",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  headerTitle: {
    fontSize: "1.5rem",
    color: "#333",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  dashboardBtn: {
    padding: "0.4rem 1rem",
    borderRadius: "8px",
    border: "2px solid #6c63ff",
    background: "transparent",
    color: "#6c63ff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.85rem",
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

  // Tabs
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  tab: {
    padding: "0.45rem 1.25rem",
    borderRadius: "20px",
    border: "2px solid #ddd",
    background: "transparent",
    color: "#888",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: {
    border: "2px solid #6c63ff",
    color: "#6c63ff",
    background: "#f3f1ff",
  },
  tabContent: {
    animation: "fadeInUp 0.2s ease",
  },

  // ── DESKTOP ──────────────────────────────────────────
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

  // ── MOBILE WeekNav ────────────────────────────────────
  weekNavMobile: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "#fff",
    borderRadius: "12px",
    padding: "0.6rem 0.75rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: "0.75rem",
  },
  weekLabelMobile: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    fontSize: "0.8rem",
    color: "#333",
  },
  navBtn: {
    padding: "0.35rem 0.6rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#555",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  todayBtn: {
    padding: "0.35rem 0.65rem",
    borderRadius: "8px",
    border: "none",
    background: "#6c63ff",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: "bold",
  },

  // ── MOBILE day list ───────────────────────────────────
  dayList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  dayRow: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    overflow: "hidden",
  },
  todayRow: {
    border: "2px solid #6c63ff",
  },
  dayLabel: {
    width: "76px",
    minWidth: "76px",
    background: "#f8f8fb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.75rem 0.4rem",
    borderRight: "1px solid #eee",
    gap: "0.2rem",
  },
  dayLabelName: {
    fontSize: "0.72rem",
    fontWeight: "700",
    color: "#444",
    textAlign: "center",
  },
  todayLabelName: {
    color: "#6c63ff",
  },
  dayLabelDate: {
    fontSize: "0.68rem",
    color: "#aaa",
  },
  dayContent: {
    flex: 1,
    padding: "0.6rem 0.7rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  emptyDay: {
    fontSize: "0.75rem",
    color: "#ccc",
    margin: 0,
  },
  addBtnMobile: {
    marginTop: "0.1rem",
    padding: "0.3rem",
    borderRadius: "8px",
    border: "1px dashed #ddd",
    background: "transparent",
    color: "#bbb",
    cursor: "pointer",
    fontSize: "0.75rem",
    textAlign: "left",
  },
};