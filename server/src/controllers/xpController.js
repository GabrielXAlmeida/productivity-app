import { getSupabase } from '../db/supabase.js';

// Tabela de XP por ação
export const XP_REWARDS = {
  TASK_COMPLETE_LOW:    5,
  TASK_COMPLETE_MEDIUM: 10,
  TASK_COMPLETE_HIGH:   20,
  HABIT_CHECKIN:        15,
  STREAK_7_BONUS:       50,
};

// Calcula o nível a partir do XP total (progressão exponencial)
export function calcLevel(totalXp) {
  // Nível 1: 0-99, Nível 2: 100-249, Nível 3: 250-499, Nível 4: 500-849...
  // Fórmula: xp necessário para nível n = 100 * (n-1)^1.5 acumulado
  let level = 1;
  let xpNeeded = 0;
  while (true) {
    xpNeeded += Math.floor(100 * Math.pow(level, 1.5));
    if (totalXp < xpNeeded) break;
    level++;
  }
  return level;
}

// XP necessário para o próximo nível
export function xpForNextLevel(currentLevel) {
  return Math.floor(100 * Math.pow(currentLevel, 1.5));
}

// XP acumulado até o início do nível atual
export function xpAtLevelStart(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(100 * Math.pow(i, 1.5));
  }
  return total;
}

// ── GET /xp ──────────────────────────────────────────────

export async function getXp(req, res) {
  const supabase = getSupabase();
  const userId = req.userId;

  const { data, error } = await supabase
    .from('user_xp')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }

  // Usuário ainda sem XP — retorna zerado
  if (!data) {
    return res.json({ total_xp: 0, level: 1, xp_in_level: 0, xp_for_next: 100 });
  }

  const level = calcLevel(data.total_xp);
  const levelStart = xpAtLevelStart(level);
  const xpInLevel = data.total_xp - levelStart;
  const xpForNext = xpForNextLevel(level);

  return res.json({
    total_xp: data.total_xp,
    level,
    xp_in_level: xpInLevel,
    xp_for_next: xpForNext,
  });
}

// ── Função interna: concede XP e verifica conquistas ─────
// Não é uma rota — é chamada pelos outros controllers

export async function awardXp(userId, amount, actionKey = null) {
  const supabase = getSupabase();

  // Upsert na tabela user_xp
  const { data: current } = await supabase
    .from('user_xp')
    .select('total_xp')
    .eq('user_id', userId)
    .single();

  const prevXp = current?.total_xp ?? 0;
  const newXp = prevXp + amount;
  const newLevel = calcLevel(newXp);

  await supabase
    .from('user_xp')
    .upsert({ user_id: userId, total_xp: newXp, level: newLevel, updated_at: new Date() });

  // Verifica conquista de nível 5
  if (newLevel >= 5 && calcLevel(prevXp) < 5) {
    await unlockAchievement(userId, 'level_5');
  }

  return { newXp, newLevel };
}

// ── Função interna: desbloqueia conquista ────────────────

export async function unlockAchievement(userId, achievementKey) {
  const supabase = getSupabase();

  // Ignora silenciosamente se já desbloqueada (UNIQUE constraint)
  const { data: already } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_key', achievementKey)
    .single();

  if (already) return;

  await supabase
    .from('user_achievements')
    .insert({ user_id: userId, achievement_key: achievementKey });

  // Concede XP da conquista
  const { data: achievement } = await supabase
    .from('achievements')
    .select('xp_reward')
    .eq('key', achievementKey)
    .single();

  if (achievement?.xp_reward) {
    await awardXp(userId, achievement.xp_reward);
  }
}