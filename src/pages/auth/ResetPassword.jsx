import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOtp, updatePassword } from '../../services/auth';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

export default function ResetPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Verify OTP
      await verifyOtp(email, token);
      
      // 2. Update password
      await updatePassword(newPassword);
      
      // 3. Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Ошибка. Неверный код или пароль не соответствует требованиям.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Новый пароль</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#555' }}>
        Введите 6-значный код из письма и новый пароль.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!location.state?.email && (
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <Input
          label="6-значный код"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <Input
          label="Новый пароль"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        
        <Button type="submit" variant="primary" isLoading={loading}>
          Сохранить пароль
        </Button>
      </form>

      <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <Link to="/login" style={{ color: '#0066cc', textDecoration: 'none' }}>Вернуться ко входу</Link>
      </div>
    </div>
  );
}
