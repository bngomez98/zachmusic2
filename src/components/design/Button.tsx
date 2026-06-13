import React from 'react';

type Variant = 'primary' | 'ghost' | 'outline';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  ghost: 'bg-transparent text-foreground hover:bg-muted/40',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted/30',
};

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
