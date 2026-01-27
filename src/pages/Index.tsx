import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WindowProvider } from '../contexts/WindowContext';
import { DataProvider } from '../contexts/DataContext';
import { LoginWindow } from '../components/LoginWindow';
import { Desktop } from '../components/Desktop';
import blissWallpaper from '../assets/xp-bliss.jpg';

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${blissWallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <LoginWindow />
      </div>
    );
  }

  return (
    <WindowProvider>
      <DataProvider>
        <Desktop />
      </DataProvider>
    </WindowProvider>
  );
};

export default Index;
