import { getSupabase } from '../db/supabase.js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';
dayjs.extend(isoWeek);

// ── GET /stats/weekly ────────────────────────────────────

export async function getWeeklyStats(req, res) {
  const supabase = getSupabase();
  const userId = req.userId;

  // Semana atual por padrão, ou ?week=YYYY-Www
  const weekParam = req.query.week;
  let startDate, endDate;

  if (weekParam) {
    const [yearStr, weekStr] = weekParam.split('-W');
    const d = dayjs().year(parseInt(yearStr)).isoWeek(parseInt(weekStr));
    startDate = d.startOf('isoWeek').format('YYYY-MM-DD');
    endDate   = d.endOf('isoWeek').format('YYYY-MM-DD');
  } else {
    startDate = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
    endDate   = dayjs().endOf('isoWeek').format('YYYY-MM-DD');
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('status, priority')
    .eq('user_id', userId)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate);

  if (error) return res.status(500).json({ error: error.message });

  const total     = data.length;
  const completed = data.filter((t) => t.status === 'completed').length;
  const pending   = total - completed;
  const rate      = total > 0 ? Math.round((completed / total) * 100) : 0;

  const byPriority = {
    high:   { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    low:    { total: 0, completed: 0 },
  };

  for (const task of data) {
    const p = task.priority || 'medium';
    if (byPriority[p]) {
      byPriority[p].total++;
      if (task.status === 'completed') byPriority[p].completed++;
    }
  }

  return res.json({ startDate, endDate, total, completed, pending, completion_rate: rate, by_priority: byPriority });
}

// ── GET /stats/habits ────────────────────────────────────

export async function getHabitsStats(req, res) {
  const supabase = getSupabase();
  const userId = req.userId;

  const { data: habits, error } = await supabase
    .from('habits')
    .select('id, name, category')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  if (!habits.length) return res.json([]);

  const month = req.query.month || dayjs().format('YYYY-MM');
  const startDate = `${month}-01`;
  const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
  const daysInMonth = dayjs(startDate).daysInMonth();

  const { data: checkins, error: ciError } = await supabase
    .from('habit_checkins')
    .select('habit_id, checked_date')
    .eq('user_id', userId)
    .gte('checked_date', startDate)
    .lte('checked_date', endDate);

  if (ciError) return res.status(500).json({ error: ciError.message });

  // Agrupa check-ins por hábito
  const checkinMap = {};
  for (const ci of checkins) {
    if (!checkinMap[ci.habit_id]) checkinMap[ci.habit_id] = new Set();
    checkinMap[ci.habit_id].add(ci.checked_date);
  }

  const stats = habits.map((habit) => {
    const daysChecked = checkinMap[habit.id]?.size ?? 0;
    const rate = Math.round((daysChecked / daysInMonth) * 100);
    return {
      habit_id: habit.id,
      name: habit.name,
      category: habit.category,
      days_checked: daysChecked,
      days_in_month: daysInMonth,
      completion_rate: rate,
    };
  });

  return res.json(stats);
}