import { ReactNode } from 'react';

declare module './providers' {
  export function Providers({ children }: { children: ReactNode }): JSX.Element;
} 