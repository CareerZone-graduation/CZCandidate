import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, Eye, Download, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import MessageThread from '../../components/support/MessageThread';
import AttachmentUploader from '../../components/common/AttachmentUploader';
import {
  getSupportRequestById,
  addFollowUpMessage
} from '../../services/supportRequestService';

const STATUS_CONFIG = {
  pending: { label: 'Đang chờ', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' },
  'in-progress': { label: 'Đang xử lý', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
  resolved: { label: 'Đã giải quyết', color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' },
  closed: { label: 'Đã đóng', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' }
};

const PRIORITY_CONFIG = {
  low: { label: 'Thấp', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' },
  medium: { label: 'Trung bình', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
  high: { label: 'Cao', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400' },
  urgent: { label: 'Khẩn cấp', color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' }
};

const CATEGORY_LABELS = {
  'technical-issue': 'Vấn đề kỹ thuật',
  'account-issue': 'Vấn đề tài khoản',
  'payment-issue': 'Vấn đề thanh toán',
  'job-posting-issue': 'Vấn đề đăng tin',
  'application-issue': 'Vấn đề ứng tuyển',
  'general-inquiry': 'Thắc mắc chung'
};

const SupportRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [showAttachments, setShowAttachments] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['supportRequest', id],
    queryFn: () => getSupportRequestById(id)
  });

  const mutation = useMutation({
    mutationFn: () => addFollowUpMessage(id, message, files),
    onSuccess: () => {
      toast.success('Tin nhắn đã được gửi');
      setMessage('');
      setFiles([]);
      setShowAttachments(false);
      queryClient.invalidateQueries(['supportRequest', id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Vui lòng nhập nội dung tin nhắn');
      return;
    }
    mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const request = data?.data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/support')}
          className="flex items-center space-x-2 text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </button>

        {/* Request Info */}
        <div className="bg-white dark:bg-card rounded-lg shadow-sm p-6 mb-6 border dark:border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">{request?.subject}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-muted-foreground">
                <span>Danh mục: {CATEGORY_LABELS[request?.category] || request?.category}</span>
                <span>•</span>
                <span>Tạo lúc: {format(new Date(request?.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[request?.status]?.color}`}>
                {STATUS_CONFIG[request?.status]?.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_CONFIG[request?.priority]?.color}`}>
                {PRIORITY_CONFIG[request?.priority]?.label}
              </span>
            </div>
          </div>

          <div className="border-t dark:border-border pt-4">
            <h3 className="font-medium text-gray-900 dark:text-foreground mb-2">Mô tả:</h3>
            <p className="text-gray-700 dark:text-muted-foreground whitespace-pre-wrap">{request?.description}</p>
          </div>

          {request?.attachments && request.attachments.length > 0 && (
            <div className="border-t dark:border-border pt-4 mt-4">
              <h3 className="font-medium text-gray-900 dark:text-foreground mb-3">Tệp đính kèm ({request.attachments.length}):</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.attachments.map((file, index) => {
                  const isImage = file.fileType?.startsWith('image/');
                  return (
                    <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {isImage ? (
                        <div className="relative group cursor-pointer" onClick={() => setPreviewImage(file)}>
                          <img src={file.url} alt={file.filename} className="w-full h-48 object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="px-3 py-2 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 flex items-center gap-2">
                              <Eye className="w-4 h-4" />Xem
                            </button>
                            <a href={file.url} download={file.filename} onClick={(e) => e.stopPropagation()} className="px-3 py-2 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 flex items-center gap-2">
                              <Download className="w-4 h-4" />Tải về
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-muted">
                          <Paperclip className="w-12 h-12 text-gray-400 dark:text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-3 bg-white dark:bg-card border-t dark:border-border">
                        <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">{file.filename}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500 dark:text-muted-foreground">{(file.fileSize / 1024).toFixed(2)} KB</p>
                          {!isImage && <a href={file.url} download={file.filename} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"><Download className="w-4 h-4" /></a>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Messages Thread */}
        <div className="bg-white dark:bg-card rounded-lg shadow-sm p-6 mb-6 border dark:border-border">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b dark:border-border">
            <svg className="w-5 h-5 text-gray-600 dark:text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">Lịch sử tin nhắn</h2>
          </div>
          <MessageThread
            messages={request?.messages || []}
            adminResponses={request?.adminResponses || []}
          />
        </div>

        {/* Follow-up Form */}
        {(request?.status === 'pending' || request?.status === 'in-progress') && (
          <div className="bg-white dark:bg-card rounded-lg shadow-sm p-6 border dark:border-border">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
              Thêm tin nhắn
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-background dark:text-foreground"
                placeholder="Nhập tin nhắn của bạn..."
                disabled={mutation.isPending}
              />

              {showAttachments && (
                <AttachmentUploader files={files} onChange={setFiles} />
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="flex items-center space-x-2 text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
                >
                  <Paperclip className="w-5 h-5" />
                  <span>{showAttachments ? 'Ẩn' : 'Đính kèm tệp'}</span>
                </button>

                <button
                  type="submit"
                  disabled={mutation.isPending || !message.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  <span>
                    {mutation.isPending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {request?.status !== 'pending' && request?.status !== 'in-progress' && (
          <div className="bg-gray-100 dark:bg-muted rounded-lg p-4 text-center text-gray-600 dark:text-muted-foreground">
            Yêu cầu này đã được{' '}
            {request?.status === 'resolved' ? 'giải quyết' : 'đóng'}. Bạn không
            thể thêm tin nhắn mới.
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setPreviewImage(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={previewImage.url} alt={previewImage.filename} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
};

export default SupportRequestDetailPage;
