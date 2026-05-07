import type { ReactNode } from 'react';
import Navbar from './Navbar';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';

// --- Types ---

interface MainLayoutProps {
  children: ReactNode;
}

// --- Component ---

const MainLayout = ({ children }: MainLayoutProps) => {
  // Initialize auth listener
  useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
        {children}
      </main>
      
      <AuthModal />
    </div>
  );
};

export default MainLayout;
