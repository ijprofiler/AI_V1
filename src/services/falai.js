const FAL_API_KEY = import.meta.env.VITE_FAL_API_KEY;
const FAL_API_URL = 'https://queue.fal.run/fal-ai/flux/dev/image-to-image';

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
 * 
 * @param {Object} params
 * @param {string} params.prompt - Текстовое описание желаемого превью
 * @param {string} params.imageUrl - URL исходного фото
 * @param {number} params.width - Ширина (по умолчанию 1280)
 * @param {number} params.height - Высота (по умолчанию 720)
 * @param {number} params.strength - Сила преобразования (0-1, по умолчанию 0.75)
 * @returns {Promise<Object>} Результат генерации с images[0].url
 */
export async function generateThumbnail({
  prompt,
  imageUrl,
  width = 1280,
  height = 720,
  strength = 0.75,
}) {
  if (!FAL_API_KEY) {
    throw new Error('fal.ai API key not configured. Set VITE_FAL_API_KEY in .env');
  }

  const response = await fetch(FAL_API_URL, {
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `fal.ai API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
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
