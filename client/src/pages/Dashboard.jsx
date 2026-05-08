import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [xp, setXp] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [habitStats, setHabitStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < 640); }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [xpRes, weekRes, habitRes, achRes] = await Promise.all([
          api.get("/xp"),
          api.get("/stats/weekly"),
          api.get("/stats/habits"),
          api.get("/achievements"),
        ]);
        setXp(xpRes.data);
        setWeeklyStats(weekRes.data);
        setHabitStats(habitRes.data);
        setAchievements(achRes.data);
      } catch {
        setError("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <div style={styles.page}><p style={styles.loadingText}>Carregando...</p></div>;
  if (error)   return <div style={styles.page}><p style={{ color: "#ff4d4d" }}>{error}</p></div>;

  const { total_xp = 0, level = 1, xp_in_level = 0, xp_for_next = 100 } = xp || {};
  const xpPct = Math.min(100, Math.round((xp_in_level / xp_for_next) * 100));

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked   = achievements.filter((a) => !a.unlocked);

  const priorityConfig = {
    high:   { label: "Alta",  color: "#ef4444" },
    medium: { label: "Média", color: "#f59e0b" },
    low:    { label: "Baixa", color: "#10b981" },
  };

  // Em mobile, rows viram colunas
  const row = isMobile ? styles.rowMobile : styles.row;

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={() => navigate("/planner")}>
            ← Voltar
          </button>
          <h1 style={styles.headerTitle}>📊 Dashboard</h1>
        </div>
      </div>

      <div style={styles.content}>

        {/* Linha 1 — XP + Stats semanais */}
        <div style={row}>

          {/* XP */}
          <div style={{ ...styles.card, flex: 1 }}>
            <p style={styles.cardLabel}>Seu progresso</p>
            <div style={styles.xpHeader}>
              <span style={styles.xpLevel}>Nível {level}</span>
              <span style={styles.xpTotal}>{total_xp} XP</span>
            </div>
            <div style={styles.barTrack}>
              <div style={{ ...styles.barFill, width: `${xpPct}%` }} />
            </div>
            <div style={styles.xpFooter}>
              <span style={styles.xpSub}>{xp_in_level} XP neste nível</span>
              <span style={styles.xpSub}>{xp_for_next - xp_in_level} XP para o próximo</span>
            </div>
          </div>

          {/* Stats semanais */}
          <div style={{ ...styles.card, flex: isMobile ? 1 : 2 }}>
            <p style={styles.cardLabel}>Tarefas desta semana</p>
            <div style={styles.statsRow}>
              {[
                { icon: "✅", label: "Concluídas", value: weeklyStats?.completed ?? 0,             color: "#10b981" },
                { icon: "⏳", label: "Pendentes",  value: weeklyStats?.pending ?? 0,               color: "#f59e0b" },
                { icon: "📋", label: "Total",      value: weeklyStats?.total ?? 0,                 color: "#6c63ff" },
                { icon: "🎯", label: "Taxa",       value: `${weeklyStats?.completion_rate ?? 0}%`, color: "#ec4899" },
              ].map((s) => (
                <div key={s.label} style={styles.statBox}>
                  <span style={styles.statIcon}>{s.icon}</span>
                  <span style={{ ...styles.statValue, color: s.color }}>{s.value}</span>
                  <span style={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            {weeklyStats?.total > 0 && (
              <div style={styles.priorityRow}>
                {Object.entries(weeklyStats.by_priority).map(([key, val]) => {
                  const pct = val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0;
                  const { label, color } = priorityConfig[key];
                  return (
                    <div key={key} style={styles.priorityItem}>
                      <div style={styles.priorityTop}>
                        <span style={styles.priorityLabel}>{label}</span>
                        <span style={{ ...styles.priorityPct, color }}>{val.completed}/{val.total}</span>
                      </div>
                      <div style={styles.miniTrack}>
                        <div style={{ ...styles.miniFill, width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Linha 2 — Hábitos + Conquistas */}
        <div style={row}>

          {/* Hábitos */}
          <div style={{ ...styles.card, flex: 1 }}>
            <p style={styles.cardLabel}>🌱 Hábitos este mês</p>
            {!habitStats?.length ? (
              <p style={styles.emptyText}>Nenhum hábito cadastrado.</p>
            ) : (
              <div style={styles.habitList}>
                {habitStats.map((h) => {
                  const barColor =
                    h.completion_rate >= 70 ? "#10b981" :
                    h.completion_rate >= 40 ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={h.habit_id} style={styles.habitRow}>
                      <div style={styles.habitInfo}>
                        <span style={styles.habitName}>{h.name}</span>
                        {h.category && <span style={styles.habitCat}>{h.category}</span>}
                      </div>
                      <div style={styles.habitBarWrap}>
                        <div style={styles.habitTrack}>
                          <div style={{ ...styles.habitFill, width: `${h.completion_rate}%`, background: barColor }} />
                        </div>
                        <span style={{ ...styles.habitPct, color: barColor }}>{h.completion_rate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Conquistas */}
          <div style={{ ...styles.card, flex: isMobile ? 1 : 1.4 }}>
            <div style={styles.achHeader}>
              <p style={styles.cardLabel}>🏆 Conquistas</p>
              <span style={styles.achBadge}>{unlocked.length}/{achievements.length}</span>
            </div>
            <div style={{
              ...styles.achGrid,
              gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
            }}>
              {[...unlocked, ...locked].map((a) => (
                <div
                  key={a.key}
                  title={a.description}
                  style={{
                    ...styles.achCard,
                    opacity: a.unlocked ? 1 : 0.35,
                    filter: a.unlocked ? "none" : "grayscale(1)",
                    border: a.unlocked ? "1.5px solid #6c63ff33" : "1.5px solid #ddd",
                  }}
                >
                  {a.unlocked && <span style={styles.achCheck}>✓</span>}
                  <span style={styles.achIcon}>{a.icon}</span>
                  <span style={styles.achName}>{a.name}</span>
                  <span style={styles.achXp}>+{a.xp_reward} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f2f5",
    padding: "1rem 1.25rem",
  },
  loadingText: { color: "#999" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  backBtn: {
    padding: "0.4rem 0.9rem",
    borderRadius: "8px",
    border: "2px solid #6c63ff",
    background: "transparent",
    color: "#6c63ff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.82rem",
  },
  headerTitle: {
    fontSize: "1.3rem",
    color: "#333",
    margin: 0,
  },

  content: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  // Rows
  row: {
    display: "flex",
    gap: "1rem",
    alignItems: "stretch",
  },
  rowMobile: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  // Card base
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1rem 1.1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cardLabel: {
    fontSize: "0.7rem",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "0 0 0.65rem",
    fontWeight: "600",
  },

  // XP
  xpHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "0.65rem",
  },
  xpLevel: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#6c63ff",
  },
  xpTotal: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#aaa",
  },
  barTrack: {
    height: "8px",
    background: "#eee",
    borderRadius: "99px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "#6c63ff",
    borderRadius: "99px",
    transition: "width 0.5s ease",
  },
  xpFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "0.4rem",
  },
  xpSub: {
    fontSize: "0.68rem",
    color: "#ccc",
  },

  // Stats
  statsRow: {
    display: "flex",
    gap: "0.4rem",
    marginBottom: "0.85rem",
  },
  statBox: {
    flex: 1,
    background: "#f8f8fb",
    borderRadius: "10px",
    padding: "0.6rem 0.3rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.15rem",
  },
  statIcon: { fontSize: "1rem" },
  statValue: {
    fontSize: "1.2rem",
    fontWeight: "700",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "0.62rem",
    color: "#aaa",
    textAlign: "center",
  },

  // Priority
  priorityRow: {
    display: "flex",
    gap: "0.6rem",
  },
  priorityItem: { flex: 1 },
  priorityTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  priorityLabel: { fontSize: "0.68rem", color: "#aaa" },
  priorityPct:   { fontSize: "0.68rem", fontWeight: "700" },
  miniTrack: {
    height: "4px",
    background: "#eee",
    borderRadius: "99px",
    overflow: "hidden",
  },
  miniFill: {
    height: "100%",
    borderRadius: "99px",
    transition: "width 0.5s ease",
  },

  // Habits
  habitList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  habitRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
  },
  habitInfo: {
    width: "110px",
    flexShrink: 0,
  },
  habitName: {
    fontSize: "0.8rem",
    color: "#333",
    fontWeight: "500",
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  habitCat: {
    fontSize: "0.66rem",
    color: "#ccc",
    display: "block",
  },
  habitBarWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  habitTrack: {
    flex: 1,
    height: "6px",
    background: "#eee",
    borderRadius: "99px",
    overflow: "hidden",
  },
  habitFill: {
    height: "100%",
    borderRadius: "99px",
    transition: "width 0.5s ease",
  },
  habitPct: {
    fontSize: "0.7rem",
    fontWeight: "700",
    width: "32px",
    textAlign: "right",
    flexShrink: 0,
  },
  emptyText: {
    color: "#ccc",
    fontSize: "0.85rem",
  },

  // Achievements
  achHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.65rem",
  },
  achBadge: {
    background: "#f3f1ff",
    color: "#6c63ff",
    fontSize: "0.68rem",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  achGrid: {
    display: "grid",
    gap: "0.5rem",
  },
  achCard: {
    background: "#f8f8fb",
    borderRadius: "10px",
    padding: "0.6rem 0.4rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.2rem",
    position: "relative",
    cursor: "default",
  },
  achCheck: {
    position: "absolute",
    top: "5px",
    right: "7px",
    fontSize: "0.6rem",
    color: "#10b981",
    fontWeight: "700",
  },
  achIcon:  { fontSize: "1.2rem", lineHeight: 1 },
  achName:  { fontSize: "0.58rem", color: "#888", textAlign: "center", lineHeight: 1.3 },
  achXp:    { fontSize: "0.58rem", color: "#6c63ff", fontWeight: "700" },
};