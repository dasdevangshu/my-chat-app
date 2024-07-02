import { ReactNode } from 'react';
import { CookiesProvider } from 'next-client-cookies/server';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return <CookiesProvider>{children}</CookiesProvider>;
}
