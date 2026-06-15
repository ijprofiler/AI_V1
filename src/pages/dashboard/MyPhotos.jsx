import React, { useEffect, useState, useCallback } from 'react';
import { getAlbums } from '../../services/database';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/UI/Loader';
import Button from '../../components/UI/Button';
import { FaUpload } from 'react-icons/fa';
import UploadPhotoModal from '../../components/Photos/UploadPhotoModal';

export default function MyPhotos() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchAlbums = useCallback(async () => {
    try {
      const data = await getAlbums(user.id);
      setAlbums(data);
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке альбомов');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user) fetchAlbums();
  }, [user, fetchAlbums]);

  if (loading) return <Loader />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Мои фото</h1>
        <Button variant="primary" onClick={() => setIsUploadModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUpload /> Загрузить фото
        </Button>
      </div>

      {albums.length === 0 ? (
        <p>У вас пока нет альбомов.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {albums.map((album) => (
            <div key={album.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#f9f9f9' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{album.name}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                Фото: {album.photos?.[0]?.count || 0}
              </p>
            </div>
          ))}
        </div>
      )}

      <UploadPhotoModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        albums={albums}
        onUploadSuccess={fetchAlbums}
      />
    </div>
  );
}
