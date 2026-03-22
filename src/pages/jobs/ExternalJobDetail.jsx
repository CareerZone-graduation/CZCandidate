import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, MapPin, Briefcase, DollarSign, CalendarDays, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ExternalJobDetail = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { jobId } = useParams();

    // Job data is passed via router state from the search page
    const job = state?.job;

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy thông tin công việc</h2>
                <p className="text-gray-500 mb-8">Dữ liệu công việc này không có sẵn. Vui lòng quay lại trang tìm kiếm.</p>
                <Button onClick={() => navigate('/jobs')} variant="default">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại trang tìm kiếm
                </Button>
            </div>
        );
    }

    const defaultLogo = "https://ui-avatars.com/api/?name=" + encodeURIComponent(job.company?.name || 'Company') + "&background=random";

    const renderSalary = () => {
        if (!job.salary?.min && !job.salary?.max) return 'Thỏa thuận';
        const min = job.salary.min ? `$${job.salary.min}` : '';
        const max = job.salary.max ? `$${job.salary.max}` : '';
        const period = job.salary.period ? `/${job.salary.period.toLowerCase()}` : '';

        if (min && max) return `${min} - ${max}${period}`;
        return `${min || max}${period}`;
    };

    const getPostedTime = () => {
        if (!job.postedAt) return 'Không rõ';
        const parsedDate = new Date(job.postedAt);
        if (!isNaN(parsedDate.getTime())) {
            return formatDistanceToNow(parsedDate, { addSuffix: true, locale: vi });
        }
        let timeStr = String(job.postedAt).toLowerCase();
        if (timeStr.includes("today")) return "Hôm nay";
        if (timeStr.includes("yesterday")) return "Hôm qua";
        if (timeStr.includes("just now")) return "Vừa xong";
        timeStr = timeStr.replace("days", "ngày").replace("day", "ngày").replace("hours", "giờ").replace("hour", "giờ").replace("minutes", "phút").replace("minute", "phút").replace("weeks", "tuần").replace("week", "tuần").replace("months", "tháng").replace("month", "tháng").replace("ago", "trước").replace("a ", "1 ").replace("an ", "1 ");

        return timeStr.charAt(0).toUpperCase() + timeStr.slice(1).trim();
    };

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Quay lại danh sách
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-gray-100 overflow-hidden flex-shrink-0 bg-white p-3 shadow-sm">
                                    <img
                                        src={job.company?.logo || defaultLogo}
                                        alt={job.company?.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => { e.target.src = defaultLogo; }}
                                    />
                                </div>

                                <div className="flex-1">
                                    <div className="flex max-sm:flex-col justify-between items-start gap-4">
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                                {job.title}
                                            </h1>
                                            <div className="text-lg font-medium text-primary mt-2">
                                                {job.company?.name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mt-6">
                                        <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm font-medium">{job.location}</span>
                                        </div>
                                        {job.type && (
                                            <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                                                <span className="text-sm font-medium">{job.type.replace(/_/g, ' ')}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm font-medium">{renderSalary()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button for Mobile */}
                            <div className="mt-8 pt-6 border-t border-gray-100 lg:hidden">
                                <Button
                                    className="w-full text-base h-12"
                                    onClick={() => window.open(job.applyUrl, '_blank', 'noopener,noreferrer')}
                                >
                                    Ứng tuyển trên {job.source || 'nguồn gốc'}
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>

                        {/* Description & Requirements */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">

                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <div className="w-1.5 h-6 bg-primary rounded-full mr-3"></div>
                                    Mô tả công việc
                                </h2>
                                <div className="prose prose-blue max-w-none text-gray-600 text-justify">
                                    {/* Since JSearch might return formatted text or plain text, simplistic rendering here. */}
                                    <p className="whitespace-pre-line">{job.description || 'Không có mô tả chi tiết.'}</p>
                                </div>
                            </section>

                            {job.requiredSkills?.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <div className="w-1.5 h-6 bg-primary rounded-full mr-3"></div>
                                        Kỹ năng yêu cầu
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {job.requiredSkills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 font-medium text-sm rounded-lg border border-blue-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">

                            {/* Application Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-6 text-lg">Thông tin ứng tuyển</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center text-gray-600">
                                        <CalendarDays className="w-5 h-5 mr-3 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Ngày đăng</p>
                                            <p className="text-sm font-medium text-gray-900">{getPostedTime()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-gray-600">
                                        <ExternalLink className="w-5 h-5 mr-3 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Nguồn tin</p>
                                            <p className="text-sm font-medium text-gray-900">{job.source || 'Không rõ'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 space-y-3 hidden lg:block">
                                    <Button
                                        className="w-full text-base h-12 shadow-sm hover:shadow-md transition-shadow"
                                        onClick={() => window.open(job.applyUrl, '_blank', 'noopener,noreferrer')}
                                    >
                                        Ứng tuyển ngay
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </Button>
                                    <p className="text-xs text-center text-gray-500">
                                        Bạn sẽ được chuyển hướng đến trang web của <span className="font-medium">{job.source}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Disclaimer Notice */}
                            <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
                                <h4 className="flex items-center text-sm font-semibold text-orange-800 mb-2">
                                    Lưu ý về tin tuyển dụng ngoài
                                </h4>
                                <p className="text-xs text-orange-700 leading-relaxed text-justify">
                                    Đây là tin tuyển dụng được tổng hợp từ internet và không được quản lý trực tiếp bởi CareerZone.
                                    Vui lòng kiểm tra kỹ thông tin nhà tuyển dụng trước khi nộp hồ sơ.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ExternalJobDetail;
