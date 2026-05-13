import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

// --- Types ---

type IconButtonVariant = 'primary' | 'secondary' | 'ghost';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon;
  variant?: IconButtonVariant;
  'aria-label': string;
}

// --- Style Maps ---

const variants: Record<IconButtonVariant, string> = {
  primary: 'bg-brand-primary text-primary-foreground hover:bg-brand-accent shadow-lg shadow-brand-primary/20',
  secondary: 'bg-secondary text-primary border border-white/10 hover:bg-white/5 hover:border-brand-primary/30',
  ghost: 'bg-transparent text-muted-foreground hover:bg-white/5 hover:text-white',
};

// --- Component ---

const IconButton = ({
  icon: Icon,
  variant = 'ghost',
  className = '',
  'aria-label': ariaLabel,
  ...props
}: IconButtonProps) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-full p-2
        transition-standard active:scale-90 focus-visible:ring-2
        ${variants[variant]} 
        ${className}
      `}
      aria-label={ariaLabel}
      {...props}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
    </button>
  );
};

export default IconButton;
