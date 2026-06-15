import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOtp } from '../../services/auth';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendOtp(email);
      // Navigate to reset-password and pass the email so user doesn't have to type it again
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.message || 'Ошибка при отправке кода. Проверьте email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Восстановление пароля</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      {message && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
      
      <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#555' }}>
        Введите ваш email, и мы отправим вам 6-значный код для сброса пароля.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Button type="submit" variant="primary" isLoading={loading}>
          Отправить код
        </Button>
      </form>

      <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <Link to="/login" style={{ color: '#0066cc', textDecoration: 'none' }}>Вернуться ко входу</Link>
      </div>
    </div>
  );
}
