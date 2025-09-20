import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook để theo dõi vị trí scroll và xác định xem có nên sử dụng theme trắng cho header hay không.
 * Hiệu ứng này chỉ được áp dụng trên trang chủ.
 * @param {number} threshold - Ngưỡng scroll để chuyển đổi theme (mặc định: 500px)
 * @returns {boolean} isHeaderWhite - true nếu header nên có theme trắng
 */
export const useHeaderTheme = (threshold = 500) => {
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  
  // Chỉ bắt đầu với theme trắng nếu ở trang chủ, ngược lại thì không.
  const [isHeaderWhite, setIsHeaderWhite] = useState(isHomepage);

  useEffect(() => {
    // Nếu không phải trang chủ, đảm bảo header không phải màu trắng và không làm gì thêm.
    if (!isHomepage) {
      setIsHeaderWhite(false);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Chỉ khi ở trang chủ, ta mới cập nhật theme dựa trên vị trí cuộn
      setIsHeaderWhite(scrollY < threshold);
    };

    // Gọi ngay lập tức để set initial state cho trang chủ
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

    // Cleanup listener khi component unmount hoặc khi không còn ở trang chủ
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [isHomepage, threshold]); // Chạy lại effect khi isHomepage hoặc threshold thay đổi

  return isHeaderWhite;
};