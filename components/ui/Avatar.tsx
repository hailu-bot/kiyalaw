import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
  };

return (
  <div className="rounded-full flex items-center justify-center bg-primary-container text-on-primary font-bold" style={{ width: sizes[size], height:sizes[size] }}>
    {src ? (
      <Image
        src={src}
        alt={name || ''}
        width={sizes[size]}
        height={sizes[size]}
        className="rounded-full object-cover"
      />
    ) : name?.charAt(0)}
  </div>
);
}
