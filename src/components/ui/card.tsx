import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'light';
  glow?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  variant = 'default',
  glow = true,
  onClick,
}: CardProps) {
  const variantClasses = {
    default: 'glass',
    premium: 'glass-premium',
    light: 'glass-light',
  };

  const glowClass = glow ? 'glow-purple-sm' : '';

  return (
    <div
      className={`${variantClasses[variant]} ${glowClass} rounded-xl p-6 transition-smooth hover:backdrop-blur-md ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-zinc-100 ${className}`}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({
  children,
  className = '',
}: CardDescriptionProps) {
  return (
    <p className={`text-sm text-zinc-400 ${className}`}>
      {children}
    </p>
  );
}
