import { supabase } from './supabase';

/**
 * Регистрация нового пользователя
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Создаём профиль пользователя
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
      display_name: email.split('@')[0],
    });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    // Создаём альбом по умолчанию
    await supabase.from('albums').insert({
      user_id: data.user.id,
      name: 'Общий',
    });
  }

  return data;
}

/**
 * Вход по email и паролю
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Выход из аккаунта
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Отправка 6-значного OTP кода на email (для восстановления пароля)
 */
export async function sendOtp(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Верификация 6-значного OTP кода
 */
export async function verifyOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw error;
  return data;
}

/**
 * Обновление пароля (после верификации OTP)
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}

/**
 * Получение текущей сессии
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Получение текущего пользователя
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}
