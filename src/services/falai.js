const FAL_API_KEY = import.meta.env.VITE_FAL_API_KEY;
const FAL_QUEUE_URL = 'https://queue.fal.run/fal-ai/flux/dev/image-to-image';
const FAL_REALTIME_URL = 'https://fal.run/fal-ai/flux/dev/image-to-image'; // Синхронный endpoint

/**
 * Генерация хеша промпта для кэширования
 */
export async function hashPrompt(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Генерация YouTube-превью через fal.ai API
 * Использует синхронный endpoint (fal.run) вместо queue для простоты
 */
export async function generateThumbnail({
  prompt,
  imageUrl,
  width = 1280,
  height = 720,
  strength = 0.95,
}) {
  if (!FAL_API_KEY) {
    throw new Error('fal.ai API key not configured. Set VITE_FAL_API_KEY in .env');
  }

  // Валидация URL изображения
  if (!imageUrl || imageUrl.trim() === '') {
    throw new Error('URL изображения обязателен');
  }

  // Используем синхронный endpoint (проще, без polling)
  const response = await fetch(FAL_REALTIME_URL, {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_url: imageUrl,
      image_size: { width, height },
      num_images: 1,
      strength,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `fal.ai API error: ${response.status} ${response.statusText}`;

    try {
      const errorData = JSON.parse(errorText);
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch (e) {
      // Если не JSON, используем текст как есть
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();

  // Проверяем, что есть изображения в результате
  if (!result.images || result.images.length === 0) {
    throw new Error('fal.ai не вернул изображения');
  }

  return result;
}

/**
 * Альтернативная версия с queue endpoint (для длинных запросов)
 */
export async function generateThumbnailQueue({
  prompt,
  imageUrl,
  width = 1280,
  height = 720,
  strength = 0.95,
  onProgress,
}) {
  if (!FAL_API_KEY) {
    throw new Error('fal.ai API key not configured');
  }

  // 1. Отправляем запрос в очередь
  const submitResponse = await fetch(FAL_QUEUE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_url: imageUrl,
      image_size: { width, height },
      num_images: 1,
      strength,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  });

  if (!submitResponse.ok) {
    const errorData = await submitResponse.json().catch(() => ({}));
    throw new Error(errorData.detail || `Submit error: ${submitResponse.status}`);
  }

  const { request_id, status_url } = await submitResponse.json();

  // 2. Poll'им status_url пока не получим результат
  const maxAttempts = 60; // 60 секунд максимум
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (onProgress) onProgress(attempts);

    const statusResponse = await fetch(status_url, {
      headers: { Authorization: `Key ${FAL_API_KEY}` },
    });

    const statusData = await statusResponse.json();

    if (statusData.status === 'COMPLETED') {
      // Получаем результат
      const resultUrl = `https://queue.fal.run/fal-ai/flux/dev/image-to-image/requests/${request_id}`;
      const resultResponse = await fetch(resultUrl, {
        headers: { Authorization: `Key ${FAL_API_KEY}` },
      });

      if (!resultResponse.ok) {
        throw new Error('Failed to fetch result');
      }

      return await resultResponse.json();
    }

    if (statusData.status === 'FAILED') {
      throw new Error(statusData.error || 'Generation failed');
    }

    // Ждём 1 секунду перед следующей попыткой
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error('Timeout: генерация заняла слишком много времени');
}

/**
 * Преобразование URL изображения в Blob
 */
export async function imageUrlToBlob(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Преобразование файла в base64 data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}