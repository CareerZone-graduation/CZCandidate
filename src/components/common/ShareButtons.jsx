import React, { useState } from 'react';
import { Link, Check, Share2 } from 'lucide-react';
import { FaFacebook, FaLinkedin } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * ShareButtons Component
 * Hiển thị nút chia sẻ với các icon mạng xã hội, hover để xem tùy chọn
 * 
 * @param {Object} props
 * @param {string} props.shareUrl - URL để chia sẻ (mặc định là URL hiện tại)
 * @param {string} props.jobId - ID của job để tạo share preview URL (cho Facebook OG)
 * @param {string} props.className - Class CSS tùy chỉnh
 */
const ShareButtons = ({ shareUrl, jobId, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Lấy URL trang hiện tại nếu không được cung cấp
  const urlToShare = shareUrl || window.location.href;
  
  // URL cho Facebook share - sử dụng backend preview endpoint nếu có jobId
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const facebookShareUrl = jobId 
    ? `${API_BASE_URL}/api/share-preview/jobs/${jobId}`
    : urlToShare;
    console.log("facebookShareUrl:", facebookShareUrl);

  /**
   * Xử lý sao chép liên kết vào clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(urlToShare);
      setCopied(true);

      // Reset trạng thái "Copied!" sau 2 giây
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast.error('Không thể sao chép liên kết');
    }
  };

  /**
   * Xử lý chia sẻ lên Facebook
   * Sử dụng backend preview endpoint để Facebook crawler có thể lấy được OG tags
   */
  const handleFacebookShare = () => {
    const shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookShareUrl)}`;

    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      shareLink,
      'facebook-share-dialog',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  /**
   * Xử lý chia sẻ lên LinkedIn
   */
  const handleLinkedInShare = () => {
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlToShare)}`;

    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      linkedInShareUrl,
      'linkedin-share-dialog',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {/* Main Share Button */}
      <Button
        variant="outline"
        className="px-6 py-2.5 font-medium transition-all duration-200 hover:bg-muted flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        <span>Chia sẻ</span>
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border">
          <FaFacebook className="w-5 h-5 text-[#1877F2]" />
          <FaLinkedin className="w-5 h-5 text-[#0A66C2]" />
        </div>
      </Button>

      {/* Hover Options - Wrapper với padding để tránh mất hover */}
      {showOptions && (
        <div className="absolute top-full right-0 pt-1 z-50">
          <div className="bg-white border border-border rounded-lg shadow-lg py-2 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={handleFacebookShare}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left"
            >
              <FaFacebook className="w-5 h-5 text-[#1877F2]" />
              <span className="text-sm font-medium">Chia sẻ lên Facebook</span>
            </button>

            <button
              onClick={handleLinkedInShare}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left"
            >
              <FaLinkedin className="w-5 h-5 text-[#0A66C2]" />
              <span className="text-sm font-medium">Chia sẻ lên LinkedIn</span>
            </button>

            <div className="border-t border-border my-1"></div>

            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Link className="w-5 h-5" />
                  <span className="text-sm font-medium">Sao chép liên kết</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButtons;
