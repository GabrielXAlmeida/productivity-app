import { getSupabase } from '../db/supabase.js';
import { unlockAchievement } from './xpController.js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';
dayjs.extend(isoWeek);

// ── GET /achievements ────────────────────────────────────

export async function getAchievements(req, res) {
  const supabase = getSupabase();
  const userId = req.userId;

  const [{ data: all, error: e1 }, { data: unlocked, error: e2 }] = await Promise.all([
    supabase.from('achievements').select('*').order('xp_reward', { ascending: true }),
    supabase.from('user_achievements').select('achievement_key, unlocked_at').eq('user_id', userId),
  ]);

  if (e1 || e2) return res.status(500).json({ error: e1?.message || e2?.message });

  const unlockedMap = {};
  for (const u of unlocked) {
    unlockedMap[u.achievement_key] = u.unlocked_at;
  }

  const result = all.map((a) => ({
    key:         a.key,
    name:        a.name,
    description: a.description,
    xp_reward:   a.xp_reward,
    icon:        a.icon,
    unlocked:    !!unlockedMap[a.key],
    unlocked_at: unlockedMap[a.key] || null,
  }));

  return res.json(result);
}

// ── Verifica conquistas de streak ────────────────────────

export async function checkStreakAchievements(userId, habitId) {
  const supabase = getSupabase();

  const { data: habit } = await supabase
    .from('habits')
    .select('rest_days_allowed')
    .eq('id', habitId)
    .eq('user_id', userId)
    .single();

  if (!habit) return;

  const restDaysAllowed = habit.rest_days_allowed ?? 0;

  const { data: checkins } = await supabase
    .from('habit_checkins')
    .select('checked_date')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .order('checked_date', { ascending: false });

  if (!checkins?.length) return;

  const streak = calcStreakFromCheckins(checkins, restDaysAllowed);

  if (streak >= 7)  await unlockAchievement(userId, 'streak_7');
  if (streak >= 30) await unlockAchievement(userId, 'streak_30');
}

// ── Verifica conquista de semana zerada ──────────────────

export async function checkAllWeekTasksAchievement(userId, weekStart, weekEnd) {
  const supabase = getSupabase();

  const { data: tasks } = await supabase
    .from('tasks')
    .select('status')
    .eq('user_id', userId)
    .gte('scheduled_date', weekStart)
    .lte('scheduled_date', weekEnd);

  if (!tasks?.length) return;

  const allDone = tasks.every((t) => t.status === 'completed');
  if (allDone) await unlockAchievement(userId, 'all_week_tasks');
}

// ── Helper: recalcula streak ──────────────────────────────

function calcStreakFromCheckins(checkins, restDaysAllowed) {
  const checkedDates = new Set(checkins.map((c) => c.checked_date));

  let streak = 0;
  let restUsedThisWeek = 0;
  let cursor = dayjs().startOf('day');
  let weekStart = cursor.startOf('isoWeek');

  while (true) {
    const dateStr = cursor.format('YYYY-MM-DD');
    const cursorWeekStart = cursor.startOf('isoWeek').format('YYYY-MM-DD');

    if (cursorWeekStart !== weekStart.format('YYYY-MM-DD')) {
      restUsedThisWeek = 0;
      weekStart = cursor.startOf('isoWeek');
    }

    if (checkedDates.has(dateStr)) {
      streak++;
      cursor = cursor.subtract(1, 'day');
    } else if (restUsedThisWeek < restDaysAllowed) {
      restUsedThisWeek++;
      cursor = cursor.subtract(1, 'day');
    } else {
      break;
    }
  }

  return streak;
}