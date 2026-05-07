import type { ButtonHTMLAttributes, ReactNode } from 'react';

// --- Types ---

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// --- Style Maps ---

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-primary text-primary-foreground hover:bg-brand-accent shadow-lg shadow-brand-primary/5',
  secondary: 'bg-secondary text-primary border border-white/5 hover:bg-accent hover:border-white/10',
  ghost: 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-primary',
  outline: 'bg-transparent text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/5',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5',
  lg: 'px-7 py-3.5 text-lg',
};

// --- Component ---

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-xl font-medium 
        transition-standard active:scale-[0.98] focus-visible:ring-2 
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
