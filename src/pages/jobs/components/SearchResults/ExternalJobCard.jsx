import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Briefcase, DollarSign, Building2, ExternalLink, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ExternalJobCard = ({ job, onClick }) => {
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

    return (
        <Card
            className="overflow-hidden hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500 cursor-pointer group"
            onClick={() => onClick(job)}
        >
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="w-16 h-16 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 bg-white p-2">
                        <img
                            src={job.company?.logo || defaultLogo}
                            alt={job.company?.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = defaultLogo; }}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                    {job.title}
                                </h3>
                                <div className="flex items-center text-sm text-gray-600 mt-1 space-x-2">
                                    <span className="font-medium flex items-center">
                                        <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                                        {job.company?.name}
                                    </span>
                                    {job.source && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex items-center">
                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                Từ {job.source}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <span className="text-primary font-medium text-sm sm:text-base flex items-center justify-end">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    {renderSalary()}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center justify-end mt-1">
                                    <CalendarDays className="w-3 h-3 mr-1" />
                                    {getPostedTime()}
                                </span>
                            </div>
                        </div>

                        {/* Info Tags */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
                            <div className="flex items-center text-sm text-gray-600 truncate">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{job.location}</span>
                                {job.isRemote && (
                                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                        Remote
                                    </Badge>
                                )}
                            </div>
                            {job.type && (
                                <div className="flex items-center text-sm text-gray-600 truncate">
                                    <Briefcase className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{job.type.replace(/_/g, ' ')}</span>
                                </div>
                            )}
                        </div>

                        {/* Required Skills summary */}
                        {job.requiredSkills && job.requiredSkills.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {job.requiredSkills.slice(0, 4).map((skill, index) => (
                                    <span key={index} className="px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">
                                        {skill}
                                    </span>
                                ))}
                                {job.requiredSkills.length > 4 && (
                                    <span className="px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-md">
                                        +{job.requiredSkills.length - 4} nữa
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ExternalJobCard;
