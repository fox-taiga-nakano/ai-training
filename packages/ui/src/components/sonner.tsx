'use client';

import { useTheme } from 'next-themes';

import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--popover)',
          '--success-text': 'hsl(var(--foreground))',
          '--success-border': 'hsl(142 76% 36%)',
          '--error-bg': 'var(--popover)',
          '--error-text': 'hsl(var(--foreground))',
          '--error-border': 'hsl(0 84% 60%)',
          '--warning-bg': 'var(--popover)',
          '--warning-text': 'hsl(var(--foreground))',
          '--warning-border': 'hsl(38 92% 50%)',
          '--info-bg': 'var(--popover)',
          '--info-text': 'hsl(var(--foreground))',
          '--info-border': 'hsl(221 83% 53%)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
