import { useState, useEffect } from 'react';

/**
 * Hook để theo dõi vị trí scroll và xác định xem có nên sử dụng theme trắng cho header hay không
 * @param {number} threshold - Ngưỡng scroll để chuyển đổi theme (mặc định: 500px)
 * @returns {boolean} isHeaderWhite - true nếu header nên có theme trắng
 */
export const useHeaderTheme = (threshold = 500) => {
  const [isHeaderWhite, setIsHeaderWhite] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsHeaderWhite(scrollY < threshold);
    };

    // Gọi ngay lập tức để set initial state
    handleScroll();

    // Thêm event listener với throttle để tối ưu performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [threshold]);

  return isHeaderWhite;
};