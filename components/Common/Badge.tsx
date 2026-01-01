
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'success' | 'alert' | 'warning' | 'neutral' | 'primary';
}

const Badge: React.FC<BadgeProps> = ({ children, variant }) => {
  const styles = {
    success: 'bg-success/10 text-success border-success/20',
    alert: 'bg-alert/10 text-alert border-alert/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    neutral: 'bg-secondary/10 text-secondary border-secondary/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;
