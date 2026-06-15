import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CreatePreviewModal from '../Generation/CreatePreviewModal';

export default function DashboardLayout() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar onOpenCreatePreview={() => setIsCreateModalOpen(true)} />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>

      <CreatePreviewModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
