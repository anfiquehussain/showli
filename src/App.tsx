import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/features/layout/MainLayout';
import ProtectedRoute from './components/patterns/ProtectedRoute';
import ScrollToTop from './components/patterns/ScrollToTop';

// --- Lazy Loaded Pages ---
const HomePage = lazy(() => import('./pages/HomePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MediaDetailsPage = lazy(() => import('./pages/MediaDetailsPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const CollectionDetailsPage = lazy(() => import('./pages/CollectionDetailsPage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const PersonPage = lazy(() => import('./pages/PersonPage'));

// --- App Root ---

function App() {
  return (
    <Router>
      <ScrollToTop />
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
    </Router>
  );
}

export default App;
