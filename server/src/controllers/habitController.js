import { getSupabase } from '../db/supabase.js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';
dayjs.extend(isoWeek);

// ── HABITS ──────────────────────────────────────────────

export async function getHabits(req, res) {
  const userId = req.userId;
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}

export async function createHabit(req, res) {
  const userId = req.userId;
  const { name, category, target_days, rest_days_allowed } = req.body; // ← adiciona rest_days_allowed
  const supabase = getSupabase();

  if (!name) return res.status(400).json({ error: 'Nome é obrigatório.' });

  const { data, error } = await supabase
    .from('habits')
    .insert([{ user_id: userId, name, category, target_days, rest_days_allowed: rest_days_allowed ?? 0 }]) // ← inclui no insert
    .select();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data[0]);
}

export async function deleteHabit(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const supabase = getSupabase()

  // deleta check-ins primeiro (integridade)
  await supabase
    .from('habit_checkins')
    .delete()
    .eq('habit_id', id)
    .eq('user_id', userId);

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
}

export async function updateHabit(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const { name, category, target_days, rest_days_allowed } = req.body; // ← adiciona
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('habits')
    .update({ name, category, target_days, rest_days_allowed }) // ← inclui no update
    .eq('id', id)
    .eq('user_id', userId)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data[0]);
}

// ── CHECK-INS ────────────────────────────────────────────

export async function getCheckins(req, res) {
  const userId = req.userId;
  const { habitId, month } = req.query; // month = "YYYY-MM"
  const supabase = getSupabase()

  if (!habitId || !month)
    return res.status(400).json({ error: 'habitId e month são obrigatórios.' });

  const startDate = `${month}-01`;
  const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');

  const { data, error } = await supabase
    .from('habit_checkins')
    .select('*')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .gte('checked_date', startDate)
    .lte('checked_date', endDate)
    .order('checked_date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}

export async function createCheckin(req, res) {
  const userId = req.userId;
  const { habit_id, checked_date } = req.body;
  const supabase = getSupabase()

  if (!habit_id || !checked_date)
    return res.status(400).json({ error: 'habit_id e checked_date são obrigatórios.' });

  // evita duplicata
  const { data: existing } = await supabase
    .from('habit_checkins')
    .select('id')
    .eq('habit_id', habit_id)
    .eq('user_id', userId)
    .eq('checked_date', checked_date)

  if (existing && existing.length > 0) return res.status(409).json({ error: 'Check-in já registrado nessa data.' });

  const { data, error } = await supabase
    .from('habit_checkins')
    .insert([{ habit_id, user_id: userId, checked_date }])
    .select()
    

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data[0]);
}

export async function deleteCheckin(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const supabase = getSupabase()

  const { error } = await supabase
    .from('habit_checkins')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
}

// ── STREAK ───────────────────────────────────────────────

export async function getStreak(req, res) {
  const userId = req.userId;
  const { habitId } = req.params;
  const supabase = getSupabase();

  const { data: habit, error: habitError } = await supabase
    .from('habits')
    .select('rest_days_allowed')
    .eq('id', habitId)
    .eq('user_id', userId)
    .single();

  if (habitError) return res.status(500).json({ error: habitError.message });

  const restDaysAllowed = habit.rest_days_allowed ?? 0;

  const { data, error } = await supabase
    .from('habit_checkins')
    .select('checked_date')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .order('checked_date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.json({ habit_id: habitId, streak: 0 });

  const checkedDates = new Set(data.map((c) => c.checked_date));

  let streak = 0;
  let restUsedThisWeek = 0;
  let cursor = dayjs().startOf('day');

  // pega o inicio da semana do cursor para controlar reset semanal
  let weekStart = cursor.startOf('isoWeek');

  while (true) {
    const dateStr = cursor.format('YYYY-MM-DD');
    const cursorWeekStart = cursor.startOf('isoWeek').format('YYYY-MM-DD');

    // resetar descansos ao entrar em uma nova semana (andando para trás)
    if (cursorWeekStart !== weekStart.format('YYYY-MM-DD')) {
      restUsedThisWeek = 0;
      weekStart = cursor.startOf('isoWeek');
    }

    if (checkedDates.has(dateStr)) {
      streak++;
      cursor = cursor.subtract(1, 'day');
    } else {
      // dia sem check-in — verifica se pode usar descanso
      if (restUsedThisWeek < restDaysAllowed) {
        restUsedThisWeek++;
        cursor = cursor.subtract(1, 'day');
        // dia de descanso não conta pro streak, só "protege"
      } else {
        // sem descansos disponíveis — streak quebrou
        break;
      }
    }
  }

  return res.json({ habit_id: habitId, streak });
}