import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Zap, Coffee, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SampleDataSpotlight = ({ onSelectSample, onDismiss }) => {
  const [targetRect, setTargetRect] = useState(null);
  const spotlightRef = useRef(null);

  useEffect(() => {
    // Tìm element "Dùng dữ liệu mẫu" trong sidebar
    const findSampleDataSection = () => {
      // Thử nhiều cách tìm element
      let targetElement = null;
      
      // Cách 1: Tìm theo class gradient
      const gradientElements = document.querySelectorAll('.bg-gradient-to-r');
      for (let el of gradientElements) {
        if (el.textContent.includes('Dùng dữ liệu mẫu')) {
          targetElement = el;
          break;
        }
      }
      
      // Cách 2: Tìm theo text content trực tiếp
      if (!targetElement) {
        const allElements = document.querySelectorAll('*');
        for (let el of allElements) {
          if (el.textContent.trim().startsWith('Dùng dữ liệu mẫu') && 
              el.children.length > 0) {
            targetElement = el;
            break;
          }
        }
      }
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Thử tìm nhiều lần với delay tăng dần
    const timers = [
      setTimeout(findSampleDataSection, 100),
      setTimeout(findSampleDataSection, 300),
      setTimeout(findSampleDataSection, 500),
    ];
    
    // Update khi resize
    window.addEventListener('resize', findSampleDataSection);
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('resize', findSampleDataSection);
    };
  }, []);

  const handleSampleSelect = (sampleType) => {
    onSelectSample(sampleType);
  };

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-300">
      {/* Dark overlay - block clicks everywhere except spotlight */}
      <div 
        className="absolute inset-0"
        onClick={onDismiss}
        style={{ pointerEvents: 'auto' }}
      >
        {/* SVG mask để tạo spotlight effect */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="spotlight-mask">
              {/* White background */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black cutout cho spotlight area */}
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          {/* Apply mask */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Highlight border cho spotlight area */}
        {targetRect && (
          <div
            className="absolute border-4 border-blue-500 rounded-xl shadow-2xl pointer-events-none"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 60px rgba(59, 130, 246, 0.5)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
      </div>

      {/* Transparent clickable area over spotlight - allows clicks to pass through */}
      {targetRect && (
        <div
          className="absolute"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            pointerEvents: 'none', // Allow clicks to pass through to elements below
            zIndex: 1,
          }}
        />
      )}

      {/* Instruction card */}
      {targetRect && (
        <div
          className="absolute bg-white rounded-xl shadow-2xl p-6 max-w-md animate-in slide-in-from-bottom-4 duration-500"
          style={{
            top: Math.min(targetRect.top + targetRect.height + 24, window.innerHeight - 400),
            left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 400)),
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            zIndex: 10,
            pointerEvents: 'auto', // Ensure card is clickable
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside card
        >
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Bắt đầu nhanh với dữ liệu mẫu! 🚀
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Chọn một trong các mẫu dữ liệu để xem CV của bạn sẽ trông như thế nào
                </p>
              </div>
            </div>

            {/* Arrow pointing up */}
            <div className="flex justify-center py-2">
              <div className="flex flex-col items-center text-blue-600 animate-bounce">
                <ArrowDown className="w-6 h-6 rotate-180" />
                <span className="text-xs font-medium mt-1">Click vào vùng sáng phía trên</span>
              </div>
            </div>
            
            {/* Info tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>💡 Mẹo:</strong> Bạn có thể click trực tiếp vào các nút trong vùng được tô sáng ở trên, 
                hoặc chọn nhanh bên dưới.
              </p>
            </div>

            {/* Quick sample buttons */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Hoặc chọn nhanh:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSampleSelect('default')}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <Zap className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Kỹ sư</span>
                </button>
                <button
                  onClick={() => handleSampleSelect('creative')}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                >
                  <Sparkles className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Thiết kế</span>
                </button>
                <button
                  onClick={() => handleSampleSelect('minimal')}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all group"
                >
                  <Coffee className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Marketing</span>
                </button>
              </div>
            </div>

            {/* Skip button */}
            <div className="pt-2 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={onDismiss}
                className="w-full text-gray-600 hover:text-gray-900"
              >
                Bỏ qua, tôi sẽ tự điền
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback: nếu không tìm thấy target, hiển thị message */}
      {!targetRect && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md text-center">
            <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Dùng dữ liệu mẫu
            </h3>
            <p className="text-gray-600 mb-6">
              Chọn một mẫu dữ liệu để bắt đầu nhanh:
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => handleSampleSelect('default')}
                className="w-full"
                variant="outline"
              >
                <Zap className="w-4 h-4 mr-2" />
                Kỹ sư phần mềm
              </Button>
              <Button
                onClick={() => handleSampleSelect('creative')}
                className="w-full"
                variant="outline"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Nhà thiết kế
              </Button>
              <Button
                onClick={() => handleSampleSelect('minimal')}
                className="w-full"
                variant="outline"
              >
                <Coffee className="w-4 h-4 mr-2" />
                Marketing
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={onDismiss}
              className="w-full mt-4"
            >
              Bỏ qua
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleDataSpotlight;
