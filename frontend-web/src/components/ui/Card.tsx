import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-12',
  };

  return (
    <div className={clsx(
      'bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
}
