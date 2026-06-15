import { supabase } from './supabase';

/**
 * Загрузка файла в Supabase Storage
 */
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data;
}

/**
 * Получение публичного URL файла
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Получение signed URL для приватных файлов
 */
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Удаление файла из Storage
 */
export async function deleteFile(bucket, paths) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(Array.isArray(paths) ? paths : [paths]);

  if (error) throw error;
  return data;
}

/**
 * Загрузка фото пользователя
 */
export async function uploadPhoto(userId, albumId, file) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
  const storagePath = `user_${userId}/${fileName}`;

  // Загружаем в Storage
  await uploadFile('photos', storagePath, file);

  // Получаем URL
  const signedUrl = await getSignedUrl('photos', storagePath);

  // Создаём запись в БД
  const { data, error } = await supabase.from('photos').insert({
    user_id: userId,
    album_id: albumId,
    storage_path: storagePath,
    original_url: signedUrl,
    thumbnail_url: signedUrl,
    filename: file.name,
  }).select().single();

  if (error) throw error;
  return data;
}

/**
 * Загрузка сгенерированного превью
 */
export async function uploadGeneration(userId, imageBlob, prompt, sourcePhotoId, referenceId, promptHash) {
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
  const storagePath = `user_${userId}/${fileName}`;

  // Загружаем в Storage
  await uploadFile('generations', storagePath, imageBlob);

  // Получаем URL
  const signedUrl = await getSignedUrl('generations', storagePath);

  // Создаём запись в БД
  const { data, error } = await supabase.from('generations').insert({
    user_id: userId,
    prompt,
    prompt_hash: promptHash,
    result_url: signedUrl,
    storage_path: storagePath,
    source_photo_id: sourcePhotoId,
    reference_id: referenceId,
    is_favorite: false,
  }).select().single();

  if (error) throw error;
  return data;
}
