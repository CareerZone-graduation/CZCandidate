import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage } from '../../services/api';

const ALLOWED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ImageUploader = ({ imageUrl, onUploadSuccess, onClear }) => {
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef(null);

    const validateFile = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(extension)) {
            return `Loại tệp "${extension}" không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_FILE_TYPES.join(', ')}`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `Tệp "${file.name}" vượt quá giới hạn 5MB`;
        }
        return null;
    };

    const handleFile = async (file) => {
        const error = validateFile(file);
        if (error) {
            toast.error(error);
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await uploadImage(formData);
            if (response.success) {
                onUploadSuccess(response.data.url);
                toast.success('Tải ảnh lên thành công!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const handleClick = () => {
        if (!imageUrl && !isUploading) {
            inputRef.current?.click();
        }
    };

    return (
        <div className="w-full">
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleChange}
                className="hidden"
            />

            {imageUrl ? (
                <div className="relative group w-32 h-32 mx-auto">
                    <img
                        src={imageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                    />
                    <button
                        onClick={onClear}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa ảnh"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => inputRef.current?.click()}
                    >
                        <span className="text-white text-xs font-medium">Thay đổi</span>
                    </div>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center py-2">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                            <p className="text-sm text-gray-500">Đang tải lên...</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-1">
                                Tải ảnh lên
                            </p>
                            <p className="text-xs text-gray-500">
                                JPG, PNG, WEBP (Max 5MB)
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
