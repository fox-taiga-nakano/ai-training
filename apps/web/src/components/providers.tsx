'use client';

import { PropsWithChildren } from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({ children }: Readonly<PropsWithChildren>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      {children}
    </NextThemesProvider>
  );
}
