import { useCallback, useEffect, useState } from 'react';
import { FaArrowUp } from "react-icons/fa";
const ScrollToTopButton = ({ scrollContainerRef = null }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollTop = scrollContainerRef?.current
      ? scrollContainerRef.current.scrollTop
      : window.scrollY;

    setIsVisible(scrollTop > 100); // Show after 100px of scroll
  }, [scrollContainerRef]);

  useEffect(() => {
    const element = scrollContainerRef?.current || window;

    element.addEventListener('scroll', handleScroll);
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, scrollContainerRef]);

  const scrollToTop = useCallback(() => {
    const element = scrollContainerRef?.current || window;

    if (element === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      element.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [scrollContainerRef]);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        padding: '5px 10px',
        fontSize: '30px',
        backgroundColor: 'rgb(7, 174, 240)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        zIndex: 1000,
      }}
    >
      <FaArrowUp />
    </button>
  );
};

export default ScrollToTopButton;
