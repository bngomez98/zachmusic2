import React from 'react';

type Variant = 'primary' | 'ghost' | 'outline';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  primary: 'bg-accent text-base hover:bg-accent/90',
  ghost: 'bg-transparent text-text-main hover:bg-text-muted/10',
  outline: 'border border-text-muted/30 bg-transparent text-text-main hover:border-accent hover:text-accent',
};

export default function Button({ variant = 'primary', type = 'button', className = '', children, ...rest }: Props) {
  return (
    <button
      type={type}
      {...rest}
      className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
