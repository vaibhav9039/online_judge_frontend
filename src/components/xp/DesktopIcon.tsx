import React from 'react';

interface DesktopIconProps {
  icon: string;
  label: string;
  onClick: () => void;
}

export function DesktopIcon({ icon, label, onClick }: DesktopIconProps) {
  return (
    <div
      className="xp-desktop-icon"
      onDoubleClick={onClick}
    >
      <div className="text-4xl">{icon}</div>
      <span>{label}</span>
    </div>
  );
}
