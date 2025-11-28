import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, Eye, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import MessageThread from '../../components/support/MessageThread';
import { getSupportRequestById } from '../../services/supportRequestService';

const STATUS_CONFIG = {
  pending: { label: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  resolved: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-800' }
};

const PRIORITY_CONFIG = {
  low: { label: 'Thấp', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Trung bình', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Cao', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Khẩn cấp', color: 'bg-red-100 text-red-800' }
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
  const [previewImage, setPreviewImage] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['supportRequest', id],
    queryFn: () => getSupportRequestById(id)
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const request = data?.data;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/support')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </button>

        {/* Request Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{request?.subject}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
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

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Mô tả:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{request?.description}</p>
          </div>

          {request?.attachments && request.attachments.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-gray-900 mb-3">Tệp đính kèm ({request.attachments.length}):</h3>
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
                        <div className="flex items-center justify-center h-48 bg-gray-100">
                          <Paperclip className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-3 bg-white">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{(file.fileSize / 1024).toFixed(2)} KB</p>
                          {!isImage && <a href={file.url} download={file.filename} className="text-blue-600 hover:text-blue-800"><Download className="w-4 h-4" /></a>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Admin Responses - Read Only */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Phản hồi từ Admin</h2>
          {request?.adminResponses && request.adminResponses.length > 0 ? (
            <div className="space-y-4">
              {request.adminResponses.map((response, index) => (
                <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">{response.adminName}</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(response.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{response.response}</p>
                  {response.statusChange && (
                    <div className="mt-2 text-sm text-gray-500">
                      Trạng thái: {STATUS_CONFIG[response.statusChange.from]?.label} → {STATUS_CONFIG[response.statusChange.to]?.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Chưa có phản hồi từ admin</p>
          )}
        </div>

        {/* Messages Thread - Read Only */}
        {request?.messages && request.messages.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử tin nhắn</h2>
            <MessageThread
              messages={request.messages}
              adminResponses={[]}
              currentUserId={request?.requester?.userId}
            />
          </div>
        )}

        {/* Notice - No messaging allowed */}
        <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
          <p>Nếu bạn cần hỗ trợ thêm, vui lòng tạo yêu cầu hỗ trợ mới tại trang <button onClick={() => navigate('/contact')} className="text-primary hover:underline font-medium">Liên hệ</button></p>
        </div>
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
