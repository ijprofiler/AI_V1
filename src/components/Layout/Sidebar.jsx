import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/auth';
import { FaHome, FaImage, FaMagic, FaHeart, FaSignOutAlt, FaPlus } from 'react-icons/fa';
import Button from '../UI/Button';

export default function Sidebar({ onOpenCreatePreview }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="sidebar" style={{ width: '250px', borderRight: '1px solid #ccc', padding: '1rem', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="sidebar-header" style={{ marginBottom: '2rem' }}>
        <h3>YouTube Gen</h3>
      </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <NavLink to="/dashboard" end style={({isActive}) => ({ fontWeight: isActive ? 'bold' : 'normal', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' })}>
          <FaHome /> Главная
        </NavLink>
        <NavLink to="/dashboard/photos" style={({isActive}) => ({ fontWeight: isActive ? 'bold' : 'normal', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' })}>
          <FaImage /> Мои фото
        </NavLink>
        <NavLink to="/dashboard/generations" style={({isActive}) => ({ fontWeight: isActive ? 'bold' : 'normal', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' })}>
          <FaMagic /> Мои генерации
        </NavLink>
        <NavLink to="/dashboard/favorites" style={({isActive}) => ({ fontWeight: isActive ? 'bold' : 'normal', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' })}>
          <FaHeart /> Избранное
        </NavLink>
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid #ccc', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Button variant="primary" onClick={onOpenCreatePreview} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <FaPlus /> Создать новое превью
        </Button>
        <div style={{ fontSize: '0.85rem', color: '#555', wordBreak: 'break-all' }}>
          {user?.email}
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}>
          <FaSignOutAlt /> Выйти
        </button>
      </div>
    </div>
  );
}
