import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { generateThumbnail } from '../../services/falai';
import { useAuth } from '../../context/AuthContext';

export default function CreatePreviewModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!prompt) return setError('Промпт обязателен');
    if (!imageUrl) return setError('Укажите URL исходного фото');

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await generateThumbnail({ prompt, imageUrl });
      if (data && data.images && data.images.length > 0) {
        setResult(data.images[0].url);
        // Here we could also save to the database using addReference or a similar function
      } else {
        setError('Не удалось получить изображение');
      }
    } catch (err) {
      setError(err.message || 'Ошибка генерации');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setImageUrl('');
    setError('');
    setResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Создать новое превью" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        <Input
          label="Описание (Промпт)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Опишите, каким должно быть превью..."
        />
        
        <Input
          label="URL исходного фото"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/photo.jpg"
        />

        {result && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <h4>Результат:</h4>
            <img src={result} alt="Generated" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleGenerate} isLoading={loading}>
            Сгенерировать
          </Button>
        </div>
      </div>
    </Modal>
  );
}
