import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers'; // Wait, this file doesn't exist yet!
import { tajawal } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'EduFlow LMS - Plateforme d\'apprentissage pour le développement web',
  description: 'Plateforme gratuite et open source pour les cours de développement web à Agadir, Maroc',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" className={tajawal.variable}>
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
