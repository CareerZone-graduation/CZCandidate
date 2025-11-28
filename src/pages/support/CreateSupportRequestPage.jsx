import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SupportRequestForm from '../../components/support/SupportRequestForm';
import { createSupportRequest } from '../../services/supportRequestService';

const CreateSupportRequestPage = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ data, files }) => createSupportRequest(data, files),
    onSuccess: () => {
      toast.success('Yêu cầu hỗ trợ đã được gửi thành công!');
      navigate('/support');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  });

  const handleSubmit = async (data, files) => {
    mutation.mutate({ data, files });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/support')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Tạo Yêu cầu hỗ trợ</h1>
          <p className="mt-2 text-gray-600">
            Mô tả chi tiết vấn đề bạn đang gặp phải để chúng tôi có thể hỗ trợ bạn tốt nhất
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SupportRequestForm
            onSubmit={handleSubmit}
            isLoading={mutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateSupportRequestPage;
