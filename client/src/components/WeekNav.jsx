import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export default function WeekNav({ currentWeek, setCurrentWeek }) {
  const startOfWeek = currentWeek.startOf("isoWeek").format("DD/MM");
  const endOfWeek = currentWeek.endOf("isoWeek").format("DD/MM");
  const year = currentWeek.isoWeekYear();

  return (
    <div style={styles.container}>
      <button style={styles.btn} onClick={() => setCurrentWeek(currentWeek.subtract(1, "week"))}>
        ← Anterior
      </button>

      <span style={styles.label}>
        {startOfWeek} — {endOfWeek} · {year}
      </span>

      <button style={styles.btn} onClick={() => setCurrentWeek(currentWeek.add(1, "week"))}>
        Próxima →
      </button>

      <button style={styles.todayBtn} onClick={() => setCurrentWeek(dayjs())}>
        Hoje
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "0.75rem",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  btn: {
    padding: "0.4rem 1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "1rem",
    minWidth: "200px",
    textAlign: "center",
  },
  todayBtn: {
    padding: "0.4rem 1rem",
    borderRadius: "8px",
    border: "none",
    background: "#6c63ff",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
};