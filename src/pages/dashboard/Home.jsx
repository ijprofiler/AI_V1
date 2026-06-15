import React, { useEffect, useState } from 'react';
import { getReferences } from '../../services/database';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/UI/Loader';

export default function Home() {
  const { user } = useAuth();
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const data = await getReferences(user.id);
        setReferences(data);
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке референсов');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchReferences();
  }, [user]);

  if (loading) return <Loader />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Главная (Референсы)</h1>
      {references.length === 0 ? (
        <p>Референсы не найдены.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {references.map((ref) => (
            <div key={ref.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={ref.image_url} alt={ref.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{ref.title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{ref.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
