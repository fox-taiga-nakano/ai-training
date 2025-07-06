'use client';

import { PropsWithChildren } from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { Toaster, toast } from 'sonner';
import { SWRConfig } from 'swr';

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <SWRConfig
      value={{
        onError: (error) => {
          console.error('SWR Error:', error);
          const errorMessage = error?.message || 'データの取得に失敗しました';
          toast.error(errorMessage);
        },
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      }}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        {children}
        <Toaster richColors position="top-right" />
      </NextThemesProvider>
    </SWRConfig>
  );
};
