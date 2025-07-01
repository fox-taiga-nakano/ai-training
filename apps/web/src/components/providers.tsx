'use client';

import { PropsWithChildren } from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export const Providers = (props: PropsWithChildren) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      {...props}
    />
  );
};
