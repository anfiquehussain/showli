import PageHeader from '@/components/patterns/PageHeader';
import Browse from '@/components/features/media/Browse';

const BrowsePage = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Browse" 
        description="Search movies and series, then narrow by genre, language, country, rating, and more."
      />
      
      <Browse />
    </div>
  );
};

export default BrowsePage;
