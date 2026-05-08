import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component ensures that the browser window scrolls to the top
 * whenever the route changes. This is essential for a smooth navigation 
 * experience in SPAs where the scroll position might otherwise persist.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use instant to prevent awkward scrolling animation during navigation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
