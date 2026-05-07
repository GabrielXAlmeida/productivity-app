import { getSupabase } from '../db/supabase.js';
import dayjs from 'dayjs';

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
  const { name, category, target_days } = req.body;
  const supabase = getSupabase()

  if (!name) return res.status(400).json({ error: 'Nome é obrigatório.' });

  const { data, error } = await supabase
    .from('habits')
    .insert([{ user_id: userId, name, category, target_days }])
    .select()

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
  const supabase = getSupabase()

  // busca todos os check-ins do hábito, do mais recente ao mais antigo
  const { data, error } = await supabase
    .from('habit_checkins')
    .select('checked_date')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .order('checked_date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // coloca as datas num Set para busca O(1)
  const checkedDates = new Set(data.map((c) => c.checked_date));

  let streak = 0;
  let cursor = dayjs().startOf('day');

  // anda para trás dia a dia enquanto houver check-in
  while (checkedDates.has(cursor.format('YYYY-MM-DD'))) {
    streak++;
    cursor = cursor.subtract(1, 'day');
  }

  return res.json({ habit_id: habitId, streak });
}