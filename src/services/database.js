import { supabase } from './supabase';

// ===== PROFILES =====

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ===== ALBUMS =====

export async function getAlbums(userId) {
  const { data, error } = await supabase
    .from('albums')
    .select('*, photos(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createAlbum(userId, name) {
  const { data, error } = await supabase
    .from('albums')
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAlbum(albumId) {
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', albumId);

  if (error) throw error;
}

// ===== PHOTOS =====

export async function getPhotos(userId, albumId = null) {
  let query = supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (albumId) {
    query = query.eq('album_id', albumId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAllPhotos(userId) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deletePhoto(photoId) {
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (error) throw error;
}

// ===== REFERENCES =====

export async function getReferences(userId) {
  const { data, error } = await supabase
    .from('references')
    .select('*')
    .or(`is_public.eq.true,user_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addReference(userId, referenceData) {
  const { data, error } = await supabase
    .from('references')
    .insert({
      user_id: userId,
      title: referenceData.title,
      description: referenceData.description || null,
      image_url: referenceData.image_url,
      storage_path: referenceData.storage_path || null,
      category: referenceData.category || null,
      is_public: referenceData.is_public ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReference(referenceId) {
  const { error } = await supabase
    .from('references')
    .delete()
    .eq('id', referenceId);

  if (error) throw error;
}

// ===== GENERATIONS =====

export async function getGenerations(userId) {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getFavorites(userId) {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function toggleFavorite(generationId, isFavorite) {
  const { data, error } = await supabase
    .from('generations')
    .update({ is_favorite: isFavorite })
    .eq('id', generationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGeneration(generationId) {
  const { error } = await supabase
    .from('generations')
    .delete()
    .eq('id', generationId);

  if (error) throw error;
}

export async function getCachedGeneration(userId, promptHash) {
  const { data } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', userId)
    .eq('prompt_hash', promptHash)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return data;
}

// ===== RATE LIMITING =====

export async function checkRateLimit(userId) {
  const profile = await getProfile(userId);
  
  if (!profile.last_generation_at) return true;

  const lastGen = new Date(profile.last_generation_at);
  const now = new Date();
  
  // Сброс счётчика при наступлении нового дня
  if (lastGen.toDateString() !== now.toDateString()) {
    await updateProfile(userId, { generations_count: 0 });
    return true;
  }

  // Лимит 50 генераций в день
  return profile.generations_count < 50;
}

export async function incrementGenerationCount(userId) {
  const profile = await getProfile(userId);
  const now = new Date();
  const lastGen = profile.last_generation_at ? new Date(profile.last_generation_at) : null;

  const newCount = lastGen && lastGen.toDateString() === now.toDateString()
    ? (profile.generations_count || 0) + 1
    : 1;

  await updateProfile(userId, {
    generations_count: newCount,
    last_generation_at: now.toISOString(),
  });
}
