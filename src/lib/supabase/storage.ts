import { createClient } from './client';

export async function recalcScore(coordinateId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('coordinates')
    .select('like_count, save_count, vote_count, comment_count, view_count')
    .eq('id', coordinateId)
    .single();

  if (!data) return;

  const score =
    data.like_count * 3 +
    data.save_count * 5 +
    data.vote_count * 10 +
    data.comment_count * 2 +
    data.view_count * 0.1;

  await supabase.from('coordinates').update({ score }).eq('id', coordinateId);
}

export async function uploadImage(
  bucket: 'coordinates' | 'closet',
  file: File,
  userId: string
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) return null;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
