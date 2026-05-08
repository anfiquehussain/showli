import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/features/layout/MainLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MediaDetailsPage from './pages/MediaDetailsPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailsPage from './pages/CollectionDetailsPage';
import ProtectedRoute from './components/patterns/ProtectedRoute';
import ScrollToTop from './components/patterns/ScrollToTop';

// --- App Root ---

function App() {
  return (
    <Router>
      <ScrollToTop />
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MediaDetailsPage />} />
          <Route path="/tv/:id" element={<MediaDetailsPage />} />
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
      </MainLayout>
    </Router>
  );
}

export default App;
