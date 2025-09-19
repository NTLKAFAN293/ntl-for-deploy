import { useState } from 'react';
import AppSidebar from '../AppSidebar';

export default function AppSidebarExample() {
  const [activeItem, setActiveItem] = useState('home');

  return (
    <AppSidebar
      activeItem={activeItem}
      onItemClick={(itemId) => {
        setActiveItem(itemId);
        console.log('النقر على:', itemId);
      }}
    />
  );
}