import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { uploadPhoto } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

export default function UploadPhotoModal({ isOpen, onClose, albums, onUploadSuccess }) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState(albums?.[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return setError('Пожалуйста, выберите файл');
    if (!selectedAlbumId) return setError('Пожалуйста, выберите альбом');

    setError('');
    setLoading(true);

    try {
      await uploadPhoto(user.id, selectedAlbumId, selectedFile);
      onUploadSuccess();
      handleClose();
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке фото');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError('');
    onClose();
  };

  // Sync default album when albums load
  React.useEffect(() => {
    if (albums && albums.length > 0 && !selectedAlbumId) {
      setSelectedAlbumId(albums[0].id);
    }
  }, [albums, selectedAlbumId]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Загрузить новое фото" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Альбом</label>
          <select 
            value={selectedAlbumId} 
            onChange={(e) => setSelectedAlbumId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {albums.map((album) => (
              <option key={album.id} value={album.id}>{album.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Выберите фото</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleUpload} isLoading={loading} disabled={!selectedFile}>
            Загрузить
          </Button>
        </div>
      </div>
    </Modal>
  );
}
