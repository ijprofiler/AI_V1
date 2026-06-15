import React, { useEffect, useState } from 'react';
import { getFavorites } from '../../services/database';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/UI/Loader';

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getFavorites(user.id);
        setFavorites(data);
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке избранного');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchFavorites();
  }, [user]);

  if (loading) return <Loader />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Избранное</h1>
      {favorites.length === 0 ? (
        <p>У вас нет избранных генераций.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {favorites.map((gen) => (
            <div key={gen.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={gen.result_url} alt="Favorite" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{gen.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
