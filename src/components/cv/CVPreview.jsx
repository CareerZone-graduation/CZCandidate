import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const CVPreview = ({ cv, className = "", onClick }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // URL của trang render CV
    const renderUrl = `/render.html?cvId=${cv._id}`;

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    const handleClick = (e) => {
        // Ngăn sự kiện lan truyền lên parent
        e.stopPropagation();
        
        if (onClick) {
            onClick(e);
        } else {
            // Mặc định mở trong tab mới
            window.open(renderUrl, '_blank');
        }
    };

    // Fallback preview nếu iframe không load được
    const renderFallback = () => {
        const cvData = cv.cvData || {};
        const personalInfo = cvData.personalInfo || {};
        
        return (
            <div className="w-full h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-3 border-b">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                        {personalInfo.fullName || 'Họ và tên'}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                        {personalInfo.title || 'Vị trí ứng tuyển'}
                    </div>
                </div>
                <div className="p-3 space-y-2">
                    <div className="text-xs text-gray-500 text-center">
                        Không thể tải preview
                    </div>
                </div>
            </div>
        );
    };

    const renderPreview = () => {
        if (hasError) {
            return renderFallback();
        }

        return (
            <>
                {/* Loading state */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Đang tải preview...</p>
                        </div>
                    </div>
                )}
                
                {/* Iframe hiển thị CV thực tế */}
                <div className="w-full h-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <iframe
                        src={renderUrl}
                        className={`w-full h-full border-0 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        title={`CV Preview - ${cv.name}`}
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        sandbox="allow-same-origin allow-scripts"
                        style={{
                            pointerEvents: 'none', // Ngăn tương tác với iframe trong preview
                            transform: 'scale(0.25)', // Thu nhỏ để vừa khung (A4 -> thumbnail)
                            transformOrigin: 'top left',
                            width: '400%', // Tăng kích thước để scale về đúng tỷ lệ
                            height: '400%'
                        }}
                    />
                </div>
            </>
        );
    };

    return (
        <div 
            className={`aspect-[3/4] relative group cursor-pointer ${className}`}
            onClick={handleClick}
        >
            {renderPreview()}

            {/* Overlay khi hover - chỉ hiển thị khi không loading */}
            {!isLoading && !hasError && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-lg">
                        Click để xem chi tiết
                    </div>
                </div>
            )}
        </div>
    );
};

export default CVPreview;
