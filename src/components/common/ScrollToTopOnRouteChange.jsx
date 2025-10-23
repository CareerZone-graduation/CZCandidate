import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTopOnRouteChange Component
 * Automatically scrolls to top of page when route changes
 * 
 * Usage: Place this component inside BrowserRouter in AppRouter
 * 
 * Features:
 * - Scrolls to top on every route change
 * - Uses 'instant' behavior for immediate scroll (no animation)
 * - Handles both main window and any scrollable containers
 */
const ScrollToTopOnRouteChange = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll main window to top immediately
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant', // Use 'instant' for immediate scroll
        });

        // Also scroll any scrollable containers to top
        // This is useful for layouts with nested scroll containers
        const scrollContainers = document.querySelectorAll('[data-scroll-container]');
        scrollContainers.forEach(container => {
            container.scrollTop = 0;
        });

        // Force scroll for some browsers that might cache scroll position
        // Use setTimeout to ensure it runs after React finishes rendering
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 0);
    }, [pathname]);

    return null; // This component doesn't render anything
};

export default ScrollToTopOnRouteChange;
