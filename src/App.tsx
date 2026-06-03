import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './components/features/layout/MainLayout';
import ProtectedRoute from './components/patterns/ProtectedRoute';
import ScrollToTop from './components/patterns/ScrollToTop';
import { AddToCollectionProvider } from './components/patterns/AddToCollectionProvider';
import SplashScreen from './components/ui/SplashScreen';
import { useAppSelector } from '@/hooks/useRedux';

// --- Lazy Loaded Pages ---
const HomePage = lazy(() => import('./pages/HomePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MediaDetailsPage = lazy(() => import('./pages/MediaDetailsPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const CollectionDetailsPage = lazy(() => import('./pages/CollectionDetailsPage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const PersonPage = lazy(() => import('./pages/PersonPage'));
const EpisodeDetailsPage = lazy(() => import('./pages/EpisodeDetailsPage'));

// --- App Root ---

function App() {
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    
    // Check if loading has finished
    if (!isLoading) {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsed);
      
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, remainingTime);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>
      <Router>
        <ScrollToTop />
        <AddToCollectionProvider>
        <MainLayout>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/movie/:id" element={<MediaDetailsPage />} />
              <Route path="/tv/:id" element={<MediaDetailsPage />} />
              <Route path="/tv/:id/season/:seasonNumber/episode/:episodeNumber" element={<EpisodeDetailsPage />} />
              <Route path="/person/:id" element={<PersonPage />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/collections" 
                element={
                  <ProtectedRoute>
                    <CollectionsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/collections/:collectionId" 
                element={
                  <ProtectedRoute>
                    <CollectionDetailsPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Suspense>
        </MainLayout>
      </AddToCollectionProvider>
      </Router>
    </>
  );
}

export default App;
