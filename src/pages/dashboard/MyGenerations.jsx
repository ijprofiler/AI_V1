import React, { useEffect, useState } from 'react';
import { getGenerations } from '../../services/database';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/UI/Loader';

export default function MyGenerations() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        const data = await getGenerations(user.id);
        setGenerations(data);
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке генераций');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchGenerations();
  }, [user]);

  if (loading) return <Loader />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Мои генерации</h1>
      {generations.length === 0 ? (
        <p>Вы пока не сгенерировали ни одного превью.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {generations.map((gen) => (
            <div key={gen.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={gen.result_url} alt="Generation" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{gen.prompt}</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                  {new Date(gen.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
