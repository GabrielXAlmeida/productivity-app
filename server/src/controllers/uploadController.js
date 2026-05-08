import { getSupabase } from '../db/supabase.js';

export async function uploadTaskImage(req, res) {
  const userId = req.userId;
  const { taskId } = req.params;
  const supabase = getSupabase();

  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

  const ext = req.file.originalname.split('.').pop();
  const filename = `${userId}/${taskId}-${Date.now()}.${ext}`;

  // Faz upload pro Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('task-images')
    .upload(filename, req.file.buffer, {
      contentType: req.file.mimetype,
      duplex: 'half', 
      upsert: true,
    });

  if (uploadError) return res.status(500).json({ error: uploadError.message });

  // Pega a URL pública
  const { data } = supabase.storage.from('task-images').getPublicUrl(filename);
  const imageUrl = data.publicUrl;

  // Salva a URL na tarefa
  const { error: updateError } = await supabase
    .from('tasks')
    .update({ image_url: imageUrl })
    .eq('id', taskId)
    .eq('user_id', userId);

  if (updateError) return res.status(500).json({ error: updateError.message });

  return res.json({ image_url: imageUrl });
}

export async function deleteTaskImage(req, res) {
  const userId = req.userId;
  const { taskId } = req.params;
  const supabase = getSupabase();

  // Busca a URL atual
  const { data: task } = await supabase
    .from('tasks')
    .select('image_url')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (!task?.image_url) return res.status(404).json({ error: 'Nenhuma imagem encontrada.' });

  // Extrai o path do arquivo da URL
  const path = task.image_url.split('/task-images/')[1];

  await supabase.storage.from('task-images').remove([path]);

  await supabase
    .from('tasks')
    .update({ image_url: null })
    .eq('id', taskId)
    .eq('user_id', userId);

  return res.status(204).send();
}